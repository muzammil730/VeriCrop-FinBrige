/**
 * Claim Rejector Lambda Function
 * 
 * PURPOSE: Reject claims and provide specific feedback to farmers
 * 
 * REJECTION REASONS:
 * - High fraud risk
 * - Low validation score
 * - Invalid submission data
 * - Weather inconsistencies
 * 
 * Requirements: 1.4, 1.5
 */

import { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

// ========================================
// Type Definitions
// ========================================

interface ClaimRejectionEvent {
  claimId: string;
  reason: string;
  validationResults?: any;
  error?: any;
}

interface ClaimRejectionResult {
  status: string;
  reason: string;
  feedback: string;
  rejectedAt: string;
}

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<ClaimRejectionEvent, ClaimRejectionResult> = async (
  event
) => {
  console.log('Claim Rejection Started', {
    claimId: event.claimId,
    reason: event.reason,
  });

  try {
    // Generate user-friendly feedback
    const feedback = generateFeedback(event.reason, event.validationResults);

    // Update claim status in DynamoDB
    await updateClaimStatus(event.claimId, 'REJECTED', event.reason, feedback);

    const result: ClaimRejectionResult = {
      status: 'REJECTED',
      reason: event.reason,
      feedback,
      rejectedAt: new Date().toISOString(),
    };

    console.log('Claim Rejection Completed', {
      claimId: event.claimId,
      reason: event.reason,
    });

    return result;
  } catch (error) {
    console.error('Claim Rejection Failed', {
      claimId: event.claimId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return rejection result even if DynamoDB update fails
    return {
      status: 'REJECTED',
      reason: event.reason,
      feedback: 'Your claim has been rejected. Please contact support for details.',
      rejectedAt: new Date().toISOString(),
    };
  }
};

// ========================================
// Helper Functions
// ========================================

function generateFeedback(reason: string, validationResults?: any): string {
  // Generate user-friendly feedback based on rejection reason
  
  if (reason.includes('fraud')) {
    return 'Your claim could not be verified due to inconsistencies in the evidence provided. The shadow analysis or weather data does not match the claimed damage. Please ensure all evidence is authentic and captured at the correct time and location.';
  }

  if (reason.includes('validation score')) {
    return 'Your claim did not meet the minimum validation requirements. Please ensure you provide clear photos/videos of the damage, accurate GPS location, and correct timestamp information.';
  }

  if (reason.includes('weather')) {
    return 'The weather conditions at your location do not match the type of damage claimed. Please verify the damage type and resubmit if there was an error.';
  }

  if (reason.includes('Invalid') || reason.includes('Missing')) {
    return 'Your claim submission is incomplete or contains invalid data. Please check that all required fields are filled correctly and resubmit.';
  }

  // Default feedback
  return 'Your claim could not be processed at this time. Please review your submission and try again, or contact support for assistance.';
}

async function updateClaimStatus(
  claimId: string,
  status: string,
  reason: string,
  feedback: string
): Promise<void> {
  const tableName = process.env.CLAIMS_TABLE_NAME || 'VeriCrop-Claims';

  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { claimId },
        UpdateExpression: 'SET #status = :status, rejectionReason = :reason, feedback = :feedback, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':reason': reason,
          ':feedback': feedback,
          ':updatedAt': new Date().toISOString(),
        },
      })
    );

    console.log('Claim status updated', { claimId, status });
  } catch (error) {
    console.error('Failed to update claim status', {
      claimId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Don't throw - rejection should succeed even if DynamoDB update fails
  }
}
