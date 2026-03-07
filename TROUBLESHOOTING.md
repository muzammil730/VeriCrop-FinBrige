# VeriCrop FinBridge - Troubleshooting Guide

## Issue: "Failed to submit claim" Error

### Root Cause
Your backend Lambda functions or DynamoDB table aren't properly set up yet.

### Solution Steps

#### Step 1: Check AWS Credentials

```bash
aws sts get-caller-identity
```

**Expected output:**
```json
{
    "UserId": "...",
    "Account": "889168907575",
    "Arn": "arn:aws:iam::889168907575:user/..."
}
```

**If this fails:**
```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region: `ap-south-1`
- Default output format: `json`

#### Step 2: Run Complete Setup

```bash
cd scripts
fix-and-setup.bat
```

This will:
1. Create DynamoDB table
2. Seed demo data
3. Calculate perfect inputs

#### Step 3: Verify Table Exists

```bash
aws dynamodb describe-table --table-name VeriCropClaims --region ap-south-1
```

**Expected:** Table status should be "ACTIVE"

#### Step 4: Check Lambda Functions

```bash
aws lambda list-functions --region ap-south-1 --query "Functions[?contains(FunctionName, 'vericrop') || contains(FunctionName, 'claim')].FunctionName"
```

**Expected:** Should list Lambda functions like:
- claim-processor
- certificate-issuer
- bridge-loan-calculator
- etc.

**If no functions found:** Your infrastructure hasn't been deployed yet.

---

## Issue: DynamoDB Table Not Found

### Quick Fix

Run this command to create the table:

```bash
aws dynamodb create-table ^
  --table-name VeriCropClaims ^
  --attribute-definitions AttributeName=claimId,AttributeType=S AttributeName=certificateId,AttributeType=S ^
  --key-schema AttributeName=claimId,KeyType=HASH ^
  --global-secondary-indexes "IndexName=CertificateIndex,KeySchema=[{AttributeName=certificateId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" ^
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 ^
  --region ap-south-1
```

Wait 30 seconds, then run:

```bash
cd scripts
node seed-demo-data-to-dynamodb.js
```

---

## Issue: Lambda Functions Not Deployed

### Check Infrastructure Deployment

```bash
cd infrastructure
npm install
cdk deploy --all
```

This will deploy:
- DynamoDB tables
- Lambda functions
- API Gateway
- S3 buckets
- IAM roles

**Note:** This takes 10-15 minutes.

---

## Issue: API Gateway Returns 500 Error

### Check Lambda Logs

```bash
aws logs tail /aws/lambda/claim-processor --follow --region ap-south-1
```

Look for error messages in the logs.

### Common Causes:

1. **Missing IAM Permissions**
   - Lambda needs DynamoDB access
   - Lambda needs S3 access
   - Lambda needs Bedrock access

2. **Missing Environment Variables**
   - TABLE_NAME
   - BUCKET_NAME
   - REGION

3. **Lambda Timeout**
   - Increase timeout to 30 seconds
   - Check Lambda configuration

---

## Issue: Certificate Verification Fails

### Possible Causes:

1. **Certificate doesn't exist in DynamoDB**
   - Submit a claim first to create a certificate
   - Or use demo certificate IDs after seeding

2. **Wrong table name**
   - Backend expects: `VeriCropClaims`
   - Infrastructure creates: `VeriCrop-Claims`
   - Fix: Update backend code or table name

3. **API Gateway not connected**
   - Check API Gateway endpoints
   - Verify CORS is enabled

---

## Issue: Bridge Loan Fails

### Possible Causes:

1. **Certificate not found**
   - Verify certificate exists first
   - Use certificate verification page

2. **Invalid certificate ID format**
   - Must start with `CERT-`
   - Must be from an approved claim

3. **DynamoDB query fails**
   - Check Lambda logs
   - Verify GSI (Global Secondary Index) exists

---

## Quick Diagnostic Commands

### Check Everything

```bash
# AWS Credentials
aws sts get-caller-identity

# DynamoDB Table
aws dynamodb describe-table --table-name VeriCropClaims --region ap-south-1

# Lambda Functions
aws lambda list-functions --region ap-south-1

# API Gateway
aws apigateway get-rest-apis --region ap-south-1

# S3 Buckets
aws s3 ls

# CloudWatch Logs
aws logs describe-log-groups --region ap-south-1 --query "logGroups[?contains(logGroupName, 'vericrop')].logGroupName"
```

### Test API Directly

```bash
# Test claims endpoint
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/claims ^
  -H "Content-Type: application/json" ^
  -d "{\"test\": true}"

# Test certificate verification
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/certificates/verify ^
  -H "Content-Type: application/json" ^
  -d "{\"certificateId\": \"CERT-2026-03-08-10000\"}"
```

---

## Emergency: Start Fresh

If nothing works, start completely fresh:

### 1. Delete Everything

```bash
# Delete DynamoDB table
aws dynamodb delete-table --table-name VeriCropClaims --region ap-south-1

# Delete CloudFormation stack (if exists)
aws cloudformation delete-stack --stack-name VeriCropFinBridgeStack --region ap-south-1
```

### 2. Redeploy Infrastructure

```bash
cd infrastructure
cdk deploy --all
```

### 3. Run Setup

```bash
cd scripts
fix-and-setup.bat
```

---

## Getting Help

### Check AWS Console

1. **DynamoDB**: https://console.aws.amazon.com/dynamodb/
2. **Lambda**: https://console.aws.amazon.com/lambda/
3. **API Gateway**: https://console.aws.amazon.com/apigateway/
4. **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/
5. **IAM**: https://console.aws.amazon.com/iam/

### Check Documentation

- `QUICK_START.md` - Quick setup guide
- `WORKING_MVP_SUMMARY.md` - Complete overview
- `DEMO_DATA_GUIDE.md` - Testing workflows
- `API_CONNECTION_ENABLED.md` - Technical details

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Requested resource not found" | DynamoDB table doesn't exist | Run `fix-and-setup.bat` |
| "Failed to submit claim" | Lambda or API Gateway issue | Check Lambda logs |
| "Certificate not found" | No data in DynamoDB | Seed demo data or submit claim |
| "Access Denied" | IAM permissions issue | Check IAM roles |
| "Timeout" | Lambda timeout or cold start | Increase timeout, retry |

---

## Prevention

### Before Demo/Presentation

1. **Test everything 24 hours before**
2. **Seed demo data fresh**
3. **Test on mobile and desktop**
4. **Have backup demo video**
5. **Know your certificate IDs**

### Monitoring

```bash
# Watch Lambda logs during demo
aws logs tail /aws/lambda/claim-processor --follow --region ap-south-1

# Check API Gateway metrics
aws cloudwatch get-metric-statistics ^
  --namespace AWS/ApiGateway ^
  --metric-name Count ^
  --dimensions Name=ApiName,Value=VeriCropAPI ^
  --start-time 2026-03-08T00:00:00Z ^
  --end-time 2026-03-08T23:59:59Z ^
  --period 3600 ^
  --statistics Sum ^
  --region ap-south-1
```

---

**Last Updated**: March 8, 2026
**Status**: Active troubleshooting guide
