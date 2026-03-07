"""
VeriCrop FinBridge - SageMaker Training Job Setup Script
=========================================================

This script helps set up and launch a SageMaker training job for the
crop damage classification model.

Usage:
    python setup_training_job.py --account-id <account-id> --region ap-south-1

Requirements: boto3, sagemaker
"""

import argparse
import boto3
import json
from sagemaker.tensorflow import TensorFlow
from sagemaker import get_execution_role


def get_account_id():
    """Get AWS account ID."""
    sts = boto3.client('sts')
    return sts.get_caller_identity()['Account']


def create_training_job(account_id, region='ap-south-1', instance_type='ml.p3.2xlarge'):
    """
    Create and launch SageMaker training job.
    
    Args:
        account_id: AWS account ID
        region: AWS region (default: ap-south-1 for Mumbai)
        instance_type: SageMaker instance type (default: ml.p3.2xlarge)
        
    Returns:
        Training job name
    """
    print("\n" + "="*60)
    print("VERICROP FINBRIDGE - SAGEMAKER TRAINING JOB SETUP")
    print("="*60)
    print(f"Account ID: {account_id}")
    print(f"Region: {region}")
    print(f"Instance Type: {instance_type}")
    print("="*60 + "\n")
    
    # S3 bucket names
    training_bucket = f"vericrop-training-data-{account_id}"
    
    # IAM role
    role_arn = f"arn:aws:iam::{account_id}:role/VeriCrop-SageMaker-ExecutionRole"
    
    print(f"Training Data Bucket: s3://{training_bucket}")
    print(f"SageMaker Role: {role_arn}\n")
    
    # Create TensorFlow estimator
    print("Creating TensorFlow estimator...")
    estimator = TensorFlow(
        entry_point='train.py',
        source_dir='.',
        role=role_arn,
        instance_count=1,
        instance_type=instance_type,
        framework_version='2.12',
        py_version='py310',
        hyperparameters={
            'epochs': 50,
            'batch-size': 32,
            'learning-rate': 0.0001,
            'input-size': 224,
            'freeze-layers': 100
        },
        output_path=f's3://{training_bucket}/models/',
        base_job_name='vericrop-crop-damage-classifier',
        enable_sagemaker_metrics=True,
        metric_definitions=[
            {'Name': 'train:loss', 'Regex': 'loss: ([0-9\\.]+)'},
            {'Name': 'train:accuracy', 'Regex': 'accuracy: ([0-9\\.]+)'},
            {'Name': 'validation:loss', 'Regex': 'val_loss: ([0-9\\.]+)'},
            {'Name': 'validation:accuracy', 'Regex': 'val_accuracy: ([0-9\\.]+)'},
        ],
        tags=[
            {'Key': 'Project', 'Value': 'VeriCrop-FinBridge'},
            {'Key': 'Component', 'Value': 'ML-Training'},
            {'Key': 'Model', 'Value': 'Crop-Damage-Classifier'},
        ]
    )
    
    print("✓ Estimator created\n")
    
    # Training data configuration
    training_data = {
        'train': f's3://{training_bucket}/plantvillage/train/',
        'validation': f's3://{training_bucket}/plantvillage/validation/',
        'finetune': f's3://{training_bucket}/indian-crops/train/'
    }
    
    print("Training data configuration:")
    for channel, s3_uri in training_data.items():
        print(f"  {channel}: {s3_uri}")
    print()
    
    # Start training
    print("Starting training job...")
    print("This will take approximately 4 hours on ml.p3.2xlarge")
    print("You can monitor progress in the SageMaker console:\n")
    print(f"https://{region}.console.aws.amazon.com/sagemaker/home?region={region}#/jobs")
    print()
    
    try:
        estimator.fit(training_data, wait=False)
        print(f"\n✓ Training job started: {estimator.latest_training_job.name}")
        print(f"\nTo check status:")
        print(f"  aws sagemaker describe-training-job --training-job-name {estimator.latest_training_job.name}")
        print(f"\nTo view logs:")
        print(f"  aws logs tail /aws/sagemaker/TrainingJobs --follow --log-stream-name-prefix {estimator.latest_training_job.name}")
        
        return estimator.latest_training_job.name
        
    except Exception as e:
        print(f"\n✗ Error starting training job: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure training data is uploaded to S3:")
        print(f"   aws s3 ls s3://{training_bucket}/plantvillage/train/")
        print("2. Ensure SageMaker role exists:")
        print(f"   aws iam get-role --role-name VeriCrop-SageMaker-ExecutionRole")
        print("3. Check SageMaker service limits:")
        print(f"   aws service-quotas get-service-quota --service-code sagemaker --quota-code L-{instance_type}")
        raise


def create_mock_training_job(account_id, region='ap-south-1'):
    """
    Create a mock training job for hackathon demo (no actual training).
    
    This creates a dummy model file and uploads it to S3 to simulate
    a trained model without the cost and time of actual training.
    
    Args:
        account_id: AWS account ID
        region: AWS region
        
    Returns:
        Mock model S3 URI
    """
    print("\n" + "="*60)
    print("VERICROP FINBRIDGE - MOCK TRAINING JOB (HACKATHON MODE)")
    print("="*60)
    print("Creating mock trained model for demo purposes...")
    print("="*60 + "\n")
    
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras import layers
    import tempfile
    import os
    
    # Create a simple model
    print("Creating MobileNetV2 model...")
    base_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    
    inputs = keras.Input(shape=(224, 224, 3))
    x = keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(6, activation='softmax')(x)
    
    model = keras.Model(inputs, outputs)
    print("✓ Model created\n")
    
    # Save model
    print("Saving model...")
    with tempfile.TemporaryDirectory() as tmpdir:
        model_dir = os.path.join(tmpdir, 'saved_model')
        model.save(model_dir, save_format='tf')
        
        # Save class labels
        class_labels = {
            0: 'pest',
            1: 'disease',
            2: 'drought',
            3: 'flood',
            4: 'hail',
            5: 'healthy'
        }
        with open(os.path.join(tmpdir, 'class_labels.json'), 'w') as f:
            json.dump(class_labels, f)
        
        # Upload to S3
        print("Uploading to S3...")
        s3 = boto3.client('s3', region_name=region)
        bucket = f"vericrop-training-data-{account_id}"
        
        # Upload model files
        for root, dirs, files in os.walk(tmpdir):
            for file in files:
                local_path = os.path.join(root, file)
                relative_path = os.path.relpath(local_path, tmpdir)
                s3_key = f"models/mock-training-job/output/{relative_path}"
                
                s3.upload_file(local_path, bucket, s3_key)
                print(f"  Uploaded: {s3_key}")
        
        model_uri = f"s3://{bucket}/models/mock-training-job/output/"
        print(f"\n✓ Mock model uploaded to: {model_uri}")
        print("\nYou can now use this model for:")
        print("1. SageMaker endpoint deployment")
        print("2. SageMaker Neo compilation for edge devices")
        print("3. Lambda function integration")
        
        return model_uri


def main():
    parser = argparse.ArgumentParser(
        description='Set up SageMaker training job for VeriCrop crop damage classifier'
    )
    parser.add_argument(
        '--account-id',
        type=str,
        help='AWS account ID (will auto-detect if not provided)'
    )
    parser.add_argument(
        '--region',
        type=str,
        default='ap-south-1',
        help='AWS region (default: ap-south-1)'
    )
    parser.add_argument(
        '--instance-type',
        type=str,
        default='ml.p3.2xlarge',
        help='SageMaker instance type (default: ml.p3.2xlarge)'
    )
    parser.add_argument(
        '--mock',
        action='store_true',
        help='Create mock training job for hackathon demo (no actual training)'
    )
    
    args = parser.parse_args()
    
    # Get account ID
    if args.account_id:
        account_id = args.account_id
    else:
        print("Auto-detecting AWS account ID...")
        account_id = get_account_id()
        print(f"Detected account ID: {account_id}\n")
    
    # Create training job
    if args.mock:
        model_uri = create_mock_training_job(account_id, args.region)
        print(f"\nMock model URI: {model_uri}")
    else:
        job_name = create_training_job(account_id, args.region, args.instance_type)
        print(f"\nTraining job name: {job_name}")


if __name__ == '__main__':
    main()
