"""
VeriCrop FinBridge - Shadow Angle Comparator
Compares actual shadow angle from video with expected solar azimuth
Flags fraud if variance exceeds ±5 degrees
"""

import json
import boto3
import math

rekognition = boto3.client('rekognition')
s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    Input: S3 video location, expected azimuth angle
    Output: Fraud risk assessment
    """
    
    try:
        # Extract input
        bucket = event['bucket']
        video_key = event['video_key']
        expected_azimuth = float(event['expected_azimuth'])
        
        # Extract shadow angle from video (simplified for MVP)
        # In production, this would use computer vision to detect shadows
        actual_shadow_angle = extract_shadow_angle(bucket, video_key)
        
        # Calculate variance
        variance = abs(actual_shadow_angle - expected_azimuth)
        
        # Determine fraud risk
        is_fraud = variance > 5.0  # ±5° tolerance
        risk_level = calculate_risk_level(variance)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'expected_azimuth': expected_azimuth,
                'actual_shadow_angle': actual_shadow_angle,
                'variance': round(variance, 2),
                'is_fraud': is_fraud,
                'risk_level': risk_level,
                'message': f'Shadow variance: {variance:.2f}° ({"FRAUD" if is_fraud else "VALID"})'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to compare shadow angles'
            })
        }

def extract_shadow_angle(bucket, video_key):
    """
    Extract shadow direction from video frames
    For MVP: Simplified simulation
    In production: Use Rekognition + OpenCV for actual shadow detection
    """
    # Simulate shadow extraction for MVP
    # In production, this would:
    # 1. Extract frames from video
    # 2. Detect objects and their shadows using Rekognition
    # 3. Calculate shadow direction using edge detection
    # 4. Return average shadow angle
    
    # For demo: Return a simulated angle
    # You would replace this with actual computer vision logic
    import random
    return random.uniform(170, 190)  # Simulated shadow angle

def calculate_risk_level(variance):
    """
    Calculate fraud risk level based on variance
    """
    if variance <= 5:
        return "LOW"
    elif variance <= 15:
        return "MEDIUM"
    else:
        return "HIGH"

# Test locally
if __name__ == "__main__":
    test_event = {
        'bucket': 'vericrop-evidence-123456',
        'video_key': 'test-video.mp4',
        'expected_azimuth': 180.0
    }
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
