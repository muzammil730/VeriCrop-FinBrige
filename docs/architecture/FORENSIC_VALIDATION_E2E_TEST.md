# End-to-End Forensic Validation Test

## Overview

This document describes the end-to-end integration test for VeriCrop FinBridge's forensic validation components (Task 5 checkpoint).

## Test Coverage

The test validates that all forensic validation Lambda functions work together correctly:

1. **Solar Azimuth Calculator** (Task 2.1)
   - Calculates expected shadow angle using solar geometry
   - Validates azimuth is in valid range [0, 360)
   - Returns shadow direction for fraud detection

2. **Shadow Comparator** (Task 2.3)
   - Compares actual vs expected shadow angles
   - Detects fraud when variance exceeds ±5°
   - Calculates fraud risk score

3. **Weather Data Integrator** (Task 3.1)
   - Fetches weather data from IMD API or cache
   - Stores data in DynamoDB with 15-min TTL
   - Returns temperature, rainfall, humidity, wind speed

4. **Weather Correlation Analyzer** (Task 3.2)
   - Analyzes weather patterns against damage types
   - Calculates correlation score (0-100)
   - Returns APPROVE/HITL_REVIEW/REJECT recommendation

5. **Crop Damage Classifier** (Task 4.3)
   - Classifies crop damage using AI model
   - Returns damage type, confidence, severity
   - Stores results in DynamoDB

6. **DynamoDB Data Persistence**
   - Verifies claim data is stored correctly
   - Checks data integrity across components

## Test Scenario

The test simulates a **legitimate drought claim** from New Delhi region:

- **Location**: New Delhi (28.6139°N, 77.2090°E)
- **Damage Type**: Drought
- **Expected Weather**: High temperature, low rainfall, low humidity
- **Expected Result**: All validations pass, high correlation score

## Prerequisites

1. **AWS Credentials**: Configured with access to Lambda and DynamoDB
2. **Deployed Lambda Functions**: All forensic validation functions must be deployed
3. **Node.js Dependencies**: Install required packages

```bash
cd lambda-functions
npm install
```

4. **AWS Region**: ap-south-1 (Mumbai, India)

## Running the Test

### Option 1: Using ts-node (Recommended)

```bash
cd lambda-functions
npx ts-node test-forensic-validation-e2e.ts
```

### Option 2: Compile and Run

```bash
cd lambda-functions
npm run build
node dist/test-forensic-validation-e2e.js
```

### Option 3: Using npm script

Add to `package.json`:
```json
{
  "scripts": {
    "test:e2e": "ts-node test-forensic-validation-e2e.ts"
  }
}
```

Then run:
```bash
npm run test:e2e
```

## Expected Output

### Successful Test Run

```
================================================================================
VeriCrop FinBridge - End-to-End Forensic Validation Test
================================================================================
Test Claim ID: e2e-test-1709481234567
Test Location: New Delhi (28.6139, 77.209)
Test Timestamp: 2026-03-03T10:30:00.000Z
Test Scenario: Legitimate drought claim
================================================================================

[TEST 1] Solar Azimuth Calculator
  Invoking solar-azimuth-calculator...
  ✓ Solar azimuth: 135.45°
  ✓ Shadow direction: 315.45°

[TEST 2] Shadow Comparator
  Invoking shadow-comparator...
  ✓ Validation: VALID
  ✓ Fraud risk: LOW
  ✓ Angle variance: 2.30°

[TEST 3] Weather Data Integrator
  Invoking weather-data-integrator...
  ✓ Temperature: 38°C
  ✓ Rainfall: 2mm
  ✓ Humidity: 25%
  ✓ Data source: mock

[TEST 4] Weather Correlation Analyzer
  Invoking weather-correlation-analyzer...
  ✓ Correlation score: 95/100
  ✓ Recommendation: APPROVE
  ✓ Is consistent: true

[TEST 5] Crop Damage Classifier
  Invoking crop-damage-classifier...
  ✓ Damage type: drought
  ✓ Confidence: 92.5%
  ✓ Severity: HIGH
  ✓ Inference time: 1250ms

[TEST 6] DynamoDB Data Persistence
  Checking Claims table for test claim...
  ⚠ Claim record not found (may be expected for test)

================================================================================
TEST SUMMARY
================================================================================
✓ Solar Azimuth Calculator          245ms
✓ Shadow Comparator                 312ms
✓ Weather Data Integrator           189ms
✓ Weather Correlation Analyzer      156ms
✓ Crop Damage Classifier            1456ms
✓ DynamoDB Persistence              98ms
================================================================================
Total: 6 | Passed: 6 | Failed: 0 | Skipped: 0
Total Duration: 2456ms (2.46s)
================================================================================

✓ ALL TESTS PASSED!
✓ Forensic validation components are working correctly.
```

## Test Results Interpretation

### Status Indicators

- **✓ (Green)**: Test passed successfully
- **✗ (Red)**: Test failed - requires investigation
- **⚠ (Yellow)**: Warning - non-critical issue
- **○ (Yellow)**: Test skipped due to dependency failure

### Performance Benchmarks

| Component | Target | Acceptable |
|-----------|--------|------------|
| Solar Azimuth Calculator | <500ms | <1000ms |
| Shadow Comparator | <1000ms | <2000ms |
| Weather Data Integrator | <500ms | <1000ms |
| Weather Correlation Analyzer | <500ms | <1000ms |
| Crop Damage Classifier | <2000ms | <5000ms |
| Total E2E | <5000ms | <10000ms |

### Validation Criteria

#### Solar Azimuth Calculator
- ✓ Returns valid azimuth angle (0-360°)
- ✓ Returns expected shadow direction
- ✓ Completes within timeout

#### Shadow Comparator
- ✓ Validates shadow correlation
- ✓ Calculates fraud risk (LOW/MEDIUM/HIGH)
- ✓ Detects fraud when variance >5°

#### Weather Data Integrator
- ✓ Returns complete weather data
- ✓ Caches data in DynamoDB
- ✓ Handles API failures gracefully

#### Weather Correlation Analyzer
- ✓ Calculates correlation score (0-100)
- ✓ Returns recommendation (APPROVE/HITL_REVIEW/REJECT)
- ✓ Detects weather anomalies

#### Crop Damage Classifier
- ✓ Classifies damage type correctly
- ✓ Returns confidence score (0-1)
- ✓ Determines severity (LOW/MEDIUM/HIGH)
- ✓ Inference time <5 seconds

## Troubleshooting

### Common Issues

#### 1. Lambda Function Not Found

**Error**: `ResourceNotFoundException: Function not found`

**Solution**: Deploy the Lambda function first
```bash
cd infrastructure
npm run build
cdk deploy VeriCropFinBridgeStack --region ap-south-1
```

#### 2. Permission Denied

**Error**: `AccessDeniedException: User is not authorized`

**Solution**: Ensure AWS credentials have Lambda invoke permissions
```bash
aws sts get-caller-identity  # Verify credentials
```

#### 3. Timeout Errors

**Error**: `Task timed out after X seconds`

**Solution**: 
- Check Lambda function logs in CloudWatch
- Increase Lambda timeout in infrastructure stack
- Verify network connectivity to external APIs

#### 4. DynamoDB Table Not Found

**Error**: `ResourceNotFoundException: Table not found`

**Solution**: This is expected if tables aren't created yet. The test will show a warning but continue.

### Debugging

#### Enable Verbose Logging

Modify the test script to add detailed logging:
```typescript
// Add at top of file
const DEBUG = true;

// In invokeLambda function
if (DEBUG) {
  console.log('Request:', JSON.stringify(payload, null, 2));
  console.log('Response:', JSON.stringify(response, null, 2));
}
```

#### Check Lambda Logs

```bash
# View logs for specific function
aws logs tail /aws/lambda/solar-azimuth-calculator --follow --region ap-south-1

# View logs for all functions
aws logs tail /aws/lambda/weather-data-integrator --follow --region ap-south-1
aws logs tail /aws/lambda/weather-correlation-analyzer --follow --region ap-south-1
aws logs tail /aws/lambda/crop-damage-classifier --follow --region ap-south-1
```

#### Test Individual Functions

Test each Lambda function separately using AWS CLI:

```bash
# Test Solar Azimuth Calculator
aws lambda invoke \
  --function-name solar-azimuth-calculator \
  --payload '{"claimId":"test-001","gpsCoordinates":{"latitude":28.6139,"longitude":77.2090},"timestamp":"2026-03-03T10:30:00Z"}' \
  --region ap-south-1 \
  response.json

# Test Weather Data Integrator
aws lambda invoke \
  --function-name weather-data-integrator \
  --payload file://test-weather-event.json \
  --region ap-south-1 \
  response.json

# Test Crop Damage Classifier
aws lambda invoke \
  --function-name crop-damage-classifier \
  --payload file://crop-damage-classifier-test-event.json \
  --region ap-south-1 \
  response.json
```

## Test Data

### Test Claim Details

```json
{
  "claimId": "e2e-test-<timestamp>",
  "gpsCoordinates": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "timestamp": "<current-timestamp>",
  "damageType": "drought",
  "location": "New Delhi, India"
}
```

### Expected Weather Data (Drought Scenario)

```json
{
  "temperature": 38-42,
  "rainfall": 0-5,
  "humidity": 20-30,
  "windSpeed": 10-20,
  "cloudCover": 0-20,
  "weatherCondition": "clear",
  "extremeEvents": ["drought", "heatwave"]
}
```

### Expected Correlation Score

- **Drought + Hot/Dry Weather**: 90-100 (APPROVE)
- **Drought + Rainy Weather**: 0-30 (REJECT)
- **Drought + Moderate Weather**: 40-70 (HITL_REVIEW)

## Integration with CI/CD

### GitHub Actions Workflow

Add to `.github/workflows/test-e2e.yml`:

```yaml
name: E2E Forensic Validation Tests

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

jobs:
  test-e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd lambda-functions
          npm install
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      
      - name: Run E2E tests
        run: |
          cd lambda-functions
          npm run test:e2e
```

## Next Steps

After all tests pass:

1. ✓ Mark Task 5 as complete
2. → Proceed to Task 6 (Rekognition video analysis)
3. → Continue with remaining implementation tasks
4. → Run full integration tests before deployment

## Related Documentation

- [Weather Integration README](./WEATHER_INTEGRATION_README.md)
- [Weather Correlation README](./WEATHER_CORRELATION_README.md)
- [Crop Damage Classifier README](./CROP_DAMAGE_CLASSIFIER_README.md)
- [Task 4.3 Complete](./TASK_4.3_COMPLETE.md)
- [Infrastructure Stack](../infrastructure/lib/vericrop-infrastructure-stack.ts)

## Support

For issues or questions:
1. Check CloudWatch logs for Lambda functions
2. Review task requirements in `.kiro/specs/vericrop-finbridge/tasks.md`
3. Verify all Lambda functions are deployed correctly
4. Ensure AWS credentials have necessary permissions
