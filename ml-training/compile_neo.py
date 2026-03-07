"""
VeriCrop FinBridge - SageMaker Neo Model Compilation Script
============================================================

This script compiles the trained TensorFlow model using SageMaker Neo
for optimized edge deployment on ARM devices (Android/Greengrass).

Target Device: ARM Cortex-A53 (rasp3b target for Android/Greengrass)
Expected Optimization: 2-3x faster inference, 50% smaller model size
Target Latency: <2 seconds per inference

Requirements: 3.5

Usage:
    python compile_neo.py --account-id <account-id> --model-uri <s3-uri>
    python compile_neo.py --account-id <account-id> --mock  # For hackathon demo
"""

import argparse
import boto3
import time
import json
from datetime import datetime


def create_compilation_job(
    account_id,
    model_uri,
    region='ap-south-1',
    target_device='rasp3b',
    framework='TENSORFLOW'
):
    """
    Create SageMaker Neo compilation job for edge deployment.
    
    Args:
        account_id: AWS account ID
        model_uri: S3 URI of trained model (model.tar.gz)
        region: AWS region (default: ap-south-1)
        target_device: Target edge device (default: rasp3b for ARM Cortex-A53)
        framework: ML framework (default: TENSORFLOW)
        
    Returns:
        Compilation job name
    """
    print("\n" + "="*70)
    print("VERICROP FINBRIDGE - SAGEMAKER NEO MODEL COMPILATION")
    print("="*70)
    print(f"Account ID: {account_id}")
    print(f"Region: {region}")
    print(f"Model URI: {model_uri}")
    print(f"Target Device: {target_device} (ARM Cortex-A53)")
    print(f"Framework: {framework}")
    print("="*70 + "\n")
    
    # Initialize SageMaker client
    sagemaker = boto3.client('sagemaker', region_name=region)
    
    # Generate unique job name
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    job_name = f'vericrop-neo-compilation-{timestamp}'
    
    # IAM role
    role_arn = f"arn:aws:iam::{account_id}:role/VeriCrop-SageMaker-ExecutionRole"
    
    # Output location
    output_bucket = f"vericrop-training-data-{account_id}"
    output_path = f"s3://{output_bucket}/compiled-models/"
    
    print(f"Compilation Job Name: {job_name}")
    print(f"SageMaker Role: {role_arn}")
    print(f"Output Path: {output_path}\n")
    
    # Model input configuration
    # MobileNetV2 expects input shape: [batch, height, width, channels]
    data_input_config = json.dumps({
        "input_1": [1, 224, 224, 3]
    })
    
    print("Creating compilation job...")
    print("This will take approximately 5-10 minutes\n")
    
    try:
        response = sagemaker.create_compilation_job(
            CompilationJobName=job_name,
            RoleArn=role_arn,
            InputConfig={
                'S3Uri': model_uri,
                'DataInputConfig': data_input_config,
                'Framework': framework
            },
            OutputConfig={
                'S3OutputLocation': output_path,
                'TargetDevice': target_device
            },
            StoppingCondition={
                'MaxRuntimeInSeconds': 900  # 15 minutes max
            },
            Tags=[
                {'Key': 'Project', 'Value': 'VeriCrop-FinBridge'},
                {'Key': 'Component', 'Value': 'ML-Compilation'},
                {'Key': 'TargetDevice', 'Value': target_device},
            ]
        )
        
        print(f"✓ Compilation job created: {job_name}")
        print(f"  ARN: {response['CompilationJobArn']}\n")
        
        return job_name
        
    except Exception as e:
        print(f"\n✗ Error creating compilation job: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure model exists in S3:")
        print(f"   aws s3 ls {model_uri}")
        print("2. Ensure SageMaker role exists:")
        print(f"   aws iam get-role --role-name VeriCrop-SageMaker-ExecutionRole")
        print("3. Verify model format is correct (SavedModel or frozen graph)")
        raise


def wait_for_compilation(job_name, region='ap-south-1', poll_interval=30):
    """
    Wait for compilation job to complete and monitor progress.
    
    Args:
        job_name: Compilation job name
        region: AWS region
        poll_interval: Seconds between status checks (default: 30)
        
    Returns:
        Compilation job details
    """
    sagemaker = boto3.client('sagemaker', region_name=region)
    
    print(f"Monitoring compilation job: {job_name}")
    print(f"Polling every {poll_interval} seconds...\n")
    
    start_time = time.time()
    
    while True:
        try:
            response = sagemaker.describe_compilation_job(
                CompilationJobName=job_name
            )
            
            status = response['CompilationJobStatus']
            elapsed = int(time.time() - start_time)
            
            print(f"[{elapsed}s] Status: {status}")
            
            if status == 'COMPLETED':
                print("\n" + "="*70)
                print("✓ COMPILATION COMPLETED SUCCESSFULLY")
                print("="*70)
                print(f"Compilation Time: {elapsed} seconds")
                print(f"Compiled Model: {response['ModelArtifacts']['S3ModelArtifacts']}")
                print("="*70 + "\n")
                
                return response
                
            elif status == 'FAILED':
                print("\n" + "="*70)
                print("✗ COMPILATION FAILED")
                print("="*70)
                print(f"Failure Reason: {response.get('FailureReason', 'Unknown')}")
                print("="*70 + "\n")
                
                raise Exception(f"Compilation failed: {response.get('FailureReason', 'Unknown')}")
                
            elif status == 'STOPPED':
                print("\n✗ Compilation job was stopped")
                raise Exception("Compilation job was stopped")
                
            # Still in progress
            time.sleep(poll_interval)
            
        except KeyboardInterrupt:
            print("\n\nInterrupted by user. Compilation job is still running.")
            print(f"Check status with:")
            print(f"  aws sagemaker describe-compilation-job --compilation-job-name {job_name}")
            raise


def test_compiled_model_size(compiled_model_uri, original_model_uri, region='ap-south-1'):
    """
    Compare compiled model size with original model.
    
    Args:
        compiled_model_uri: S3 URI of compiled model
        original_model_uri: S3 URI of original model
        region: AWS region
        
    Returns:
        Size comparison dict
    """
    s3 = boto3.client('s3', region_name=region)
    
    def get_s3_object_size(s3_uri):
        """Get size of S3 object in bytes."""
        bucket = s3_uri.split('/')[2]
        key = '/'.join(s3_uri.split('/')[3:])
        
        try:
            response = s3.head_object(Bucket=bucket, Key=key)
            return response['ContentLength']
        except:
            return None
    
    original_size = get_s3_object_size(original_model_uri)
    compiled_size = get_s3_object_size(compiled_model_uri)
    
    if original_size and compiled_size:
        reduction = ((original_size - compiled_size) / original_size) * 100
        
        print("\n" + "="*70)
        print("MODEL SIZE COMPARISON")
        print("="*70)
        print(f"Original Model:  {original_size / (1024*1024):.2f} MB")
        print(f"Compiled Model:  {compiled_size / (1024*1024):.2f} MB")
        print(f"Size Reduction:  {reduction:.1f}%")
        print("="*70 + "\n")
        
        return {
            'original_size_mb': original_size / (1024*1024),
            'compiled_size_mb': compiled_size / (1024*1024),
            'reduction_percent': reduction
        }
    
    return None


def generate_deployment_guide(compiled_model_uri, account_id, region='ap-south-1'):
    """
    Generate deployment guide for compiled model.
    
    Args:
        compiled_model_uri: S3 URI of compiled model
        account_id: AWS account ID
        region: AWS region
    """
    print("\n" + "="*70)
    print("DEPLOYMENT GUIDE - COMPILED MODEL")
    print("="*70)
    print("\n1. DOWNLOAD COMPILED MODEL")
    print(f"   aws s3 cp {compiled_model_uri} ./compiled-model.tar.gz")
    print(f"   tar -xzf compiled-model.tar.gz")
    
    print("\n2. DEPLOY TO AWS IOT GREENGRASS V2")
    print("   a. Create Greengrass component:")
    print("      - Component name: com.vericrop.CropDamageClassifier")
    print("      - Version: 1.0.0")
    print("      - Artifacts: compiled-model.tar.gz")
    print("   b. Deploy to Greengrass core device")
    print("   c. Test local inference")
    
    print("\n3. DEPLOY TO ANDROID APP")
    print("   a. Convert to TensorFlow Lite format (if needed)")
    print("   b. Include in Android app assets")
    print("   c. Load model in app using TensorFlow Lite interpreter")
    
    print("\n4. TEST INFERENCE LATENCY")
    print("   Target: <2 seconds per inference")
    print("   Test with sample crop damage images")
    print("   Measure end-to-end latency (load + preprocess + inference)")
    
    print("\n5. INTEGRATE WITH LAMBDA FUNCTION (Task 4.3)")
    print("   - Lambda will invoke SageMaker endpoint")
    print("   - Endpoint uses compiled model for faster inference")
    print("   - Returns damage type, confidence, severity")
    
    print("\n6. MONITOR PERFORMANCE")
    print("   - CloudWatch metrics for inference latency")
    print("   - Model accuracy on production data")
    print("   - Edge device resource usage (CPU, memory)")
    
    print("\n" + "="*70)
    print("For detailed instructions, see:")
    print("  - ml-training/GREENGRASS_DEPLOYMENT.md")
    print("  - ml-training/ANDROID_DEPLOYMENT.md")
    print("="*70 + "\n")


def create_mock_compilation(account_id, region='ap-south-1'):
    """
    Create mock compiled model for hackathon demo (no actual compilation).
    
    This simulates a compiled model by copying the original model to the
    compiled-models directory without actual Neo compilation.
    
    Args:
        account_id: AWS account ID
        region: AWS region
        
    Returns:
        Mock compiled model S3 URI
    """
    print("\n" + "="*70)
    print("VERICROP FINBRIDGE - MOCK NEO COMPILATION (HACKATHON MODE)")
    print("="*70)
    print("Creating mock compiled model for demo purposes...")
    print("="*70 + "\n")
    
    s3 = boto3.client('s3', region_name=region)
    bucket = f"vericrop-training-data-{account_id}"
    
    # Check if mock model exists
    source_key = "models/mock-training-job/output/saved_model/"
    dest_key = "compiled-models/mock-compilation/model.tar.gz"
    
    print(f"Source: s3://{bucket}/{source_key}")
    print(f"Destination: s3://{bucket}/{dest_key}\n")
    
    try:
        # For demo, we'll just create a marker file
        print("Creating mock compiled model marker...")
        
        mock_info = {
            "compilation_job": "mock-compilation-hackathon",
            "target_device": "rasp3b",
            "framework": "TENSORFLOW",
            "status": "COMPLETED",
            "note": "This is a mock compilation for hackathon demo. In production, use actual SageMaker Neo compilation.",
            "deployment_ready": True,
            "expected_latency_ms": 1500,
            "model_size_reduction": "~50%"
        }
        
        s3.put_object(
            Bucket=bucket,
            Key="compiled-models/mock-compilation/compilation-info.json",
            Body=json.dumps(mock_info, indent=2)
        )
        
        compiled_uri = f"s3://{bucket}/compiled-models/mock-compilation/"
        
        print(f"✓ Mock compiled model created: {compiled_uri}")
        print("\nMock Compilation Info:")
        print(json.dumps(mock_info, indent=2))
        
        print("\n" + "="*70)
        print("HACKATHON DEMO NOTES")
        print("="*70)
        print("For the hackathon, you can demonstrate:")
        print("1. The compilation workflow and infrastructure")
        print("2. Integration with Greengrass deployment (Task 15)")
        print("3. Lambda function integration (Task 4.3)")
        print("4. Expected performance improvements:")
        print("   - 2-3x faster inference")
        print("   - 50% smaller model size")
        print("   - <2 second latency target")
        print("\nFor production, run actual Neo compilation with:")
        print("  python compile_neo.py --account-id <id> --model-uri <uri>")
        print("="*70 + "\n")
        
        return compiled_uri
        
    except Exception as e:
        print(f"✗ Error creating mock compilation: {e}")
        raise


def main():
    parser = argparse.ArgumentParser(
        description='Compile VeriCrop model with SageMaker Neo for edge deployment'
    )
    parser.add_argument(
        '--account-id',
        type=str,
        required=True,
        help='AWS account ID'
    )
    parser.add_argument(
        '--model-uri',
        type=str,
        help='S3 URI of trained model (model.tar.gz)'
    )
    parser.add_argument(
        '--region',
        type=str,
        default='ap-south-1',
        help='AWS region (default: ap-south-1)'
    )
    parser.add_argument(
        '--target-device',
        type=str,
        default='rasp3b',
        help='Target edge device (default: rasp3b for ARM Cortex-A53)'
    )
    parser.add_argument(
        '--framework',
        type=str,
        default='TENSORFLOW',
        help='ML framework (default: TENSORFLOW)'
    )
    parser.add_argument(
        '--mock',
        action='store_true',
        help='Create mock compilation for hackathon demo (no actual compilation)'
    )
    parser.add_argument(
        '--wait',
        action='store_true',
        help='Wait for compilation to complete'
    )
    parser.add_argument(
        '--test-size',
        action='store_true',
        help='Compare compiled model size with original'
    )
    
    args = parser.parse_args()
    
    # Mock compilation for hackathon
    if args.mock:
        compiled_uri = create_mock_compilation(args.account_id, args.region)
        generate_deployment_guide(compiled_uri, args.account_id, args.region)
        return
    
    # Validate model URI
    if not args.model_uri:
        print("Error: --model-uri is required (or use --mock for hackathon demo)")
        return
    
    # Create compilation job
    job_name = create_compilation_job(
        account_id=args.account_id,
        model_uri=args.model_uri,
        region=args.region,
        target_device=args.target_device,
        framework=args.framework
    )
    
    print(f"Compilation job created: {job_name}\n")
    print("To monitor progress:")
    print(f"  aws sagemaker describe-compilation-job --compilation-job-name {job_name}")
    print("\nTo view logs:")
    print(f"  aws logs tail /aws/sagemaker/CompilationJobs --follow --log-stream-name-prefix {job_name}")
    
    # Wait for completion if requested
    if args.wait:
        result = wait_for_compilation(job_name, args.region)
        compiled_uri = result['ModelArtifacts']['S3ModelArtifacts']
        
        # Test model size if requested
        if args.test_size:
            test_compiled_model_size(compiled_uri, args.model_uri, args.region)
        
        # Generate deployment guide
        generate_deployment_guide(compiled_uri, args.account_id, args.region)


if __name__ == '__main__':
    main()
