/**
 * Test file for Weather Correlation Analyzer Lambda Function
 * 
 * This file contains test cases to verify the weather correlation logic
 * for different damage types and weather conditions.
 * 
 * Run with: npx ts-node lambda-functions/test-weather-correlation.ts
 */

import { handler } from './weather-correlation-analyzer';

// ========================================
// Test Cases
// ========================================

async function runTests() {
  console.log('='.repeat(80));
  console.log('Weather Correlation Analyzer - Test Suite');
  console.log('='.repeat(80));
  console.log();

  // Test 1: Drought damage with matching weather (should APPROVE)
  console.log('Test 1: Drought damage with matching weather conditions');
  console.log('-'.repeat(80));
  const droughtMatch = await handler({
    claimId: 'CLAIM-001',
    damageType: 'drought',
    weatherData: {
      temperature: 42,
      rainfall: 5,
      humidity: 30,
      windSpeed: 15,
      cloudCover: 10,
      weatherCondition: 'clear',
      extremeEvents: ['drought', 'heatwave'],
    },
  });
  console.log('Result:', JSON.stringify(droughtMatch, null, 2));
  console.log('Expected: APPROVE (score >= 70)');
  console.log('Actual:', droughtMatch.recommendation, `(score: ${droughtMatch.correlationScore})`);
  console.log();

  // Test 2: Drought damage with heavy rainfall (should REJECT - fraud)
  console.log('Test 2: Drought damage during heavy rainfall (FRAUD)');
  console.log('-'.repeat(80));
  const droughtFraud = await handler({
    claimId: 'CLAIM-002',
    damageType: 'drought',
    weatherData: {
      temperature: 28,
      rainfall: 150,
      humidity: 85,
      windSpeed: 20,
      cloudCover: 90,
      weatherCondition: 'rain',
      extremeEvents: ['heavy_rainfall'],
    },
  });
  console.log('Result:', JSON.stringify(droughtFraud, null, 2));
  console.log('Expected: REJECT (score < 50)');
  console.log('Actual:', droughtFraud.recommendation, `(score: ${droughtFraud.correlationScore})`);
  console.log();

  // Test 3: Flood damage with matching weather (should APPROVE)
  console.log('Test 3: Flood damage with matching weather conditions');
  console.log('-'.repeat(80));
  const floodMatch = await handler({
    claimId: 'CLAIM-003',
    damageType: 'flood',
    weatherData: {
      temperature: 30,
      rainfall: 180,
      humidity: 90,
      windSpeed: 35,
      cloudCover: 95,
      weatherCondition: 'rain',
      extremeEvents: ['heavy_rainfall', 'flood'],
    },
  });
  console.log('Result:', JSON.stringify(floodMatch, null, 2));
  console.log('Expected: APPROVE (score >= 70)');
  console.log('Actual:', floodMatch.recommendation, `(score: ${floodMatch.correlationScore})`);
  console.log();

  // Test 4: Flood damage with clear skies (should REJECT - fraud)
  console.log('Test 4: Flood damage during clear skies (FRAUD)');
  console.log('-'.repeat(80));
  const floodFraud = await handler({
    claimId: 'CLAIM-004',
    damageType: 'flood',
    weatherData: {
      temperature: 38,
      rainfall: 2,
      humidity: 35,
      windSpeed: 10,
      cloudCover: 5,
      weatherCondition: 'clear',
      extremeEvents: [],
    },
  });
  console.log('Result:', JSON.stringify(floodFraud, null, 2));
  console.log('Expected: REJECT (score < 50)');
  console.log('Actual:', floodFraud.recommendation, `(score: ${floodFraud.correlationScore})`);
  console.log();

  // Test 5: Hail damage with matching weather (should APPROVE)
  console.log('Test 5: Hail damage with matching weather conditions');
  console.log('-'.repeat(80));
  const hailMatch = await handler({
    claimId: 'CLAIM-005',
    damageType: 'hail',
    weatherData: {
      temperature: 25,
      rainfall: 50,
      humidity: 70,
      windSpeed: 45,
      cloudCover: 85,
      weatherCondition: 'storm',
      extremeEvents: ['hail', 'storm'],
    },
  });
  console.log('Result:', JSON.stringify(hailMatch, null, 2));
  console.log('Expected: APPROVE (score >= 70)');
  console.log('Actual:', hailMatch.recommendation, `(score: ${hailMatch.correlationScore})`);
  console.log();

  // Test 6: Storm damage with matching weather (should APPROVE)
  console.log('Test 6: Storm damage with matching weather conditions');
  console.log('-'.repeat(80));
  const stormMatch = await handler({
    claimId: 'CLAIM-006',
    damageType: 'storm',
    weatherData: {
      temperature: 28,
      rainfall: 80,
      humidity: 75,
      windSpeed: 55,
      cloudCover: 90,
      weatherCondition: 'storm',
      extremeEvents: ['storm', 'cyclone'],
    },
  });
  console.log('Result:', JSON.stringify(stormMatch, null, 2));
  console.log('Expected: APPROVE (score >= 70)');
  console.log('Actual:', stormMatch.recommendation, `(score: ${stormMatch.correlationScore})`);
  console.log();

  // Test 7: Pest damage with matching weather (should APPROVE)
  console.log('Test 7: Pest damage with matching weather conditions');
  console.log('-'.repeat(80));
  const pestMatch = await handler({
    claimId: 'CLAIM-007',
    damageType: 'pest',
    weatherData: {
      temperature: 30,
      rainfall: 40,
      humidity: 80,
      windSpeed: 12,
      cloudCover: 60,
      weatherCondition: 'cloudy',
      extremeEvents: [],
    },
  });
  console.log('Result:', JSON.stringify(pestMatch, null, 2));
  console.log('Expected: APPROVE (score >= 70)');
  console.log('Actual:', pestMatch.recommendation, `(score: ${pestMatch.correlationScore})`);
  console.log();

  // Test 8: Borderline case (should HITL_REVIEW)
  console.log('Test 8: Borderline case - partial correlation');
  console.log('-'.repeat(80));
  const borderline = await handler({
    claimId: 'CLAIM-008',
    damageType: 'drought',
    weatherData: {
      temperature: 32, // Slightly below threshold (35°C)
      rainfall: 15,    // Slightly above threshold (10mm)
      humidity: 45,    // Slightly above threshold (40%)
      windSpeed: 18,
      cloudCover: 30,
      weatherCondition: 'cloudy',
      extremeEvents: [],
    },
  });
  console.log('Result:', JSON.stringify(borderline, null, 2));
  console.log('Expected: HITL_REVIEW (score 50-69)');
  console.log('Actual:', borderline.recommendation, `(score: ${borderline.correlationScore})`);
  console.log();

  // Test 9: Disease damage (lenient scoring)
  console.log('Test 9: Disease damage (lenient scoring)');
  console.log('-'.repeat(80));
  const disease = await handler({
    claimId: 'CLAIM-009',
    damageType: 'disease',
    weatherData: {
      temperature: 28,
      rainfall: 30,
      humidity: 60,
      windSpeed: 15,
      cloudCover: 50,
      weatherCondition: 'cloudy',
      extremeEvents: [],
    },
  });
  console.log('Result:', JSON.stringify(disease, null, 2));
  console.log('Expected: APPROVE (disease is lenient)');
  console.log('Actual:', disease.recommendation, `(score: ${disease.correlationScore})`);
  console.log();

  console.log('='.repeat(80));
  console.log('Test Suite Completed');
  console.log('='.repeat(80));
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
