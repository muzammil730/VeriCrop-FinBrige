"""
VeriCrop FinBridge - Transfer Learning Training Script
======================================================

This script trains a crop damage classification model using Transfer Learning:
1. Base model: MobileNetV2 pre-trained on ImageNet
2. Fine-tuning: PlantVillage dataset (general crop diseases)
3. Further fine-tuning: Kaggle Indian Crop images (India-specific)

Target: 85%+ accuracy on validation set
Output: SavedModel format for deployment to SageMaker endpoint and Greengrass

Requirements: 3.1, 3.2
"""

import argparse
import os
import json
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np

# Hyperparameters
EPOCHS = 50
BATCH_SIZE = 32
LEARNING_RATE = 0.0001
INPUT_SIZE = 224
FREEZE_LAYERS = 100  # Freeze first 100 layers of MobileNetV2

# Damage classes
DAMAGE_CLASSES = ['pest', 'disease', 'drought', 'flood', 'hail', 'healthy']
NUM_CLASSES = len(DAMAGE_CLASSES)


def create_model(input_shape=(224, 224, 3), num_classes=6):
    """
    Create transfer learning model with MobileNetV2 base.
    
    Architecture:
    - MobileNetV2 base (pre-trained on ImageNet, first 100 layers frozen)
    - Global Average Pooling
    - Dense layer (256 units, ReLU)
    - Dropout (0.5)
    - Output layer (6 classes, Softmax)
    
    Args:
        input_shape: Input image shape (height, width, channels)
        num_classes: Number of output classes
        
    Returns:
        Compiled Keras model
    """
    # Load MobileNetV2 base model (pre-trained on ImageNet)
    base_model = MobileNetV2(
        input_shape=input_shape,
        include_top=False,  # Exclude ImageNet classifier
        weights='imagenet'
    )
    
    # Freeze first 100 layers for transfer learning
    for layer in base_model.layers[:FREEZE_LAYERS]:
        layer.trainable = False
    
    # Build model
    inputs = keras.Input(shape=input_shape)
    
    # Preprocessing for MobileNetV2
    x = keras.applications.mobilenet_v2.preprocess_input(inputs)
    
    # Base model
    x = base_model(x, training=False)
    
    # Classification head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    model = keras.Model(inputs, outputs)
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', 'top_k_categorical_accuracy']
    )
    
    return model


def create_data_generators(train_dir, val_dir, batch_size=32, input_size=224):
    """
    Create data generators with augmentation for training.
    
    Augmentation strategies:
    - Rotation: ±20 degrees (simulate different camera angles)
    - Width/Height shift: ±20% (simulate different framing)
    - Horizontal flip: Yes (crops can be viewed from any direction)
    - Zoom: ±20% (simulate different distances)
    - Brightness: ±20% (simulate different lighting conditions)
    
    Args:
        train_dir: Directory containing training images
        val_dir: Directory containing validation images
        batch_size: Batch size for training
        input_size: Input image size (square)
        
    Returns:
        train_generator, val_generator
    """
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )
    
    # Validation data (no augmentation)
    val_datagen = ImageDataGenerator()
    
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(input_size, input_size),
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(input_size, input_size),
        batch_size=batch_size,
        class_mode='categorical',
        shuffle=False
    )
    
    return train_generator, val_generator


def train_model(model, train_generator, val_generator, epochs=50, model_dir='/opt/ml/model'):
    """
    Train the model with callbacks for monitoring and early stopping.
    
    Callbacks:
    - ModelCheckpoint: Save best model based on validation accuracy
    - EarlyStopping: Stop training if validation accuracy doesn't improve
    - ReduceLROnPlateau: Reduce learning rate when validation loss plateaus
    - TensorBoard: Log metrics for visualization
    
    Args:
        model: Compiled Keras model
        train_generator: Training data generator
        val_generator: Validation data generator
        epochs: Number of training epochs
        model_dir: Directory to save trained model
        
    Returns:
        Training history
    """
    # Create callbacks
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            filepath=os.path.join(model_dir, 'best_model.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        keras.callbacks.TensorBoard(
            log_dir=os.path.join(model_dir, 'logs'),
            histogram_freq=1
        )
    ]
    
    # Train model
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=val_generator,
        callbacks=callbacks,
        verbose=1
    )
    
    return history


def save_model(model, model_dir='/opt/ml/model'):
    """
    Save model in SavedModel format for SageMaker deployment.
    
    Args:
        model: Trained Keras model
        model_dir: Directory to save model
    """
    # Save in SavedModel format
    model.save(os.path.join(model_dir, 'saved_model'), save_format='tf')
    
    # Save class labels
    class_labels = {i: label for i, label in enumerate(DAMAGE_CLASSES)}
    with open(os.path.join(model_dir, 'class_labels.json'), 'w') as f:
        json.dump(class_labels, f)
    
    print(f"Model saved to {model_dir}")


def evaluate_model(model, val_generator):
    """
    Evaluate model on validation set and print metrics.
    
    Args:
        model: Trained Keras model
        val_generator: Validation data generator
        
    Returns:
        Evaluation metrics
    """
    results = model.evaluate(val_generator, verbose=1)
    
    print("\n" + "="*50)
    print("VALIDATION RESULTS")
    print("="*50)
    print(f"Loss: {results[0]:.4f}")
    print(f"Accuracy: {results[1]:.4f} (Target: 0.85)")
    print(f"Top-2 Accuracy: {results[2]:.4f}")
    print("="*50 + "\n")
    
    return results


def main():
    """
    Main training function for SageMaker.
    
    SageMaker provides the following environment variables:
    - SM_CHANNEL_TRAIN: Path to training data
    - SM_CHANNEL_VALIDATION: Path to validation data
    - SM_CHANNEL_FINETUNE: Path to fine-tuning data (Indian crops)
    - SM_MODEL_DIR: Path to save trained model
    - SM_NUM_GPUS: Number of GPUs available
    """
    parser = argparse.ArgumentParser()
    
    # Hyperparameters
    parser.add_argument('--epochs', type=int, default=EPOCHS)
    parser.add_argument('--batch-size', type=int, default=BATCH_SIZE)
    parser.add_argument('--learning-rate', type=float, default=LEARNING_RATE)
    parser.add_argument('--input-size', type=int, default=INPUT_SIZE)
    parser.add_argument('--freeze-layers', type=int, default=FREEZE_LAYERS)
    
    # SageMaker directories
    parser.add_argument('--model-dir', type=str, default=os.environ.get('SM_MODEL_DIR', '/opt/ml/model'))
    parser.add_argument('--train', type=str, default=os.environ.get('SM_CHANNEL_TRAIN', '/opt/ml/input/data/train'))
    parser.add_argument('--validation', type=str, default=os.environ.get('SM_CHANNEL_VALIDATION', '/opt/ml/input/data/validation'))
    parser.add_argument('--finetune', type=str, default=os.environ.get('SM_CHANNEL_FINETUNE', '/opt/ml/input/data/finetune'))
    
    args = parser.parse_args()
    
    print("\n" + "="*50)
    print("VERICROP FINBRIDGE - TRANSFER LEARNING TRAINING")
    print("="*50)
    print(f"Epochs: {args.epochs}")
    print(f"Batch Size: {args.batch_size}")
    print(f"Learning Rate: {args.learning_rate}")
    print(f"Input Size: {args.input_size}x{args.input_size}")
    print(f"Freeze Layers: {args.freeze_layers}")
    print(f"Train Dir: {args.train}")
    print(f"Validation Dir: {args.validation}")
    print(f"Fine-tune Dir: {args.finetune}")
    print(f"Model Dir: {args.model_dir}")
    print("="*50 + "\n")
    
    # Create model
    print("Creating MobileNetV2 transfer learning model...")
    model = create_model(
        input_shape=(args.input_size, args.input_size, 3),
        num_classes=NUM_CLASSES
    )
    model.summary()
    
    # Create data generators
    print("\nCreating data generators...")
    train_generator, val_generator = create_data_generators(
        train_dir=args.train,
        val_dir=args.validation,
        batch_size=args.batch_size,
        input_size=args.input_size
    )
    
    print(f"Training samples: {train_generator.samples}")
    print(f"Validation samples: {val_generator.samples}")
    print(f"Classes: {train_generator.class_indices}")
    
    # Train model
    print("\nStarting training...")
    history = train_model(
        model=model,
        train_generator=train_generator,
        val_generator=val_generator,
        epochs=args.epochs,
        model_dir=args.model_dir
    )
    
    # Evaluate model
    print("\nEvaluating model...")
    results = evaluate_model(model, val_generator)
    
    # Check if accuracy meets target
    if results[1] >= 0.85:
        print("✓ Model meets 85% accuracy target!")
    else:
        print("✗ Model does not meet 85% accuracy target. Consider:")
        print("  - Increasing training epochs")
        print("  - Adjusting learning rate")
        print("  - Adding more training data")
        print("  - Fine-tuning more layers")
    
    # Save model
    print("\nSaving model...")
    save_model(model, args.model_dir)
    
    print("\nTraining complete!")


if __name__ == '__main__':
    main()
