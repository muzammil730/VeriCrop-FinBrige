/**
 * Submission Validator Lambda Function
 * 
 * PURPOSE: Validate claim data completeness and format before forensic validation
 * 
 * VALIDATION CHECKS:
 * - Required fields present (claimId, farmerDID, damageType, etc.)
 * - GPS coordinates in valid range
 * - Timestamp is valid and not in future
 * - Evidence files exist (video/images)
 * - Damage amount is reasonable
 * 
 * Requirements: 1.1
 */

import { Handler } from 'aws-lambda';

// ========================================
// Type Definitions
// ========================================

interface SubmissionValidationEvent {
  claimId: string;
  farmerDID?: string;
  damageType?: string;
  damageAmount?: number;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp?: string;
  videoKey?: string;
  imageData?: string;
  imageS3Uri?: string;
  farmerUPI?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  claimData: SubmissionValidationEvent;
}

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<SubmissionValidationEvent, ValidationResult> = async (
  event
) => {
  console.log('Submission Validation Started', {
    claimId: event.claimId,
    hasGPS: !!event.gpsCoordinates,
    hasTimestamp: !!event.timestamp,
  });

  const errors: string[] = [];

  try {
    // Validate required fields
    if (!event.claimId) {
      errors.push('Missing required field: claimId');
    }

    if (!event.farmerDID) {
      errors.push('Missing required field: farmerDID');
    }

    if (!event.damageType) {
      errors.push('Missing required field: damageType');
    }

    if (!event.damageAmount || event.damageAmount <= 0) {
      errors.push('Invalid or missing damageAmount');
    }

    // Validate GPS coordinates
    if (!event.gpsCoordinates) {
      errors.push('Missing required field: gpsCoordinates');
    } else {
      const { latitude, longitude } = event.gpsCoordinates;
      
      if (latitude < -90 || latitude > 90) {
        errors.push(`Invalid latitude: ${latitude}. Must be between -90 and 90`);
      }
      
      if (longitude < -180 || longitude > 180) {
        errors.push(`Invalid longitude: ${longitude}. Must be between -180 and 180`);
      }
    }

    // Validate timestamp
    if (!event.timestamp) {
      errors.push('Missing required field: timestamp');
    } else {
      const timestamp = new Date(event.timestamp);
      
      if (isNaN(timestamp.getTime())) {
        errors.push(`Invalid timestamp format: ${event.timestamp}`);
      } else if (timestamp.getTime() > Date.now()) {
        errors.push('Timestamp cannot be in the future');
      }
    }

    // Validate evidence (at least one must be present)
    if (!event.videoKey && !event.imageData && !event.imageS3Uri) {
      errors.push('Missing evidence: At least one of videoKey, imageData, or imageS3Uri required');
    }

    // Validate damage amount is reasonable (not too high)
    if (event.damageAmount && event.damageAmount > 10000000) {
      errors.push('Damage amount exceeds maximum allowed (₹10,000,000)');
    }

    // Validate damage type
    const validDamageTypes = ['pest', 'disease', 'drought', 'flood', 'hail', 'cyclone', 'fire'];
    if (event.damageType && !validDamageTypes.includes(event.damageType.toLowerCase())) {
      errors.push(`Invalid damage type: ${event.damageType}. Must be one of: ${validDamageTypes.join(', ')}`);
    }

    const isValid = errors.length === 0;

    console.log('Submission Validation Completed', {
      claimId: event.claimId,
      isValid,
      errorCount: errors.length,
    });

    return {
      isValid,
      errors,
      claimData: event,
    };
  } catch (error) {
    console.error('Submission Validation Failed', {
      claimId: event.claimId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      isValid: false,
      errors: ['Validation error: ' + (error instanceof Error ? error.message : 'Unknown error')],
      claimData: event,
    };
  }
};
