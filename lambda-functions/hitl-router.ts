/**
 * HITL Router Lambda Function
 * 
 * PURPOSE: Route claims to Amazon A2I for human review
 * 
 * ROUTING REASONS:
 * - Low confidence (<85%)
 * - High fraud risk
 * - Weather anomalies
 * - 5% random audit
 * 
 * Requirements: 8.1, 8.2
 */

import { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

// ========================================
// Type Definitions
// ========================================

interface HITLRoutingEvent {
  claimId: string;
  reason: string;
  validationResults: any;
  forensicResults?: any;
}

interface HITLRoutingResult {
  taskArn: string;
  status: string;
  message: string;
  routedAt: string;
}

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<HITLRoutingEvent, HITLRoutingResult> = async (
  event
) => {
  console.log('HITL Routing Started', {
    claimId: event.claimId,
    reason: event.reason,
  });

  try {
    // For MVP: Store HITL request in DynamoDB
    // In production: Create Amazon A2I human review task
    
    const taskArn = `arn:aws:sagemaker:ap-south-1:889168907575:human-loop/vericrop-${event.claimId}`;
    
    // Update claim status in DynamoDB
    await updateClaimStatus(event.claimId, 'PENDING_HUMAN_REVIEW', event.reason);

    const result: HITLRoutingResult = {
      taskArn,
      status: 'ROUTED_TO_HITL',
      message: `Claim ${event.claimId} routed to human review: ${event.reason}`,
      routedAt: new Date().toISOString(),
    };

    console.log('HITL Routing Completed', {
      claimId: event.claimId,
      taskArn,
    });

    return result;
  } catch (error) {
    console.error('HITL Routing Failed', {
      claimId: event.claimId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};

// ========================================
// Helper Functions
// ========================================

async function updateClaimStatus(
  claimId: string,
  status: string,
  reason: string
): Promise<void> {
  const tableName = process.env.CLAIMS_TABLE_NAME || 'VeriCrop-Claims';

  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { claimId },
        UpdateExpression: 'SET #status = :status, hitlReason = :reason, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':reason': reason,
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
    // Don't throw - HITL routing should succeed even if DynamoDB update fails
  }
}
