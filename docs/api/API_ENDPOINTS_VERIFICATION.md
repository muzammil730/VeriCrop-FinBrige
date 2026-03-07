# VeriCrop FinBridge - API Endpoints Verification

## 🌐 Base URL
```
https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/
```

## ✅ Configured Endpoints

### 1. Claims Management

#### POST /claims
**Purpose**: Submit new crop damage claim
**Lambda**: submission-validator
**Frontend**: Claim Submission page
**Status**: ✅ Configured

**Test Command**:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/claims \
  -H "Content-Type: application/json" \
  -d '{
    "farmerId": "F12345",
    "farmerName": "Test Farmer",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "damageType": "drought",
    "estimatedDamage": 50000,
    "description": "Severe drought damage",
    "timestamp": "2026-03-07T12:00:00.000Z"
  }'
```

#### POST /claims/validate
**Purpose**: Validate claim data
**Lambda**: result-consolidator
**Status**: ✅ Configured

#### POST /claims/reject
**Purpose**: Reject fraudulent claim
**Lambda**: claim-rejector
**Status**: ✅ Configured

---

### 2. Certificate Management

#### POST /certificates
**Purpose**: Issue loss certificate
**Lambda**: certificate-issuer
**Status**: ✅ Configured

#### POST /certificates/verify
**Purpose**: Verify certificate authenticity
**Lambda**: certificate-verifier
**Frontend**: Verify Certificate page
**Status**: ✅ Configured

**Test Command**:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/certificates/verify \
  -H "Content-Type: application/json" \
  -d '{
    "certificateId": "CERT-2026-TEST"
  }'
```

---

### 3. Bridge Loans

#### POST /loans
**Purpose**: Request zero-interest bridge loan
**Lambda**: bridge-loan-calculator
**Frontend**: Bridge Loan page
**Status**: ✅ Configured

**Test Command**:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/loans \
  -H "Content-Type: application/json" \
  -d '{
    "certificateId": "CERT-2026-TEST"
  }'
```

---

### 4. Payment Processing

#### POST /payments
**Purpose**: Process UPI payments
**Lambda**: payment-gateway-handler
**Status**: ✅ Configured

#### POST /payouts
**Purpose**: Process insurance payouts
**Lambda**: insurance-payout-processor
**Status**: ✅ Configured

---

### 5. Analysis Endpoints

#### POST /analysis/solar
**Purpose**: Calculate solar azimuth for fraud detection
**Lambda**: solar-azimuth-calculator
**Frontend**: Home page demo
**Status**: ✅ Configured

**Test Command**:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/analysis/solar \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": "demo-123",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "timestamp": "2026-03-07T12:00:00.000Z"
  }'
```

#### POST /analysis/shadow
**Purpose**: Compare shadow direction in video
**Lambda**: shadow-comparator
**Status**: ✅ Configured

#### POST /analysis/weather
**Purpose**: Integrate weather data
**Lambda**: weather-data-integrator
**Status**: ✅ Configured

#### POST /analysis/weather-correlation
**Purpose**: Correlate weather with damage
**Lambda**: weather-correlation-analyzer
**Status**: ✅ Configured

#### POST /analysis/crop-damage
**Purpose**: Classify crop damage using ML
**Lambda**: crop-damage-classifier
**Status**: ✅ Configured

#### POST /analysis/rekognition
**Purpose**: Analyze video using Rekognition
**Lambda**: rekognition-video-analyzer
**Status**: ✅ Configured

#### POST /analysis/bedrock
**Purpose**: AI-powered claim analysis
**Lambda**: bedrock-claim-analyzer
**Status**: ✅ Configured

---

### 6. Evidence Storage

#### POST /evidence
**Purpose**: Store video/photo evidence in S3
**Lambda**: evidence-storage-handler
**Status**: ✅ Configured

---

### 7. Human-in-the-Loop (HITL)

#### POST /hitl
**Purpose**: Route claims to human review
**Lambda**: hitl-router
**Status**: ✅ Configured

#### POST /hitl/result
**Purpose**: Process human review results
**Lambda**: hitl-result-processor
**Status**: ✅ Configured

---

## 🔗 Frontend-to-API Mapping

### Home Page (/)
- **Endpoint**: `POST /analysis/solar`
- **Function**: Solar azimuth calculation demo
- **Status**: ✅ Connected

### Claim Submission (/claim-submission)
- **Primary**: `POST /claims`
- **Secondary**: `POST /evidence` (for video upload)
- **Status**: ✅ Connected

### Verify Certificate (/verify-certificate)
- **Endpoint**: `POST /certificates/verify`
- **Status**: ✅ Connected

### Bridge Loan (/bridge-loan)
- **Endpoint**: `POST /loans`
- **Status**: ✅ Connected

---

## 🧪 Quick Verification Script

Save this as `test-apis.sh`:

```bash
#!/bin/bash

BASE_URL="https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod"

echo "Testing VeriCrop FinBridge APIs..."
echo "=================================="

# Test 1: Solar Azimuth
echo -e "\n1. Testing Solar Azimuth API..."
curl -X POST "$BASE_URL/analysis/solar" \
  -H "Content-Type: application/json" \
  -d '{"claimId":"test-1","latitude":19.0760,"longitude":72.8777,"timestamp":"2026-03-07T12:00:00.000Z"}' \
  -w "\nStatus: %{http_code}\n"

# Test 2: Claims Submission
echo -e "\n2. Testing Claims Submission API..."
curl -X POST "$BASE_URL/claims" \
  -H "Content-Type: application/json" \
  -d '{"farmerId":"F12345","farmerName":"Test","latitude":19.0760,"longitude":72.8777,"damageType":"drought","estimatedDamage":50000,"description":"Test","timestamp":"2026-03-07T12:00:00.000Z"}' \
  -w "\nStatus: %{http_code}\n"

# Test 3: Certificate Verification
echo -e "\n3. Testing Certificate Verification API..."
curl -X POST "$BASE_URL/certificates/verify" \
  -H "Content-Type: application/json" \
  -d '{"certificateId":"CERT-2026-TEST"}' \
  -w "\nStatus: %{http_code}\n"

# Test 4: Bridge Loan
echo -e "\n4. Testing Bridge Loan API..."
curl -X POST "$BASE_URL/loans" \
  -H "Content-Type: application/json" \
  -d '{"certificateId":"CERT-2026-TEST"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n=================================="
echo "API Testing Complete!"
```

Run with:
```bash
chmod +x test-apis.sh
./test-apis.sh
```

---

## 🔍 Verify Deployment Status

### Check API Gateway
```bash
aws apigateway get-rest-apis --region ap-south-1 --query 'items[?name==`VeriCrop FinBridge API`]'
```

### Check Lambda Functions
```bash
aws lambda list-functions --region ap-south-1 --query 'Functions[?starts_with(FunctionName, `VeriCrop`)].FunctionName'
```

### Check CloudWatch Logs
```bash
# View logs for a specific Lambda
aws logs tail /aws/lambda/VeriCrop-SubmissionValidator --region ap-south-1 --follow
```

---

## 🐛 Troubleshooting

### Issue: 403 Forbidden
**Cause**: CORS not configured or API key required
**Solution**: 
- Check API Gateway CORS settings
- Verify `apiKeyRequired: false` in infrastructure
- Check Lambda execution role permissions

### Issue: 502 Bad Gateway
**Cause**: Lambda function error
**Solution**:
- Check CloudWatch Logs for Lambda errors
- Verify Lambda has correct IAM permissions
- Check Lambda timeout settings (default: 30s)

### Issue: 504 Gateway Timeout
**Cause**: Lambda execution exceeds timeout
**Solution**:
- Increase Lambda timeout in infrastructure
- Optimize Lambda code
- Check for infinite loops or blocking operations

### Issue: CORS Error in Browser
**Cause**: Missing CORS headers
**Solution**:
- Add CORS configuration to API Gateway
- Ensure Lambda returns proper CORS headers
- Check browser console for specific CORS error

---

## 📊 Expected Response Formats

### Solar Azimuth Response
```json
{
  "claimId": "demo-123",
  "solarAzimuth": 201.89,
  "shadowDirection": 21.89,
  "calculation": {
    "declination": -7.89,
    "hourAngle": 37.5,
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "timestamp": "2026-03-07T12:00:00.000Z"
}
```

### Claims Submission Response
```json
{
  "claimId": "CLAIM-2026-XXXXX",
  "status": "APPROVED",
  "validationScore": 95,
  "certificateId": "CERT-2026-XXXXX",
  "message": "Claim processed successfully"
}
```

### Certificate Verification Response
```json
{
  "valid": true,
  "certificateId": "CERT-2026-XXXXX",
  "farmerId": "F12345",
  "damageAmount": 50000,
  "validationScore": 95,
  "status": "ACTIVE",
  "issuedAt": "2026-03-07T12:00:00.000Z",
  "hash": "abc123...",
  "blockchainVerified": true
}
```

### Bridge Loan Response
```json
{
  "loanId": "LOAN-2026-XXXXX",
  "loanAmount": 35000,
  "damageAmount": 50000,
  "certificateId": "CERT-2026-XXXXX",
  "status": "APPROVED",
  "interestRate": 0,
  "disbursementMethod": "UPI"
}
```

---

## ✅ Verification Checklist

- [ ] API Gateway deployed in ap-south-1
- [ ] All 18 Lambda functions deployed
- [ ] Solar azimuth endpoint responds
- [ ] Claims submission endpoint responds
- [ ] Certificate verification endpoint responds
- [ ] Bridge loan endpoint responds
- [ ] CORS configured for frontend domain
- [ ] CloudWatch Logs enabled for all Lambdas
- [ ] IAM roles have correct permissions
- [ ] DynamoDB tables accessible by Lambdas
- [ ] S3 buckets accessible by Lambdas
- [ ] Step Functions can invoke Lambdas
- [ ] Frontend can call all APIs
- [ ] Error responses are properly formatted
- [ ] API responses include CORS headers

---

## 🔐 Security Configuration

### Current Setup (MVP)
- **Authentication**: None (open API for demo)
- **Authorization**: None
- **API Key**: Not required
- **CORS**: Enabled for all origins

### Production Recommendations
- Add Amazon Cognito authentication
- Implement API key requirement
- Restrict CORS to specific domains
- Add rate limiting
- Enable AWS WAF
- Add request validation
- Implement JWT token validation

---

## 📈 Monitoring

### CloudWatch Metrics to Monitor
- API Gateway 4XX errors
- API Gateway 5XX errors
- Lambda invocation count
- Lambda error count
- Lambda duration
- Lambda throttles
- DynamoDB read/write capacity
- S3 request count

### CloudWatch Alarms
- Lambda error rate > 5%
- API Gateway 5XX rate > 1%
- Lambda duration > 25 seconds
- DynamoDB throttled requests > 0

---

## 🔗 AWS Console Links

- **API Gateway**: https://ap-south-1.console.aws.amazon.com/apigateway/home?region=ap-south-1
- **Lambda Functions**: https://ap-south-1.console.aws.amazon.com/lambda/home?region=ap-south-1
- **CloudWatch Logs**: https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#logsV2:log-groups
- **DynamoDB Tables**: https://ap-south-1.console.aws.amazon.com/dynamodbv2/home?region=ap-south-1
- **S3 Buckets**: https://s3.console.aws.amazon.com/s3/buckets?region=ap-south-1

---

**Last Updated**: March 7, 2026
**API Gateway URL**: https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/
**Region**: ap-south-1 (Mumbai, India)
