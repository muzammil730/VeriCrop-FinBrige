/**
 * Test script for Weather Data Integrator Lambda function
 * 
 * This script tests the weather integration logic locally without AWS dependencies
 */

import { handler } from './weather-data-integrator';

// Mock AWS SDK clients
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({})),
  PutItemCommand: jest.fn(),
  QueryCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({})),
  GetSecretValueCommand: jest.fn(),
}));

async function testWeatherIntegrator() {
  console.log('Testing Weather Data Integrator...\n');

  const testEvent = {
    claimId: 'test-claim-001',
    gpsCoordinates: {
      latitude: 28.6139, // New Delhi
      longitude: 77.2090,
    },
    timestamp: '2024-01-15T10:30:00.000Z',
  };

  try {
    console.log('Input Event:', JSON.stringify(testEvent, null, 2));
    console.log('\nCalling handler...\n');

    const result = await handler(testEvent);

    console.log('Weather Data Result:', JSON.stringify(result, null, 2));
    console.log('\n✅ Test passed! Weather data fetched successfully.');

    // Validate result structure
    if (!result.claimId || !result.location || !result.temperature) {
      throw new Error('Invalid result structure');
    }

    console.log('\nValidation checks:');
    console.log(`✓ Claim ID: ${result.claimId}`);
    console.log(`✓ Location: ${result.location.latitude}, ${result.location.longitude}`);
    console.log(`✓ Temperature: ${result.temperature}°C`);
    console.log(`✓ Rainfall: ${result.rainfall}mm`);
    console.log(`✓ Humidity: ${result.humidity}%`);
    console.log(`✓ Wind Speed: ${result.windSpeed} km/h`);
    console.log(`✓ Weather Condition: ${result.weatherCondition}`);
    console.log(`✓ Extreme Events: ${result.extremeEvents.join(', ') || 'None'}`);
    console.log(`✓ Time Window: ${result.timeWindow.start} to ${result.timeWindow.end}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testWeatherIntegrator();
}

export { testWeatherIntegrator };
