# VeriCrop FinBridge Backend

## Architecture

This backend implements a fully serverless architecture using AWS Lambda functions organized by domain:

### Domain Structure

- **forensic-validation/**: Physics-based fraud detection (Solar Azimuth, Shadow Analysis, Weather Correlation)
- **ai-analysis/**: Amazon Bedrock and SageMaker integration for claim analysis
- **orchestration/**: Step Functions workflow coordination and HITL routing
- **financial-automation/**: Bridge loan calculation and payment processing
- **blockchain-ledger/**: Certificate issuance and verification (DynamoDB + SHA-256)
- **evidence-storage/**: S3 presigned URL generation and evidence management
- **shared/utils/**: Reusable utilities (circuit breaker, retry logic, monitoring)

### Key Technologies

- **Runtime**: Node.js 20.x (TypeScript)
- **Framework**: AWS SDK v3
- **Orchestration**: AWS Step Functions Express
- **AI/ML**: Amazon Bedrock (Claude 3 Sonnet), Amazon Rekognition, Amazon SageMaker
- **Storage**: Amazon S3, DynamoDB
- **Monitoring**: CloudWatch, X-Ray

### Deployment

All Lambda functions are deployed via AWS CDK (see `/infrastructure` directory).

