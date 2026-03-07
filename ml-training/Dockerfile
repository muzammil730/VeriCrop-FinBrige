# VeriCrop FinBridge - SageMaker Training Container
# Base image: TensorFlow 2.12 with GPU support
FROM tensorflow/tensorflow:2.12.0-gpu

# Set working directory
WORKDIR /opt/ml/code

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy training script
COPY train.py .

# Set environment variables for SageMaker
ENV SAGEMAKER_PROGRAM train.py
ENV SAGEMAKER_SUBMIT_DIRECTORY /opt/ml/code

# SageMaker uses this entrypoint
ENTRYPOINT ["python", "train.py"]
