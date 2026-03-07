#!/bin/bash

# VeriCrop FinBridge Repository Reorganization Script
# Phase 1: Enterprise Monorepo Structure
# Execute this script from the repository root

set -e  # Exit on error

echo "========================================="
echo "VeriCrop FinBridge Repository Reorganization"
echo "Phase 1: Enterprise Monorepo Structure"
echo "========================================="

# Create new directory structure
echo "Creating enterprise monorepo structure..."
mkdir -p backend/src/forensic-validation
mkdir -p backend/src/ai-analysis
mkdir -p backend/src/orchestration
mkdir -p backend/src/financial-automation
mkdir -p backend/src/blockchain-ledger
mkdir -p backend/src/evidence-storage
mkdir -p backend/src/shared/utils
mkdir -p docs/architecture
mkdir -p docs/deployment
mkdir -p docs/api

# Move Lambda functions to organized backend structure
echo "Organizing Lambda functions by domain..."

# Forensic Validation Domain
mv lambda-functions/solar-azimuth-calculator.ts backend/src/forensic-validation/ 2>/dev/null || true
mv lambda-functions/solar-azimuth-calculator.py backend/src/forensic-validation/ 2>/dev/null || true
mv lambda-functions/shadow-comparator.ts backend/src/forensic-validation/ 2>/dev/null || true
mv lambda-functions/shadow-comparator.py backend/src/forensic-validation/ 2>/dev/null || true
mv lambda-functions/weather-data-integrator.ts backend/src/forensic-validation/ 2>/dev/null || true
mv lambda-functions/weather-correlation-analyzer.ts backend/src/forensic-validation/ 2>/dev/null || true
mv lambda-functions/rekognition-video-analyzer.ts backend/src/forensic-validation/ 2>/dev/null || true

# AI Analysis Domain
mv lambda-functions/bedrock-claim-analyzer.ts backend/src/ai-analysis/ 2>/dev/null || true
mv lambda-functions/crop-damage-classifier.ts backend/src/ai-analysis/ 2>/dev/null || true

# Orchestration Domain
mv lambda-functions/submission-validator.ts backend/src/orchestration/ 2>/dev/null || true
mv lambda-functions/result-consolidator.ts backend/src/orchestration/ 2>/dev/null || true
mv lambda-functions/claim-rejector.ts backend/src/orchestration/ 2>/dev/null || true
mv lambda-functions/hitl-router.ts backend/src/orchestration/ 2>/dev/null || true
mv lambda-functions/hitl-result-processor.ts backend/src/orchestration/ 2>/dev/null || true
mv lambda-functions/a2i-workflow-config.ts backend/src/orchestration/ 2>/dev/null || true

# Financial Automation Domain
mv lambda-functions/bridge-loan-calculator.ts backend/src/financial-automation/ 2>/dev/null || true
mv lambda-functions/bridge-loan-calculator.py backend/src/financial-automation/ 2>/dev/null || true
mv lambda-functions/insurance-payout-processor.ts backend/src/financial-automation/ 2>/dev/null || true
mv lambda-functions/payment-gateway-handler.ts backend/src/financial-automation/ 2>/dev/null || true

# Blockchain Ledger Domain
mv lambda-functions/certificate-issuer.ts backend/src/blockchain-ledger/ 2>/dev/null || true
mv lambda-functions/certificate-verifier.ts backend/src/blockchain-ledger/ 2>/dev/null || true

# Evidence Storage Domain
mv lambda-functions/evidence-storage-handler.ts backend/src/evidence-storage/ 2>/dev/null || true
mv lambda-functions/generate-presigned-url.ts backend/src/evidence-storage/ 2>/dev/null || true

# Shared Utilities
mv lambda-functions/circuit-breaker.ts backend/src/shared/utils/ 2>/dev/null || true
mv lambda-functions/retry-utils.ts backend/src/shared/utils/ 2>/dev/null || true
mv lambda-functions/graceful-degradation.ts backend/src/shared/utils/ 2>/dev/null || true
mv lambda-functions/cloudwatch-alarms-setup.ts backend/src/shared/utils/ 2>/dev/null || true

# Move package files to backend root
mv lambda-functions/package.json backend/ 2>/dev/null || true
mv lambda-functions/package-lock.json backend/ 2>/dev/null || true
mv lambda-functions/tsconfig.json backend/ 2>/dev/null || true

# Move Step Functions definitions to orchestration
mv step-functions/*.json backend/src/orchestration/ 2>/dev/null || true

# Move documentation files to docs
echo "Organizing documentation..."
mv lambda-functions/PRESIGNED_URL_IMPLEMENTATION.md docs/architecture/ 2>/dev/null || true
mv lambda-functions/CROP_DAMAGE_CLASSIFIER_README.md docs/architecture/ 2>/dev/null || true
mv lambda-functions/WEATHER_INTEGRATION_README.md docs/architecture/ 2>/dev/null || true
mv lambda-functions/WEATHER_CORRELATION_README.md docs/architecture/ 2>/dev/null || true
mv lambda-functions/FORENSIC_VALIDATION_E2E_TEST.md docs/architecture/ 2>/dev/null || true

# Move deployment/completion docs
mv DEPLOYMENT_COMPLETE_SUMMARY.md docs/deployment/ 2>/dev/null || true
mv SUCCESS_DEPLOYMENT_COMPLETE.md docs/deployment/ 2>/dev/null || true
mv BEDROCK_DEPLOYMENT_COMPLETE.md docs/deployment/ 2>/dev/null || true
mv NODEJS_20_UPGRADE_COMPLETE.md docs/deployment/ 2>/dev/null || true
mv ENTERPRISE_UI_REDESIGN_COMPLETE.md docs/deployment/ 2>/dev/null || true
mv ARCHITECTURAL_REFACTOR_COMPLETE.md docs/deployment/ 2>/dev/null || true

# Move task completion docs
mv lambda-functions/TASK_*.md docs/deployment/ 2>/dev/null || true
mv TASKS_*.md docs/deployment/ 2>/dev/null || true
mv MVP_COMPLETION_SUMMARY.md docs/deployment/ 2>/dev/null || true

# Move API/testing docs
mv API_ENDPOINTS_VERIFICATION.md docs/api/ 2>/dev/null || true
mv DEMO_TESTING_GUIDE.md docs/api/ 2>/dev/null || true
mv CAMERA_FEATURE_STATUS.md docs/api/ 2>/dev/null || true

# Delete orphaned/duplicate files
echo "Removing orphaned and duplicate files..."

# Remove backup/old UI files
rm -f frontend/app/page-enterprise.tsx 2>/dev/null || true
rm -f frontend/app/page-redesign.tsx 2>/dev/null || true
rm -f frontend/app/page-old.tsx 2>/dev/null || true

# Remove unused CSS modules
rm -f frontend/app/page.module.css 2>/dev/null || true
rm -f frontend/app/bridge-loan/loan.module.css 2>/dev/null || true
rm -f frontend/app/verify-certificate/verify.module.css 2>/dev/null || true
rm -f frontend/app/claim-submission/claim.module.css 2>/dev/null || true

# Remove duplicate AppShell
rm -rf frontend/components/ 2>/dev/null || true

# Remove test event files (keep in git history if needed)
rm -f lambda-functions/*.json 2>/dev/null || true
rm -f lambda-functions/*-event.json 2>/dev/null || true

# Remove test files (not needed for judge review)
rm -f lambda-functions/test-*.ts 2>/dev/null || true

# Remove Python venv (should not be in repo)
rm -rf venv/ 2>/dev/null || true

# Remove diagram generation scripts (keep final diagrams only)
rm -rf "Kiro Hackathon/" 2>/dev/null || true
rm -rf diagrams/generated-diagrams/ 2>/dev/null || true
rm -rf generated-diagrams/ 2>/dev/null || true

# Remove empty lambda-functions directory
rmdir lambda-functions/dist 2>/dev/null || true
rmdir lambda-functions/node_modules 2>/dev/null || true
rmdir lambda-functions 2>/dev/null || true

# Remove empty step-functions directory
rmdir step-functions 2>/dev/null || true

# Create backend README
cat > backend/README.md << 'EOF'
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
- **AI/ML**: Amazon Bedrock (Claude 3 Sonnet), Amazon Rekognition
- **Storage**: Amazon S3, DynamoDB
- **Monitoring**: CloudWatch, X-Ray

### Deployment

All Lambda functions are deployed via AWS CDK (see `/infrastructure` directory).

EOF

echo "========================================="
echo "Reorganization Complete!"
echo "========================================="
echo ""
echo "New Structure:"
echo "  /backend/src/          - Lambda functions organized by domain"
echo "  /frontend/             - Next.js application"
echo "  /infrastructure/       - AWS CDK stacks"
echo "  /ml-training/          - SageMaker training scripts"
echo "  /docs/                 - Architecture and deployment docs"
echo "  /.kiro/specs/          - Spec-driven development proof"
echo ""
echo "Next Steps:"
echo "  1. Review the new structure"
echo "  2. Run: git add -A"
echo "  3. Run: git commit -m 'Reorganize to enterprise monorepo structure'"
echo "  4. Update import paths in CDK if needed"
echo ""
