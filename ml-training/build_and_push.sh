#!/bin/bash

# VeriCrop FinBridge - Build and Push SageMaker Training Container
# =================================================================
# This script builds the Docker container for SageMaker training
# and pushes it to Amazon ECR.
#
# Usage:
#   ./build_and_push.sh <account-id> <region>
#
# Example:
#   ./build_and_push.sh 123456789012 ap-south-1

set -e

# Check arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <account-id> <region>"
    echo "Example: $0 123456789012 ap-south-1"
    exit 1
fi

ACCOUNT_ID=$1
REGION=$2
IMAGE_NAME="vericrop-training"
TAG="latest"

echo "========================================"
echo "VeriCrop FinBridge - Build and Push"
echo "========================================"
echo "Account ID: $ACCOUNT_ID"
echo "Region: $REGION"
echo "Image: $IMAGE_NAME:$TAG"
echo "========================================"
echo ""

# Get ECR login
echo "Logging in to ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Create ECR repository if it doesn't exist
echo "Creating ECR repository (if not exists)..."
aws ecr describe-repositories --repository-names $IMAGE_NAME --region $REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $IMAGE_NAME --region $REGION

# Build Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME:$TAG .

# Tag image for ECR
echo "Tagging image for ECR..."
docker tag $IMAGE_NAME:$TAG $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$IMAGE_NAME:$TAG

# Push to ECR
echo "Pushing image to ECR..."
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$IMAGE_NAME:$TAG

echo ""
echo "✓ Image pushed successfully!"
echo ""
echo "ECR Image URI:"
echo "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$IMAGE_NAME:$TAG"
echo ""
echo "Use this URI in your SageMaker training job configuration."
