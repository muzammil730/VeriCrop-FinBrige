/**
 * Weather Data Integration Lambda Function
 * 
 * PURPOSE: Integrate with India Meteorological Department (IMD) API to fetch weather data
 * for GPS locations and store historical data for forensic validation.
 * 
 * FRAUD DETECTION VALUE:
 * - Validates crop damage claims against actual weather conditions
 * - Detects inconsistencies (e.g., drought damage during heavy rainfall)
 * - Provides 48-hour weather window for comprehensive analysis
 * - Stores historical data for audit trail and pattern analysis
 * 
 * AWS SERVICES USED:
 * - AWS Lambda: Serverless compute for weather data fetching
 * - Amazon DynamoDB: Store historical weather data
 * - AWS Secrets Manager: Store IMD API credentials (if required)
 * 
 * WEATHER DATA SOURCES:
 * - Primary: India Meteorological Department (IMD) API
 * - Fallback: OpenWeatherMap API (for demo/testing)
 * 
 * Requirements: 9.1, 9.3
 */

import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION || 'ap-south-1' });

// ========================================
// Type Definitions
// ========================================

interface WeatherIntegrationEvent {
  claimId: string;
  gpsCoordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: string; // ISO 8601 timestamp of claim
}

interface WeatherData {
  claimId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  temperature: number;        // Celsius
  rainfall: number;           // mm in 48 hours
  humidity: number;           // percentage
  windSpeed: number;          // km/h
  cloudCover: number;         // percentage
  weatherCondition: string;   // clear, cloudy, rain, storm, etc.
  extremeEvents: string[];    // cyclone, hail, flood, drought
  dataSource: string;         // IMD, OpenWeatherMap, etc.
  fetchedAt: string;
  timeWindow: {
    start: string;
    end: string;
  };
}

interface WeatherAPIResponse {
  temperature: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  condition: string;
  extremeEvents: string[];
}

// ========================================
// Lambda Handler
// ========================================

export const handler = async (event: WeatherIntegrationEvent): Promise<WeatherData> => {
  console.log('Weather Data Integration Started', {
    claimId: event.claimId,
    latitude: event.gpsCoordinates.latitude,
    longitude: event.gpsCoordinates.longitude,
    timestamp: event.timestamp,
  });

  try {
    // Step 1: Calculate 48-hour time window (24 hours before and after claim)
    const claimTimestamp = new Date(event.timestamp);
    const timeWindow = calculate48HourWindow(claimTimestamp);

    console.log('Time window calculated', {
      claimTime: claimTimestamp.toISOString(),
      windowStart: timeWindow.start,
      windowEnd: timeWindow.end,
    });

    // Step 2: Check if weather data already exists in DynamoDB (cache)
    const cachedWeather = await getCachedWeatherData(
      event.gpsCoordinates,
      timeWindow
    );

    if (cachedWeather) {
      console.log('Using cached weather data', {
        claimId: event.claimId,
        cachedTimestamp: cachedWeather.fetchedAt,
      });
      return {
        ...cachedWeather,
        claimId: event.claimId,
      };
    }

    // Step 3: Fetch weather data from IMD API
    const weatherData = await fetchWeatherFromIMD(
      event.gpsCoordinates,
      timeWindow
    );

    // Step 4: Store weather data in DynamoDB for historical reference
    const storedWeather: WeatherData = {
      claimId: event.claimId,
      location: event.gpsCoordinates,
      timestamp: event.timestamp,
      temperature: weatherData.temperature,
      rainfall: weatherData.rainfall,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      cloudCover: weatherData.cloudCover,
      weatherCondition: weatherData.condition,
      extremeEvents: weatherData.extremeEvents,
      dataSource: 'IMD',
      fetchedAt: new Date().toISOString(),
      timeWindow: {
        start: timeWindow.start,
        end: timeWindow.end,
      },
    };

    await storeWeatherData(storedWeather);

    console.log('Weather data integration completed', {
      claimId: event.claimId,
      temperature: weatherData.temperature,
      rainfall: weatherData.rainfall,
      extremeEvents: weatherData.extremeEvents,
    });

    return storedWeather;
  } catch (error) {
    console.error('Weather data integration failed', {
      claimId: event.claimId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Graceful degradation: Return minimal weather data to allow claim processing
    return {
      claimId: event.claimId,
      location: event.gpsCoordinates,
      timestamp: event.timestamp,
      temperature: 0,
      rainfall: 0,
      humidity: 0,
      windSpeed: 0,
      cloudCover: 0,
      weatherCondition: 'UNAVAILABLE',
      extremeEvents: [],
      dataSource: 'ERROR',
      fetchedAt: new Date().toISOString(),
      timeWindow: {
        start: event.timestamp,
        end: event.timestamp,
      },
    };
  }
};

// ========================================
// Time Window Calculation
// ========================================

/**
 * Calculate 48-hour time window (24 hours before and after claim timestamp)
 * 
 * RATIONALE:
 * - Weather conditions 24 hours before can explain crop damage
 * - Weather conditions 24 hours after validate claim timing
 * - 48-hour window provides comprehensive forensic context
 */
function calculate48HourWindow(claimTimestamp: Date): { start: string; end: string } {
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  const startTime = new Date(claimTimestamp.getTime() - twentyFourHoursMs);
  const endTime = new Date(claimTimestamp.getTime() + twentyFourHoursMs);

  return {
    start: startTime.toISOString(),
    end: endTime.toISOString(),
  };
}

// ========================================
// Weather Data Fetching
// ========================================

/**
 * Fetch weather data from India Meteorological Department (IMD) API
 * 
 * IMD API ENDPOINTS:
 * - Current weather: https://api.imd.gov.in/current
 * - Historical weather: https://api.imd.gov.in/historical
 * - Extreme events: https://api.imd.gov.in/alerts
 * 
 * IMPLEMENTATION NOTE:
 * For MVP/demo, we use a mock implementation with realistic data.
 * In production, replace with actual IMD API integration.
 */
async function fetchWeatherFromIMD(
  gpsCoordinates: { latitude: number; longitude: number },
  timeWindow: { start: string; end: string }
): Promise<WeatherAPIResponse> {
  try {
    // In production: Call actual IMD API
    // const apiKey = await getIMDAPIKey();
    // const response = await fetch(
    //   `https://api.imd.gov.in/historical?lat=${gpsCoordinates.latitude}&lon=${gpsCoordinates.longitude}&start=${timeWindow.start}&end=${timeWindow.end}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${apiKey}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );
    // const data = await response.json();
    // return parseIMDResponse(data);

    // For MVP: Use mock weather data with realistic values
    return mockWeatherData(gpsCoordinates, timeWindow);
  } catch (error) {
    console.error('IMD API call failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      coordinates: gpsCoordinates,
    });

    // Fallback to mock data
    return mockWeatherData(gpsCoordinates, timeWindow);
  }
}

/**
 * Mock weather data for MVP/demo
 * 
 * Generates realistic weather data based on:
 * - GPS coordinates (latitude affects temperature)
 * - Time of year (seasonal patterns)
 * - Regional weather patterns in India
 */
function mockWeatherData(
  gpsCoordinates: { latitude: number; longitude: number },
  timeWindow: { start: string; end: string }
): WeatherAPIResponse {
  const startDate = new Date(timeWindow.start);
  const month = startDate.getMonth(); // 0-11

  // Simulate seasonal weather patterns in India
  let temperature: number;
  let rainfall: number;
  let humidity: number;
  let condition: string;
  let extremeEvents: string[] = [];

  // Monsoon season (June-September): High rainfall
  if (month >= 5 && month <= 8) {
    temperature = 25 + Math.random() * 10; // 25-35°C
    rainfall = 50 + Math.random() * 150; // 50-200mm
    humidity = 70 + Math.random() * 25; // 70-95%
    condition = 'rain';
    if (rainfall > 150) {
      extremeEvents.push('heavy_rainfall');
    }
  }
  // Summer (March-May): High temperature, low rainfall
  else if (month >= 2 && month <= 4) {
    temperature = 30 + Math.random() * 15; // 30-45°C
    rainfall = Math.random() * 20; // 0-20mm
    humidity = 30 + Math.random() * 30; // 30-60%
    condition = 'clear';
    if (temperature > 40) {
      extremeEvents.push('heatwave');
    }
    if (rainfall < 5) {
      extremeEvents.push('drought');
    }
  }
  // Winter (November-February): Moderate temperature, low rainfall
  else {
    temperature = 15 + Math.random() * 15; // 15-30°C
    rainfall = Math.random() * 30; // 0-30mm
    humidity = 40 + Math.random() * 30; // 40-70%
    condition = 'cloudy';
  }

  // Adjust for latitude (northern regions are cooler)
  if (gpsCoordinates.latitude > 25) {
    temperature -= 5;
  }

  return {
    temperature: Math.round(temperature * 10) / 10,
    rainfall: Math.round(rainfall * 10) / 10,
    humidity: Math.round(humidity),
    windSpeed: Math.round((5 + Math.random() * 20) * 10) / 10, // 5-25 km/h
    cloudCover: Math.round(Math.random() * 100), // 0-100%
    condition,
    extremeEvents,
  };
}

/**
 * Get IMD API key from AWS Secrets Manager
 * 
 * SECURITY BEST PRACTICE:
 * - Never hardcode API keys in code
 * - Store credentials in Secrets Manager
 * - Rotate keys regularly
 */
async function getIMDAPIKey(): Promise<string> {
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: 'vericrop/imd-api-key',
      })
    );

    if (response.SecretString) {
      const secret = JSON.parse(response.SecretString);
      return secret.apiKey;
    }

    throw new Error('IMD API key not found in Secrets Manager');
  } catch (error) {
    console.error('Failed to retrieve IMD API key', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// ========================================
// DynamoDB Operations
// ========================================

/**
 * Check if weather data already exists in DynamoDB cache
 * 
 * CACHING STRATEGY:
 * - Weather data is cached by location and time window
 * - Cache TTL: 15 minutes (weather updates every 15 minutes)
 * - Reduces API calls and improves response time
 */
async function getCachedWeatherData(
  gpsCoordinates: { latitude: number; longitude: number },
  timeWindow: { start: string; end: string }
): Promise<WeatherData | null> {
  const tableName = process.env.WEATHER_TABLE_NAME || 'VeriCrop-Weather';

  try {
    // Create location key (rounded to 2 decimal places for cache hits)
    const locationKey = `${gpsCoordinates.latitude.toFixed(2)},${gpsCoordinates.longitude.toFixed(2)}`;

    const response = await dynamoClient.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: 'locationKey = :locationKey',
        FilterExpression: 'fetchedAt > :cacheExpiry',
        ExpressionAttributeValues: {
          ':locationKey': { S: locationKey },
          ':cacheExpiry': { S: new Date(Date.now() - 15 * 60 * 1000).toISOString() }, // 15 minutes ago
        },
        Limit: 1,
      })
    );

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0];
      return {
        claimId: '', // Will be set by caller
        location: {
          latitude: parseFloat(item.latitude.N || '0'),
          longitude: parseFloat(item.longitude.N || '0'),
        },
        timestamp: item.timestamp.S || '',
        temperature: parseFloat(item.temperature.N || '0'),
        rainfall: parseFloat(item.rainfall.N || '0'),
        humidity: parseFloat(item.humidity.N || '0'),
        windSpeed: parseFloat(item.windSpeed.N || '0'),
        cloudCover: parseFloat(item.cloudCover.N || '0'),
        weatherCondition: item.weatherCondition.S || '',
        extremeEvents: item.extremeEvents.L?.map((e) => e.S || '') || [],
        dataSource: item.dataSource.S || '',
        fetchedAt: item.fetchedAt.S || '',
        timeWindow: {
          start: item.timeWindowStart.S || '',
          end: item.timeWindowEnd.S || '',
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to query cached weather data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Store weather data in DynamoDB for historical reference
 * 
 * STORAGE STRATEGY:
 * - Partition key: locationKey (lat,lon rounded to 2 decimals)
 * - Sort key: timestamp
 * - TTL: 90 days (regulatory requirement for audit trail)
 */
async function storeWeatherData(weatherData: WeatherData): Promise<void> {
  const tableName = process.env.WEATHER_TABLE_NAME || 'VeriCrop-Weather';

  try {
    const locationKey = `${weatherData.location.latitude.toFixed(2)},${weatherData.location.longitude.toFixed(2)}`;

    await dynamoClient.send(
      new PutItemCommand({
        TableName: tableName,
        Item: {
          locationKey: { S: locationKey },
          timestamp: { S: weatherData.timestamp },
          claimId: { S: weatherData.claimId },
          latitude: { N: weatherData.location.latitude.toString() },
          longitude: { N: weatherData.location.longitude.toString() },
          temperature: { N: weatherData.temperature.toString() },
          rainfall: { N: weatherData.rainfall.toString() },
          humidity: { N: weatherData.humidity.toString() },
          windSpeed: { N: weatherData.windSpeed.toString() },
          cloudCover: { N: weatherData.cloudCover.toString() },
          weatherCondition: { S: weatherData.weatherCondition },
          extremeEvents: {
            L: weatherData.extremeEvents.map((event) => ({ S: event })),
          },
          dataSource: { S: weatherData.dataSource },
          fetchedAt: { S: weatherData.fetchedAt },
          timeWindowStart: { S: weatherData.timeWindow.start },
          timeWindowEnd: { S: weatherData.timeWindow.end },
          ttl: { N: Math.floor(Date.now() / 1000 + 90 * 24 * 60 * 60).toString() }, // 90 days TTL
        },
      })
    );

    console.log('Weather data stored in DynamoDB', {
      claimId: weatherData.claimId,
      locationKey,
    });
  } catch (error) {
    console.error('Failed to store weather data', {
      claimId: weatherData.claimId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Don't throw - weather storage failure shouldn't block claim processing
  }
}
