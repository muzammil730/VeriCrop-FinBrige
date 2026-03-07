# VeriCrop FinBridge - ML Training Setup

## Overview

This directory contains the training infrastructure for the VeriCrop crop damage classification model using Transfer Learning on Amazon SageMaker.

**Model Architecture:**
- Base: MobileNetV2 pre-trained on ImageNet
- Fine-tuning: PlantVillage dataset (54,000+ images, 38 crop-disease classes)
- Further fine-tuning: Kaggle Indian Crop images (India-specific crops)
- Target: 85%+ accuracy on validation set
- Output: SavedModel format for SageMaker endpoint and Greengrass deployment

**Requirements Satisfied:** 3.1, 3.2

## Training Strategy

### Transfer Learning Approach

1. **Base Model (MobileNetV2)**
   - Pre-trained on ImageNet (1.4M images, 1000 classes)
   - Lightweight architecture optimized for mobile/edge deployment
   - First 100 layers frozen to preserve learned features

2. **Fine-tuning on PlantVillage**
   - Dataset: 54,000+ images of healthy and diseased crops
   - Classes: 38 crop-disease combinations
   - Purpose: Learn general crop damage patterns

3. **Further Fine-tuning on Indian Crops**
   - Dataset: Kaggle Indian Crop images
   - Purpose: Adapt to India-specific crops and conditions
   - Classes mapped to: pest, disease, drought, flood, hail, healthy

### Hyperparameters

```python
EPOCHS = 50
BATCH_SIZE = 32
LEARNING_RATE = 0.0001
INPUT_SIZE = 224
FREEZE_LAYERS = 100
OPTIMIZER = Adam
```

### Data Augmentation

To improve model robustness, the following augmentation strategies are applied:

- **Rotation**: ±20 degrees (simulate different camera angles)
- **Width/Height shift**: ±20% (simulate different framing)
- **Horizontal flip**: Yes (crops can be viewed from any direction)
- **Zoom**: ±20% (simulate different distances)
- **Brightness**: ±20% (simulate different lighting conditions)

## Dataset Preparation

### PlantVillage Dataset

**Source:** https://www.kaggle.com/datasets/emmarex/plantdisease

**Structure:**
```
plantvillage/
├── train/
│   ├── pest/
│   ├── disease/
│   ├── drought/
│   ├── flood/
│   ├── hail/
│   └── healthy/
└── validation/
    ├── pest/
    ├── disease/
    ├── drought/
    ├── flood/
    ├── hail/
    └── healthy/
```

### Kaggle Indian Crop Dataset

**Source:** https://www.kaggle.com/datasets/atharvaingle/crop-disease-dataset

**Structure:**
```
indian-crops/
├── train/
│   ├── pest/
│   ├── disease/
│   ├── drought/
│   ├── flood/
│   ├── hail/
│   └── healthy/
└── validation/
    ├── pest/
    ├── disease/
    ├── drought/
    ├── flood/
    ├── hail/
    └── healthy/
```

### Upload to S3

```bash
# Upload PlantVillage dataset
aws s3 sync plantvillage/ s3://vericrop-training-data-<account-id>/plantvillage/

# Upload Indian Crop dataset
aws s3 sync indian-crops/ s3://vericrop-training-data-<account-id>/indian-crops/
```

## SageMaker Training Job

### Option 1: Using SageMaker Python SDK

```python
import sagemaker
from sagemaker.tensorflow import TensorFlow

# Get execution role
role = 'arn:aws:iam::<account-id>:role/VeriCrop-SageMaker-ExecutionRole'

# Create TensorFlow estimator
estimator = TensorFlow(
    entry_point='train.py',
    source_dir='ml-training',
    role=role,
    instance_count=1,
    instance_type='ml.p3.2xlarge',  # GPU instance for faster training
    framework_version='2.12',
    py_version='py310',
    hyperparameters={
        'epochs': 50,
        'batch-size': 32,
        'learning-rate': 0.0001,
        'input-size': 224,
        'freeze-layers': 100
    },
    output_path='s3://vericrop-training-data-<account-id>/models/',
    base_job_name='vericrop-crop-damage-classifier'
)

# Start training
estimator.fit({
    'train': 's3://vericrop-training-data-<account-id>/plantvillage/train/',
    'validation': 's3://vericrop-training-data-<account-id>/plantvillage/validation/',
    'finetune': 's3://vericrop-training-data-<account-id>/indian-crops/train/'
})
```

### Option 2: Using AWS Console

1. Navigate to **SageMaker Console** → **Training** → **Training jobs**
2. Click **Create training job**
3. Configure:
   - **Job name**: `vericrop-crop-damage-classifier`
   - **IAM role**: `VeriCrop-SageMaker-ExecutionRole`
   - **Algorithm source**: Your own algorithm container in ECR
   - **Instance type**: `ml.p3.2xlarge`
   - **Instance count**: 1
4. Input data configuration:
   - **Channel name**: `train`
   - **S3 location**: `s3://vericrop-training-data-<account-id>/plantvillage/train/`
   - **Channel name**: `validation`
   - **S3 location**: `s3://vericrop-training-data-<account-id>/plantvillage/validation/`
   - **Channel name**: `finetune`
   - **S3 location**: `s3://vericrop-training-data-<account-id>/indian-crops/train/`
5. Output data configuration:
   - **S3 location**: `s3://vericrop-training-data-<account-id>/models/`
6. Hyperparameters:
   - `epochs`: 50
   - `batch-size`: 32
   - `learning-rate`: 0.0001
   - `input-size`: 224
   - `freeze-layers`: 100
7. Click **Create training job**

### Option 3: Using AWS CLI

```bash
aws sagemaker create-training-job \
  --training-job-name vericrop-crop-damage-classifier \
  --role-arn arn:aws:iam::<account-id>:role/VeriCrop-SageMaker-ExecutionRole \
  --algorithm-specification \
    TrainingImage=763104351884.dkr.ecr.ap-south-1.amazonaws.com/tensorflow-training:2.12-gpu-py310 \
    TrainingInputMode=File \
  --input-data-config \
    '[
      {
        "ChannelName": "train",
        "DataSource": {
          "S3DataSource": {
            "S3DataType": "S3Prefix",
            "S3Uri": "s3://vericrop-training-data-<account-id>/plantvillage/train/",
            "S3DataDistributionType": "FullyReplicated"
          }
        }
      },
      {
        "ChannelName": "validation",
        "DataSource": {
          "S3DataSource": {
            "S3DataType": "S3Prefix",
            "S3Uri": "s3://vericrop-training-data-<account-id>/plantvillage/validation/",
            "S3DataDistributionType": "FullyReplicated"
          }
        }
      },
      {
        "ChannelName": "finetune",
        "DataSource": {
          "S3DataSource": {
            "S3DataType": "S3Prefix",
            "S3Uri": "s3://vericrop-training-data-<account-id>/indian-crops/train/",
            "S3DataDistributionType": "FullyReplicated"
          }
        }
      }
    ]' \
  --output-data-config \
    S3OutputPath=s3://vericrop-training-data-<account-id>/models/ \
  --resource-config \
    InstanceType=ml.p3.2xlarge \
    InstanceCount=1 \
    VolumeSizeInGB=50 \
  --stopping-condition \
    MaxRuntimeInSeconds=86400 \
  --hyper-parameters \
    epochs=50 \
    batch-size=32 \
    learning-rate=0.0001 \
    input-size=224 \
    freeze-layers=100
```

## Model Deployment

### Deploy to SageMaker Endpoint

```python
# Deploy trained model to endpoint
predictor = estimator.deploy(
    initial_instance_count=1,
    instance_type='ml.m5.xlarge',
    endpoint_name='vericrop-crop-damage-classifier'
)

# Test inference
import numpy as np
from PIL import Image

# Load test image
image = Image.open('test_crop_damage.jpg')
image = image.resize((224, 224))
image_array = np.array(image) / 255.0
image_array = np.expand_dims(image_array, axis=0)

# Predict
result = predictor.predict(image_array)
print(f"Predicted class: {result['predictions'][0]}")
print(f"Confidence: {result['confidence']}")
```

### Compile for Edge Deployment (SageMaker Neo)

```python
import boto3

sagemaker_client = boto3.client('sagemaker', region_name='ap-south-1')

# Compile model for Android ARM devices
compilation_job = sagemaker_client.create_compilation_job(
    CompilationJobName='vericrop-model-android',
    RoleArn='arn:aws:iam::<account-id>:role/VeriCrop-SageMaker-ExecutionRole',
    InputConfig={
        'S3Uri': 's3://vericrop-training-data-<account-id>/models/vericrop-crop-damage-classifier/output/model.tar.gz',
        'DataInputConfig': '{"input_1":[1,224,224,3]}',
        'Framework': 'TENSORFLOW'
    },
    OutputConfig={
        'S3OutputLocation': 's3://vericrop-training-data-<account-id>/compiled-models/',
        'TargetDevice': 'rasp3b'  # ARM Cortex-A53 (similar to Android)
    },
    StoppingCondition={
        'MaxRuntimeInSeconds': 900
    }
)

print(f"Compilation job created: {compilation_job['CompilationJobArn']}")
```

## Hackathon MVP Approach

For the hackathon, we recommend the following approach to demonstrate the system without full model training:

### Option A: Use Pre-trained Model (Fastest)

1. Download a pre-trained crop disease model from TensorFlow Hub or Hugging Face
2. Fine-tune on a small subset of Indian crop images (100-200 images)
3. Deploy to SageMaker endpoint for demo

### Option B: Mock Training Job (Infrastructure Focus)

1. Create a mock training script that simulates training
2. Generate a dummy model file
3. Focus on demonstrating the infrastructure setup and integration

### Option C: Transfer Learning with Small Dataset (Balanced)

1. Use a subset of PlantVillage dataset (1000 images)
2. Train for 10 epochs instead of 50
3. Accept lower accuracy (70-75%) for demo purposes
4. Document the full training approach for production

## Cost Estimation

### Training Cost (One-time)

- **Instance**: ml.p3.2xlarge (1 GPU)
- **Duration**: ~4 hours for 50 epochs
- **Cost**: ~$12-15 per training job

### Inference Cost (Ongoing)

- **Endpoint**: ml.m5.xlarge
- **Cost**: ~$0.23/hour = ~$165/month
- **Alternative**: Use Lambda with SageMaker Neo compiled model (~$0.20 per 1000 requests)

### Storage Cost

- **Training data**: ~10 GB = ~$0.23/month
- **Model artifacts**: ~100 MB = ~$0.002/month

**Total estimated cost for hackathon**: ~$20-30

## Monitoring and Evaluation

### Training Metrics

Monitor the following metrics during training:

- **Training accuracy**: Should reach >90%
- **Validation accuracy**: Target >85%
- **Training loss**: Should decrease steadily
- **Validation loss**: Should decrease without overfitting

### Model Evaluation

After training, evaluate the model on:

1. **Validation set accuracy**: >85% target
2. **Per-class accuracy**: Ensure balanced performance
3. **Confusion matrix**: Identify misclassification patterns
4. **Inference latency**: <2 seconds on edge devices

### Production Monitoring

In production, monitor:

- **Model drift**: Track accuracy over time
- **Inference latency**: Ensure <2 second SLA
- **Error rate**: Track failed predictions
- **A2I feedback**: Use human reviews to improve model

## SageMaker Neo Compilation (Task 4.2)

After training the model, compile it with SageMaker Neo for optimized edge deployment:

### Quick Start (Hackathon Demo)

```bash
# Create mock compiled model (instant, $0 cost)
python compile_neo.py --account-id <account-id> --mock

# Test inference latency
python test_inference_latency.py --mock
```

### Production Compilation

```bash
# Compile model with SageMaker Neo (5-10 minutes, $0.50 cost)
python compile_neo.py \
  --account-id <account-id> \
  --model-uri s3://vericrop-training-data-<account-id>/models/model.tar.gz \
  --wait

# Test inference latency
python test_inference_latency.py \
  --compiled-model-path ./compiled-model/ \
  --test-images ./test-images/
```

**Expected Results**:
- 2-3x faster inference
- 50% smaller model size
- <2 second inference latency ✓

**See**: `NEO_COMPILATION_QUICKSTART.md` for detailed instructions

## Next Steps

After completing Tasks 4.1 and 4.2, proceed to:

- **Task 4.3**: Create crop damage classification Lambda function
- **Task 4.4**: Write unit tests for AI classification
- **Task 15**: Deploy to AWS IoT Greengrass v2 for offline operation

## References

- [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease)
- [Kaggle Indian Crop Dataset](https://www.kaggle.com/datasets/atharvaingle/crop-disease-dataset)
- [SageMaker TensorFlow](https://sagemaker.readthedocs.io/en/stable/frameworks/tensorflow/using_tf.html)
- [SageMaker Neo](https://docs.aws.amazon.com/sagemaker/latest/dg/neo.html)
- [MobileNetV2 Paper](https://arxiv.org/abs/1801.04381)
- [Transfer Learning Guide](https://www.tensorflow.org/tutorials/images/transfer_learning)

## Support

For questions or issues, contact the VeriCrop FinBridge team or refer to the main project documentation.
