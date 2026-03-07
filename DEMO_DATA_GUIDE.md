# VeriCrop FinBridge - Demo Data Guide

## Overview

Your MVP now works with **real AWS APIs** but includes **demo datasets** for predictable testing and presentations. This gives you the best of both worlds:

✅ Real-world functionality with AWS backend
✅ Predictable demo data for presentations
✅ Ability to test with new data anytime

## Quick Start

### 1. Seed Demo Data (One-Time Setup)

```bash
cd scripts
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
node seed-demo-data-to-dynamodb.js
```

This creates:
- 5 approved claims with certificates
- 2 rejected claims (fraud detected)
- 3 pending claims (in review)

### 2. Get Demo Inputs for Live Testing

```bash
node seed-demo-environment.js
```

This calculates perfect inputs for submitting new claims that will pass all validations.

## Demo Datasets

### Approved Claims (Ready for Bridge Loan)

These claims have been approved and have certificates. Use these certificate IDs to test the bridge loan feature:

| Certificate ID | Farmer Name | Damage Amount | Loan Amount (70%) |
|----------------|-------------|---------------|-------------------|
| CERT-2026-03-08-10000 | Ramesh Kumar | ₹50,000 | ₹35,000 |
| CERT-2026-03-07-10001 | Priya Sharma | ₹75,000 | ₹52,500 |
| CERT-2026-03-06-10002 | Suresh Patel | ₹60,000 | ₹42,000 |
| CERT-2026-03-05-10003 | Lakshmi Reddy | ₹45,000 | ₹31,500 |
| CERT-2026-03-04-10004 | Vijay Singh | ₹80,000 | ₹56,000 |

### Rejected Claims (Fraud Detection Demo)

These claims were rejected by the AI fraud detection system:

| Claim ID | Farmer Name | Reason | Damage % |
|----------|-------------|--------|----------|
| CLAIM-2026-03-03-10005 | Anita Desai | Suspicious damage >90% | 95% |
| CLAIM-2026-03-02-10006 | Rajesh Yadav | Weather mismatch | 92% |

### Pending Claims (In Review)

These claims are awaiting manual review:

| Claim ID | Farmer Name | Status | Validation Score |
|----------|-------------|--------|------------------|
| CLAIM-2026-03-01-10007 | Meena Kumari | PENDING | 75% |
| CLAIM-2026-02-29-10008 | Ramesh Kumar | PENDING | 68% |
| CLAIM-2026-02-28-10009 | Priya Sharma | PENDING | 72% |

## Testing Workflows

### Workflow 1: Certificate Verification

**URL**: https://master.d564kvq3much7.amplifyapp.com/verify-certificate

**Steps**:
1. Enter any certificate ID from the approved claims table above
2. Click "Verify Certificate"
3. See real-time verification with SHA-256 hash validation

**Expected Result**:
- ✅ Certificate Valid
- Shows farmer details, damage amount, validation score
- Displays cryptographic hash
- Shows blockchain storage info

### Workflow 2: Bridge Loan Request

**URL**: https://master.d564kvq3much7.amplifyapp.com/bridge-loan

**Steps**:
1. Enter any certificate ID from the approved claims table above
2. Click "Request Bridge Loan"
3. See instant loan approval with 70% of damage amount

**Expected Result**:
- ✅ Loan Approved
- Shows loan amount (70% of damage)
- 0% interest rate
- UPI disbursement details
- Auto-repayment from insurance

### Workflow 3: Submit New Claim (Live Demo)

**URL**: https://master.d564kvq3much7.amplifyapp.com/claim-submission

**Steps**:
1. Run `node scripts/seed-demo-environment.js` to get perfect inputs
2. Fill form with the calculated inputs:
   - Farmer Name: Ramesh Kumar
   - Phone: 9999999999
   - Crop Type: Wheat
   - Damage Type: Flood
   - Damage %: 65%
   - Estimated Loss: ₹50,000
   - GPS: Use calculated coordinates
   - Timestamp: Use calculated timestamp
3. Upload any video with visible shadows
4. Submit claim

**Expected Result**:
- ✅ Claim Approved
- Validation Score: 95%
- All validations pass (Solar Azimuth, Weather, AI, Bedrock)
- Certificate ID generated
- Can immediately use for bridge loan

### Workflow 4: Fraud Detection Demo

**URL**: https://master.d564kvq3much7.amplifyapp.com/claim-submission

**Steps**:
1. Fill form with suspicious data:
   - Damage %: 95% (suspiciously high)
   - Estimated Loss: ₹150,000 (very high)
2. Submit claim

**Expected Result**:
- ❌ Claim Rejected
- Fraud Detection: AI flagged suspicious damage percentage
- Validation Score: <50%
- Solar Azimuth: FAIL
- AI Classification: FRAUD_DETECTED

### Workflow 5: Solar Azimuth Calculator

**URL**: https://master.d564kvq3much7.amplifyapp.com/

**Steps**:
1. Enter GPS coordinates: 19.0760, 72.8777
2. Enter timestamp: 2026-03-07T14:00:00+05:30
3. Click "Calculate Solar Azimuth"

**Expected Result**:
- Solar Azimuth: ~201.89°
- Shadow Direction: ~21.89°
- Declination: ~-7.89°
- Hour Angle: ~37.50°
- Shows physics formula

## Real-World Testing

### Submit Real Claims

The system works with **any real data**:

1. Use actual GPS coordinates from your location
2. Use current timestamp
3. Upload real field videos
4. Enter actual damage estimates

The backend will:
- Calculate real solar azimuth
- Fetch real weather data
- Run AI analysis on video
- Perform fraud detection
- Generate valid certificates

### Monitor AWS Costs

Real API calls incur AWS costs:
- Lambda invocations: $0.20 per 1M requests
- Bedrock AI: ~$0.01 per request
- Rekognition: ~$0.10 per video minute
- DynamoDB: ~$0.25 per 1M reads/writes

**Tip**: Use demo data for presentations to minimize costs.

## Switching Between Demo and Real Data

### Use Demo Data (Recommended for Presentations)

```bash
# Seed demo data once
node scripts/seed-demo-data-to-dynamodb.js

# Use demo certificate IDs for testing
# Use calculated inputs for new claims
```

### Use Real Data (For Real-World Testing)

```bash
# Just submit claims with real data
# No seeding needed
# System creates records automatically
```

## Troubleshooting

### Demo Data Not Found

**Problem**: Certificate verification fails with "not found"

**Solution**:
```bash
# Re-seed demo data
node scripts/seed-demo-data-to-dynamodb.js
```

### API Errors

**Problem**: API calls fail with 500 errors

**Solution**:
1. Check AWS credentials: `aws sts get-caller-identity`
2. Check Lambda logs in CloudWatch
3. Verify DynamoDB table exists
4. Check API Gateway endpoints

### Validation Failures

**Problem**: Claims get rejected unexpectedly

**Solution**:
1. Use calculated inputs from `seed-demo-environment.js`
2. Ensure GPS coordinates are valid
3. Use timestamps within ±1 hour of current time
4. Keep damage percentage <90%
5. Keep estimated loss <₹100,000

## Demo Script for Presentations

### 30-Second Demo

1. **Show Certificate Verification** (10 sec)
   - Enter: `CERT-2026-03-08-10000`
   - Show: Valid certificate with hash

2. **Show Bridge Loan** (10 sec)
   - Enter: `CERT-2026-03-08-10000`
   - Show: ₹35,000 loan approved instantly

3. **Show Solar Azimuth** (10 sec)
   - Enter: 19.0760, 72.8777, current time
   - Show: Real-time calculation

### 3-Minute Demo

1. **Intro** (30 sec)
   - Problem: Insurance fraud, slow payouts
   - Solution: AI-powered verification, instant loans

2. **Submit Claim** (60 sec)
   - Fill form with demo inputs
   - Upload video
   - Show real-time validation
   - Get certificate

3. **Verify Certificate** (30 sec)
   - Show blockchain storage
   - Show SHA-256 hash
   - Show tamper-proof verification

4. **Request Bridge Loan** (30 sec)
   - Enter certificate ID
   - Show instant approval
   - Show 0% interest, UPI disbursement

5. **Show Fraud Detection** (30 sec)
   - Submit suspicious claim (95% damage)
   - Show AI rejection
   - Show fraud detection reasoning

## Next Steps

1. ✅ Seed demo data: `node scripts/seed-demo-data-to-dynamodb.js`
2. ✅ Test all workflows with demo data
3. ✅ Practice demo script
4. ✅ Test with real data
5. ✅ Monitor AWS costs
6. ✅ Deploy to production

---

**Status**: ✅ Working MVP with real APIs and demo datasets
**Last Updated**: March 8, 2026
**API Gateway**: https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/
