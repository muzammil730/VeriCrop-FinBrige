/**
 * Solar Azimuth Calculator Lambda Function
 * 
 * PURPOSE: Calculate expected shadow direction using solar geometry to detect fraud
 * 
 * FRAUD DETECTION MECHANISM:
 * - Extracts GPS coordinates and timestamp from video metadata
 * - Calculates expected shadow angle using solar azimuth formula
 * - Compares with actual shadow in video (±5° tolerance)
 * - Flags claims with variance >5° as potential fraud
 * 
 * FORMULA: sin α = sin Φ sin δ + cos Φ cos δ cos h
 * Where:
 *   α = Solar azimuth angle (0-360°)
 *   Φ = Latitude from GPS (-90° to 90°)
 *   δ = Solar declination (-23.45° to 23.45°)
 *   h = Hour angle (15° per hour from solar noon)
 * 
 * Requirements: 2.1, 2.2
 */

import { Handler } from 'aws-lambda';

// ========================================
// Type Definitions
// ========================================

interface SolarAzimuthEvent {
  claimId: string;
  latitude: number;    // GPS latitude from video metadata (-90 to 90)
  longitude: number;   // GPS longitude from video metadata (-180 to 180)
  timestamp: string;   // ISO 8601 timestamp from video metadata
}

interface SolarAzimuthResult {
  claimId: string;
  solarAzimuth: number;           // Calculated solar azimuth angle (0-360°)
  expectedShadowDirection: number; // Expected shadow direction (opposite of sun)
  solarDeclination: number;        // Solar declination for this date
  hourAngle: number;               // Hour angle at this time
  calculationTimestamp: string;    // When calculation was performed
  metadata: {
    latitude: number;
    longitude: number;
    localTime: string;
    dayOfYear: number;
  };
}

// ========================================
// Solar Geometry Calculations
// ========================================

/**
 * Calculate solar declination using Cooper's equation
 * 
 * Solar declination is the angle between the sun's rays and the equatorial plane.
 * It varies from -23.45° (winter solstice) to +23.45° (summer solstice).
 * 
 * Cooper's equation: δ = 23.45° × sin(360° × (284 + n) / 365)
 * Where n = day of year (1-365)
 * 
 * @param dayOfYear - Day of year (1 = Jan 1, 365 = Dec 31)
 * @returns Solar declination in degrees
 */
function calculateSolarDeclination(dayOfYear: number): number {
  // Cooper's equation for solar declination
  const angle = (360 * (284 + dayOfYear)) / 365;
  const angleRadians = degreesToRadians(angle);
  const declination = 23.45 * Math.sin(angleRadians);
  
  return declination;
}

/**
 * Calculate hour angle from local solar time
 * 
 * Hour angle represents the sun's position relative to solar noon.
 * It increases by 15° per hour (360° / 24 hours).
 * 
 * Hour angle = 15° × (hours from solar noon)
 * - Negative before solar noon (morning)
 * - Zero at solar noon
 * - Positive after solar noon (afternoon)
 * 
 * @param localTime - Local time in hours (0-24)
 * @param longitude - Longitude in degrees
 * @returns Hour angle in degrees
 */
function calculateHourAngle(localTime: number, longitude: number): number {
  // Calculate solar noon (when sun is highest in sky)
  // Solar noon occurs when local solar time = 12:00
  // Adjust for longitude: each 15° of longitude = 1 hour time difference
  const longitudeTimeOffset = longitude / 15; // Convert longitude to hours
  const solarNoon = 12 - longitudeTimeOffset;
  
  // Calculate hours from solar noon
  const hoursFromSolarNoon = localTime - solarNoon;
  
  // Convert to hour angle (15° per hour)
  const hourAngle = 15 * hoursFromSolarNoon;
  
  return hourAngle;
}

/**
 * Calculate solar azimuth angle using the fundamental formula
 * 
 * Formula: sin α = sin Φ sin δ + cos Φ cos δ cos h
 * 
 * This formula gives the sine of the solar azimuth angle.
 * We use arcsin to get the actual angle, then adjust for quadrant.
 * 
 * @param latitude - Latitude in degrees (-90 to 90)
 * @param solarDeclination - Solar declination in degrees
 * @param hourAngle - Hour angle in degrees
 * @returns Solar azimuth angle in degrees (0-360)
 */
function calculateSolarAzimuth(
  latitude: number,
  solarDeclination: number,
  hourAngle: number
): number {
  // Convert all angles to radians for trigonometric functions
  const latRad = degreesToRadians(latitude);
  const decRad = degreesToRadians(solarDeclination);
  const hourRad = degreesToRadians(hourAngle);
  
  // Apply the solar azimuth formula
  // sin α = sin Φ sin δ + cos Φ cos δ cos h
  const sinAzimuth = 
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourRad);
  
  // Calculate azimuth angle from sine value
  let azimuth = radiansToDegrees(Math.asin(sinAzimuth));
  
  // Adjust for quadrant based on hour angle
  // Morning (h < 0): azimuth is in eastern hemisphere (0-180°)
  // Afternoon (h > 0): azimuth is in western hemisphere (180-360°)
  if (hourAngle > 0) {
    // Afternoon: sun is in western sky
    azimuth = 180 - azimuth;
  } else if (hourAngle < 0) {
    // Morning: sun is in eastern sky
    // Azimuth is already correct (0-180°)
  }
  
  // Ensure azimuth is in range [0, 360)
  azimuth = normalizeAngle(azimuth);
  
  return azimuth;
}

/**
 * Calculate expected shadow direction (opposite of sun)
 * 
 * Shadow points away from the sun, so shadow direction = sun direction + 180°
 * 
 * @param solarAzimuth - Solar azimuth angle in degrees
 * @returns Shadow direction in degrees (0-360)
 */
function calculateShadowDirection(solarAzimuth: number): number {
  // Shadow is opposite to sun direction
  let shadowDirection = solarAzimuth + 180;
  
  // Normalize to [0, 360) range
  shadowDirection = normalizeAngle(shadowDirection);
  
  return shadowDirection;
}

// ========================================
// Utility Functions
// ========================================

/**
 * Convert degrees to radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Normalize angle to [0, 360) range
 */
function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Get day of year from date (1-365)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear;
}

/**
 * Get local time in hours (0-24) from timestamp
 */
function getLocalTimeHours(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  // Convert to decimal hours
  const localTime = hours + minutes / 60 + seconds / 3600;
  
  return localTime;
}

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<SolarAzimuthEvent, SolarAzimuthResult> = async (
  event
) => {
  console.log('Solar Azimuth Calculator invoked', { 
    claimId: event.claimId,
    receivedEvent: JSON.stringify(event)
  });
  
  try {
    // Validate input
    if (event.latitude === undefined || event.longitude === undefined || !event.timestamp) {
      console.error('Validation failed', {
        hasLatitude: event.latitude !== undefined,
        hasLongitude: event.longitude !== undefined,
        hasTimestamp: !!event.timestamp,
        receivedEvent: event
      });
      throw new Error('Missing required fields: latitude, longitude, timestamp');
    }
    
    // Validate latitude range
    if (event.latitude < -90 || event.latitude > 90) {
      throw new Error(`Invalid latitude: ${event.latitude}. Must be between -90 and 90`);
    }
    
    // Validate longitude range
    if (event.longitude < -180 || event.longitude > 180) {
      throw new Error(`Invalid longitude: ${event.longitude}. Must be between -180 and 180`);
    }
    
    // Parse timestamp
    const timestamp = new Date(event.timestamp);
    if (isNaN(timestamp.getTime())) {
      throw new Error(`Invalid timestamp: ${event.timestamp}`);
    }
    
    // Extract date/time components
    const dayOfYear = getDayOfYear(timestamp);
    const localTime = getLocalTimeHours(timestamp);
    
    console.log('Calculation inputs', {
      latitude: event.latitude,
      longitude: event.longitude,
      dayOfYear,
      localTime,
    });
    
    // Step 1: Calculate solar declination using Cooper's equation
    const solarDeclination = calculateSolarDeclination(dayOfYear);
    console.log('Solar declination calculated', { solarDeclination });
    
    // Step 2: Calculate hour angle from local time and longitude
    const hourAngle = calculateHourAngle(localTime, event.longitude);
    console.log('Hour angle calculated', { hourAngle });
    
    // Step 3: Calculate solar azimuth using the formula
    // sin α = sin Φ sin δ + cos Φ cos δ cos h
    const solarAzimuth = calculateSolarAzimuth(
      event.latitude,
      solarDeclination,
      hourAngle
    );
    console.log('Solar azimuth calculated', { solarAzimuth });
    
    // Step 4: Calculate expected shadow direction (opposite of sun)
    const expectedShadowDirection = calculateShadowDirection(solarAzimuth);
    console.log('Shadow direction calculated', { expectedShadowDirection });
    
    // Prepare result
    const result: SolarAzimuthResult = {
      claimId: event.claimId,
      solarAzimuth: Math.round(solarAzimuth * 100) / 100, // Round to 2 decimal places
      expectedShadowDirection: Math.round(expectedShadowDirection * 100) / 100,
      solarDeclination: Math.round(solarDeclination * 100) / 100,
      hourAngle: Math.round(hourAngle * 100) / 100,
      calculationTimestamp: new Date().toISOString(),
      metadata: {
        latitude: event.latitude,
        longitude: event.longitude,
        localTime: timestamp.toISOString(),
        dayOfYear,
      },
    };
    
    console.log('Solar azimuth calculation complete', result);
    
    return result;
  } catch (error) {
    console.error('Error calculating solar azimuth', {
      error: error instanceof Error ? error.message : String(error),
      claimId: event.claimId,
    });
    throw error;
  }
};
