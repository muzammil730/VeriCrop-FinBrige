# Weather Correlation Analyzer

## Overview

The Weather Correlation Analyzer is a Lambda function that analyzes weather data against reported crop damage types to detect fraudulent insurance claims. It calculates a correlation score (0-100) and flags anomalies when weather conditions don't match the reported damage.

## Purpose

This function is a critical component of the VeriCrop FinBridge fraud detection system. It validates that the reported crop damage is consistent with actual weather conditions in the 48-hour window around the claim submission.

## Correlation Rules

### Drought Damage
- **Requirements:**
  - Rainfall: < 10mm in 48 hours
  - Temperature: > 35°C
  - Humidity: < 40%
  - Extreme events: drought, heatwave

### Flood Damage
- **Requirements:**
  - Rainfall: > 100mm in 48 hours
  - Humidity: > 70%
  - Extreme events: heavy_rainfall, flood

### Hail Damage
- **Requirements:**
  - Wind speed: > 30 km/h
  - Extreme events: hail, storm

### Storm Damage
- **Requirements:**
  - Wind speed: > 40 km/h
  - Extreme events: storm, cyclone

### Pest Damage (Weather-Related)
- **Requirements:**
  - Humidity: > 70%
  - Temperature: 25-35°C

### Disease Damage
- **Lenient scoring** - Disease can occur in various weather conditions

## Scoring Logic

The function starts with a base score of 100 and deducts points for rule violations:

- **Major violations** (conditions completely opposite): -30 points
  - Example: Rainfall > 50mm over threshold, Temperature > 10°C off
- **Minor violations** (slightly off): -15 points
  - Example: Rainfall 5-50mm over threshold, Temperature 3-10°C off
- **Missing extreme events**: -10 to -20 points depending on other conditions

### Recommendations

- **Score ≥ 70**: APPROVE - Weather strongly correlates with damage
- **Score 50-69**: HITL_REVIEW - Partial correlation, manual review needed
- **Score < 50**: REJECT - No correlation, potential fraud

## Input Format

```typescript
{
  claimId: string;
  damageType: 'drought' | 'flood' | 'hail' | 'storm' | 'pest' | 'disease' | 'other';
  weatherData: {
    temperature: number;        // Celsius
    rainfall: number;           // mm in 48 hours
    humidity: number;           // percentage
    windSpeed: number;          // km/h
    cloudCover: number;         // percentage
    weatherCondition: string;   // clear, cloudy, rain, storm
    extremeEvents: string[];    // drought, heatwave, heavy_rainfall, flood, hail, storm, cyclone
  }
}
```

## Output Format

```typescript
{
  claimId: string;
  damageType: string;
  correlationScore: number;      // 0-100
  isConsistent: boolean;         // true if score >= 50
  anomalies: string[];           // List of detected anomalies
  recommendation: 'APPROVE' | 'HITL_REVIEW' | 'REJECT';
  explanation: string;
  weatherSummary: {
    temperature: number;
    rainfall: number;
    humidity: number;
    windSpeed: number;
    extremeEvents: string[];
  };
  analyzedAt: string;            // ISO 8601 timestamp
}
```

## Example Use Cases

### Legitimate Claim (Drought)
```typescript
Input:
- Damage Type: drought
- Temperature: 42°C
- Rainfall: 5mm
- Humidity: 30%
- Extreme Events: ['drought', 'heatwave']

Output:
- Score: 100
- Recommendation: APPROVE
- Anomalies: []
```

### Fraudulent Claim (Drought during rainfall)
```typescript
Input:
- Damage Type: drought
- Temperature: 28°C
- Rainfall: 150mm
- Humidity: 85%
- Extreme Events: ['heavy_rainfall']

Output:
- Score: 0
- Recommendation: REJECT
- Anomalies: [
    "Rainfall too high: 150mm (expected <10mm)",
    "Temperature slightly low: 28°C (expected >35°C)",
    "Humidity too high: 85% (expected <40%)",
    "Missing expected extreme weather events: drought or heatwave"
  ]
```

### Borderline Case (Requires HITL Review)
```typescript
Input:
- Damage Type: drought
- Temperature: 32°C (slightly below 35°C threshold)
- Rainfall: 15mm (slightly above 10mm threshold)
- Humidity: 45% (slightly above 40% threshold)
- Extreme Events: []

Output:
- Score: 35
- Recommendation: REJECT (multiple minor violations)
- Anomalies: [
    "Rainfall slightly high: 15mm (expected <10mm)",
    "Temperature slightly low: 32°C (expected >35°C)",
    "Humidity slightly high: 45% (expected <40%)",
    "Missing expected extreme weather events: drought or heatwave"
  ]
```

## Testing

Run the test suite:
```bash
cd lambda-functions
npx ts-node test-weather-correlation.ts
```

The test suite includes:
1. Drought damage with matching weather (APPROVE)
2. Drought damage during heavy rainfall (REJECT - fraud)
3. Flood damage with matching weather (APPROVE)
4. Flood damage during clear skies (REJECT - fraud)
5. Hail damage with matching weather (APPROVE)
6. Storm damage with matching weather (APPROVE)
7. Pest damage with matching weather (APPROVE)
8. Borderline case with multiple minor violations
9. Disease damage (lenient scoring)

## Integration

This function is called by the Step Functions Express workflow after the Weather Data Integrator fetches weather data. The correlation result is used to:

1. Calculate the overall validation score
2. Determine if the claim should be routed to HITL review
3. Provide fraud indicators for human reviewers
4. Generate audit trail for regulatory compliance

## Error Handling

The function implements graceful degradation:
- If analysis fails, returns score of 50 with HITL_REVIEW recommendation
- Logs all errors for debugging
- Never blocks claim processing due to analysis errors

## AWS Services Used

- **AWS Lambda**: Serverless compute for correlation analysis
- **Amazon CloudWatch**: Logging and monitoring
- **AWS X-Ray**: Distributed tracing

## Requirements Satisfied

- **Requirement 9.2**: Compare reported damage type with weather patterns
- **Requirement 9.4**: Flag weather data inconsistencies for HITL review
- **Requirement 2.5**: Cross-reference weather data with claimed damage patterns

## Performance

- **Timeout**: 10 seconds
- **Memory**: 256 MB
- **Typical execution time**: < 100ms
- **Cold start**: < 500ms

## Security

- Runs with least privilege IAM role
- No external API calls (uses pre-fetched weather data)
- All logs encrypted with KMS
- X-Ray tracing enabled for audit trail
