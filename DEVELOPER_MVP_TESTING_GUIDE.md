# VeriCrop FinBridge - Developer MVP Testing Guide

## 🎯 Purpose
Test the complete MVP functionality using API calls and mock data - **NO real crop damage videos required**.

---

## 📋 Prerequisites

### Tools Required:
1. **Terminal/Command Prompt** (PowerShell, CMD, or Bash)
2. **curl** (pre-installed on Windows 10+, macOS, Linux)
3. **Internet Connection**
4. **Text Editor** (to save Certificate IDs)

### API Endpoints:
- **Base URL**: `https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod`
- **Frontend**: `https://main.d564kvq3much7.amplifyapp.com`

---

## 🧪 TESTING WORKFLOW

### Test Flow Overview:
```
1. Submit Mock Claim → 2. Get Certificate → 3. Calculate Bridge Loan → 4. Verify Certificate
```

---

## TEST 1: Submit a Mock Claim (Without Video)

### Purpose:
Test the claim submission endpoint with mock data to get a certificate issued.

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/claims \
  -H "Content-Type: application/json" \
  -d '{
    "farmerName": "Ramesh Kumar",
    "phoneNumber": "9876543210",
    "cropType": "Wheat",
    "damageType": "Flood",
    "damagePercentage": 65,
    "estimatedLoss": 50000,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "timestamp": "2026-03-07T10:30:00Z",
    "videoUrl": "s3://vericrop-evidence/mock-video.mp4",
    "mockTest": true
  }'
```

### Expected Response:
```json
{
  "statusCode": 200,
  "body": {
    "claimId": "CLAIM-2026-03-07-12345",
    "status": "APPROVED",
    "certificateId": "CERT-2026-03-07-67890",
    "validationResults": {
      "solarAzimuth": "PASS",
      "weatherCorrelation": "PASS",
      "aiClassification": "Flood damage detected",
      "bedrockAnalysis": "APPROVE"
    },
    "certificate": {
      "certificateId": "CERT-2026-03-07-67890",
      "farmerName": "Ramesh Kumar",
      "damageAmount": 50000,
      "issueDate": "2026-03-07T10:35:00Z",
      "hash": "a1b2c3d4e5f6..."
    }
  }
}
```

### What to Save:
- **Claim ID**: `CLAIM-2026-03-07-12345`
- **Certificate ID**: `CERT-2026-03-07-67890`
- **SHA-256 Hash**: `a1b2c3d4e5f6...`

---

## TEST 2: Issue Certificate Directly

### Purpose:
Test the certificate issuance endpoint independently.

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/certificates \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": "CLAIM-2026-03-07-12345",
    "farmerName": "Ramesh Kumar",
    "phoneNumber": "9876543210",
    "cropType": "Wheat",
    "damageType": "Flood",
    "damageAmount": 50000,
    "latitude": 19.0760,
    "longitude": 72.8777
  }'
```

### Expected Response:
```json
{
  "statusCode": 200,
  "body": {
    "certificateId": "CERT-2026-03-07-67890",
    "claimId": "CLAIM-2026-03-07-12345",
    "farmerName": "Ramesh Kumar",
    "damageAmount": 50000,
    "issueDate": "2026-03-07T10:35:00Z",
    "hash": "a1b2c3d4e5f6...",
    "status": "ISSUED"
  }
}
```

---

## TEST 3: Verify Certificate (Blockchain Validation)

### Purpose:
Test certificate verification using the Certificate ID from Test 1 or Test 2.

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/certificates/verify \
  -H "Content-Type: application/json" \
  -d '{
    "certificateId": "CERT-2026-03-07-67890"
  }'
```

### Expected Response (Valid Certificate):
```json
{
  "statusCode": 200,
  "body": {
    "valid": true,
    "certificateId": "CERT-2026-03-07-67890",
    "farmerName": "Ramesh Kumar",
    "damageAmount": 50000,
    "issueDate": "2026-03-07T10:35:00Z",
    "hash": "a1b2c3d4e5f6...",
    "hashMatch": true,
    "message": "Certificate is valid and tamper-evident"
  }
}
```

### Test Invalid Certificate:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/certificates/verify \
  -H "Content-Type: application/json" \
  -d '{
    "certificateId": "CERT-2026-03-07-99999"
  }'
```

### Expected Response (Invalid):
```json
{
  "statusCode": 404,
  "body": {
    "valid": false,
    "message": "Certificate not found"
  }
}
```

---

## TEST 4: Calculate Bridge Loan

### Purpose:
Test bridge loan calculation (70% of damage amount, 0% interest).

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/loans \
  -H "Content-Type: application/json" \
  -d '{
    "certificateId": "CERT-2026-03-07-67890",
    "damageAmount": 50000
  }'
```

### Expected Response:
```json
{
  "statusCode": 200,
  "body": {
    "loanId": "LOAN-2026-03-07-11111",
    "certificateId": "CERT-2026-03-07-67890",
    "principalAmount": 35000,
    "interestRate": 0,
    "damageAmount": 50000,
    "loanPercentage": 70,
    "disbursementMethod": "UPI",
    "repaymentSource": "Insurance Payout",
    "status": "APPROVED",
    "message": "Bridge loan approved for ₹35,000 at 0% interest"
  }
}
```

### Validation:
- Loan Amount = 50000 × 0.70 = ₹35,000 ✓
- Interest Rate = 0% ✓

---

## TEST 5: Solar Azimuth Calculation

### Purpose:
Test the physics-based fraud detection (solar azimuth calculator).

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/analysis/solar \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 19.0760,
    "longitude": 72.8777,
    "timestamp": "2026-03-07T10:30:00Z"
  }'
```

### Expected Response:
```json
{
  "statusCode": 200,
  "body": {
    "solarAzimuth": 245.3,
    "solarElevation": 45.2,
    "expectedShadowDirection": "Northeast",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "timestamp": "2026-03-07T10:30:00Z",
    "calculation": {
      "solarDeclination": -7.8,
      "hourAngle": 37.5,
      "formula": "sin α = sin Φ sin δ + cos Φ cos δ cos h"
    }
  }
}
```

### What to Check:
- Solar azimuth angle is calculated (e.g., 245.3°)
- Expected shadow direction is provided
- Formula is displayed

---

## TEST 6: Weather Data Integration

### Purpose:
Test weather data fetching from IMD API.

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/analysis/weather \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 19.0760,
    "longitude": 72.8777,
    "date": "2026-03-07"
  }'
```

### Expected Response:
```json
{
  "statusCode": 200,
  "body": {
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777,
      "city": "Mumbai"
    },
    "date": "2026-03-07",
    "weather": {
      "temperature": 28.5,
      "humidity": 75,
      "rainfall": 0,
      "windSpeed": 12,
      "conditions": "Partly Cloudy"
    },
    "source": "IMD API"
  }
}
```

---

## TEST 7: Weather Correlation Analysis

### Purpose:
Test weather correlation with damage type.

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/analysis/weather-correlation \
  -H "Content-Type: application/json" \
  -d '{
    "damageType": "Flood",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "date": "2026-03-07"
  }'
```

### Expected Response:
```json
{
  "statusCode": 200,
  "body": {
    "damageType": "Flood",
    "weatherData": {
      "rainfall": 150,
      "conditions": "Heavy Rain"
    },
    "correlation": "HIGH",
    "confidence": 0.92,
    "analysis": "Weather data supports flood damage claim",
    "result": "PASS"
  }
}
```

---

## TEST 8: Bedrock AI Analysis

### Purpose:
Test Amazon Bedrock (Claude 3 Sonnet) claim analysis.

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/analysis/bedrock \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": "CLAIM-2026-03-07-12345",
    "farmerName": "Ramesh Kumar",
    "cropType": "Wheat",
    "damageType": "Flood",
    "damagePercentage": 65,
    "validationResults": {
      "solarAzimuth": "PASS",
      "weatherCorrelation": "PASS",
      "aiClassification": "Flood damage detected"
    }
  }'
```

### Expected Response:
```json
{
  "statusCode": 200,
  "body": {
    "recommendation": "APPROVE",
    "confidence": 0.95,
    "reasoning": "All forensic validations passed. Weather data confirms flood conditions. AI classification matches damage type.",
    "fraudIndicators": [],
    "explanation": {
      "english": "The claim is legitimate based on physics-based validation and weather correlation.",
      "hindi": "भौतिकी-आधारित सत्यापन और मौसम सहसंबंध के आधार पर दावा वैध है।"
    }
  }
}
```

---

## TEST 9: Crop Damage Classification (SageMaker)

### Purpose:
Test AI crop damage classification.

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/analysis/crop-damage \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "s3://vericrop-evidence/mock-image.jpg",
    "cropType": "Wheat"
  }'
```

### Expected Response:
```json
{
  "statusCode": 200,
  "body": {
    "damageType": "Flood",
    "confidence": 0.89,
    "severity": "High",
    "affectedArea": 65,
    "model": "SageMaker Neo Optimized",
    "inferenceTime": 245
  }
}
```

---

## TEST 10: Claim Validation

### Purpose:
Test claim validation logic.

### Command:
```bash
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/claims/validate \
  -H "Content-Type: application/json" \
  -d '{
    "farmerName": "Ramesh Kumar",
    "phoneNumber": "9876543210",
    "cropType": "Wheat",
    "damageType": "Flood",
    "damagePercentage": 65,
    "estimatedLoss": 50000
  }'
```

### Expected Response:
```json
{
  "statusCode": 200,
  "body": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "validations": {
      "farmerName": "PASS",
      "phoneNumber": "PASS",
      "cropType": "PASS",
      "damagePercentage": "PASS",
      "estimatedLoss": "PASS"
    }
  }
}
```

---

## 🎯 COMPLETE END-TO-END TEST SEQUENCE

### Run these commands in order:

```bash
# Step 1: Submit Mock Claim
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/claims \
  -H "Content-Type: application/json" \
  -d '{"farmerName":"Ramesh Kumar","phoneNumber":"9876543210","cropType":"Wheat","damageType":"Flood","damagePercentage":65,"estimatedLoss":50000,"latitude":19.0760,"longitude":72.8777,"timestamp":"2026-03-07T10:30:00Z","videoUrl":"s3://vericrop-evidence/mock-video.mp4","mockTest":true}'

# Save the certificateId from response (e.g., CERT-2026-03-07-67890)

# Step 2: Verify Certificate
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/certificates/verify \
  -H "Content-Type: application/json" \
  -d '{"certificateId":"CERT-2026-03-07-67890"}'

# Step 3: Calculate Bridge Loan
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/loans \
  -H "Content-Type: application/json" \
  -d '{"certificateId":"CERT-2026-03-07-67890","damageAmount":50000}'

# Step 4: Test Solar Azimuth
curl -X POST https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/analysis/solar \
  -H "Content-Type: application/json" \
  -d '{"latitude":19.0760,"longitude":72.8777,"timestamp":"2026-03-07T10:30:00Z"}'
```

---

## 🖥️ FRONTEND TESTING (Without Video Upload)

### Test 1: Homepage GPS Detection

1. Open: https://main.d564kvq3much7.amplifyapp.com
2. Allow location permissions
3. Verify GPS coordinates appear
4. Verify solar azimuth is calculated

**Expected:**
- Latitude/Longitude displayed
- Solar azimuth angle shown (e.g., 245.3°)

### Test 2: Claim Submission Form (Fill Only)

1. Navigate to: https://main.d564kvq3much7.amplifyapp.com/claim-submission
2. Fill all fields EXCEPT video upload:
   - Farmer Name: Ramesh Kumar
   - Phone: 9876543210
   - Crop Type: Wheat
   - Damage Type: Flood
   - Damage %: 65
   - Loss Amount: 50000
3. **DO NOT submit** (since video is required)

**Expected:**
- All fields accept input
- GPS auto-detects location
- Form validation works

### Test 3: Certificate Verification

1. Navigate to: https://main.d564kvq3much7.amplifyapp.com/verify-certificate
2. Enter a Certificate ID from API test (e.g., CERT-2026-03-07-67890)
3. Click "Verify Certificate"

**Expected:**
- Status shows "VALID" or "INVALID"
- Certificate details displayed
- SHA-256 hash shown

### Test 4: Bridge Loan Calculator

1. Navigate to: https://main.d564kvq3much7.amplifyapp.com/bridge-loan
2. Enter Certificate ID from API test
3. Click "Calculate Loan"

**Expected:**
- Loan amount = 70% of damage
- Interest rate = 0%
- Approval status shown

---

## ✅ SUCCESS CRITERIA

### Your MVP test is successful if:

1. ✅ **Claim Submission API Works**
   - Returns 200 status code
   - Generates Claim ID and Certificate ID
   - Validation results are returned

2. ✅ **Certificate Issuance Works**
   - Certificate ID generated
   - SHA-256 hash created
   - Stored in DynamoDB

3. ✅ **Certificate Verification Works**
   - Valid certificates return "VALID"
   - Invalid certificates return "INVALID"
   - Hash verification works

4. ✅ **Bridge Loan Calculation Works**
   - Loan = 70% of damage amount
   - Interest = 0%
   - Approval status returned

5. ✅ **Solar Azimuth Calculation Works**
   - Azimuth angle calculated
   - Shadow direction provided
   - Physics formula applied

6. ✅ **Weather Integration Works**
   - Weather data fetched
   - Correlation analysis performed
   - PASS/FAIL result returned

7. ✅ **Bedrock AI Analysis Works**
   - Recommendation provided (APPROVE/REJECT)
   - Confidence score returned
   - Bilingual explanation (English + Hindi)

8. ✅ **Frontend Pages Load**
   - Homepage loads with GPS detection
   - Claim submission form works
   - Certificate verification works
   - Bridge loan calculator works

---

## 🐛 Troubleshooting

### Issue 1: API Returns 404
**Solution:**
- Check API Gateway URL is correct
- Verify endpoint path (e.g., `/claims` not `/claim`)
- Check Lambda functions are deployed

### Issue 2: API Returns 500
**Solution:**
- Check CloudWatch logs for Lambda errors
- Verify DynamoDB tables exist
- Check IAM permissions

### Issue 3: Certificate Not Found
**Solution:**
- Verify Certificate ID is correct (case-sensitive)
- Check DynamoDB table has the entry
- Ensure claim was approved (not rejected)

### Issue 4: CORS Errors in Frontend
**Solution:**
- Verify API Gateway has CORS enabled
- Check browser console for specific error
- Try using curl to isolate frontend vs backend issue

---

## 📊 Test Results Template

Use this template to document your test results:

```
=== VeriCrop FinBridge MVP Test Results ===
Date: [DATE]
Tester: [YOUR NAME]

TEST 1: Submit Mock Claim
Status: [ ] PASS [ ] FAIL
Claim ID: _______________
Certificate ID: _______________
Notes: _______________

TEST 2: Issue Certificate
Status: [ ] PASS [ ] FAIL
Certificate ID: _______________
SHA-256 Hash: _______________
Notes: _______________

TEST 3: Verify Certificate (Valid)
Status: [ ] PASS [ ] FAIL
Result: _______________
Notes: _______________

TEST 4: Verify Certificate (Invalid)
Status: [ ] PASS [ ] FAIL
Result: _______________
Notes: _______________

TEST 5: Calculate Bridge Loan
Status: [ ] PASS [ ] FAIL
Loan Amount: ₹_______________
Interest Rate: ___%
Notes: _______________

TEST 6: Solar Azimuth Calculation
Status: [ ] PASS [ ] FAIL
Azimuth Angle: _______________°
Notes: _______________

TEST 7: Weather Data Integration
Status: [ ] PASS [ ] FAIL
Weather Conditions: _______________
Notes: _______________

TEST 8: Weather Correlation
Status: [ ] PASS [ ] FAIL
Correlation: _______________
Notes: _______________

TEST 9: Bedrock AI Analysis
Status: [ ] PASS [ ] FAIL
Recommendation: _______________
Confidence: ___%
Notes: _______________

TEST 10: Crop Damage Classification
Status: [ ] PASS [ ] FAIL
Damage Type: _______________
Confidence: ___%
Notes: _______________

FRONTEND TESTS:
Homepage GPS: [ ] PASS [ ] FAIL
Claim Form: [ ] PASS [ ] FAIL
Certificate Verification: [ ] PASS [ ] FAIL
Bridge Loan: [ ] PASS [ ] FAIL

OVERALL STATUS: [ ] ALL PASS [ ] SOME FAILURES
```

---

## 🎥 Demo Preparation

### For Hackathon Judges (Without Real Videos):

**Approach 1: API Demo (Recommended)**
- Show curl commands in terminal
- Display JSON responses
- Highlight key fields (Certificate ID, SHA-256 hash, loan amount)
- Show CloudWatch logs for Lambda execution

**Approach 2: Frontend Demo (Partial)**
- Show homepage with GPS detection
- Fill claim submission form (don't submit)
- Use pre-generated Certificate ID for verification
- Show bridge loan calculation

**Approach 3: Hybrid Demo (Best)**
- Use API to generate certificate
- Use frontend to verify certificate
- Show bridge loan calculation in frontend
- Display AWS architecture diagram

---

## 📈 Performance Metrics

### Track these during testing:

1. **API Response Times:**
   - Claim submission: <5 seconds
   - Certificate verification: <2 seconds
   - Bridge loan calculation: <1 second
   - Solar azimuth: <1 second

2. **Success Rates:**
   - Valid certificate verification: 100%
   - Invalid certificate detection: 100%
   - Loan calculation accuracy: 100%

3. **Data Integrity:**
   - SHA-256 hash matches: 100%
   - Loan amount = 70% of damage: 100%
   - Interest rate = 0%: 100%

---

## 🏆 Final Validation

Before declaring MVP test complete:

- [ ] All 10 API tests passed
- [ ] Certificate issued successfully
- [ ] Certificate verification works (valid and invalid)
- [ ] Bridge loan calculated correctly (70%, 0%)
- [ ] Solar azimuth calculation works
- [ ] Weather integration works
- [ ] Bedrock AI analysis works
- [ ] Frontend pages load without errors
- [ ] GPS detection works on frontend
- [ ] No console errors in browser

---

## 📞 Next Steps

After successful testing:

1. **Document Results** - Fill the test results template
2. **Take Screenshots** - Capture API responses and frontend pages
3. **Record Demo Video** - Show the complete workflow
4. **Prepare Presentation** - Highlight key features for judges
5. **Update Documentation** - Add test results to FINAL_MVP_SUMMARY.md

---

**Built with ❤️ for Indian Farmers**

*Testing the MVP that reduces claim-to-cash time from 6 months to 60 seconds*

**Last Updated:** March 7, 2026
