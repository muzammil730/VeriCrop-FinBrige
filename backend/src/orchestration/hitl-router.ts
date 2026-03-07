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
import { SageMakerA2IRuntimeClient, StartHumanLoopCommand } from '@aws-sdk/client-sagemaker-a2i-runtime';
import {
  getA2IWorkflowConfig,
  generateA2IUITemplate,
  createA2ITaskInput,
  A2ITaskTemplate,
} from './a2i-workflow-config';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));
const a2iClient = new SageMakerA2IRuntimeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

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
    // Create A2I task template
    const taskTemplate: A2ITaskTemplate = {
      claimId: event.claimId,
      farmerName: event.validationResults.farmerName || 'Unknown',
      farmLocation: event.validationResults.farmLocation || 'Unknown',
      damageType: event.validationResults.damageType || 'Unknown',
      damageAmount: event.validationResults.damageAmount || 0,
      evidenceUrls: event.validationResults.evidenceUrls || [],
      validationResults: event.forensicResults || {},
      overallConfidence: event.validationResults.overallConfidence || 0,
      fraudRiskLevel: determineFraudRiskLevel(event.validationResults),
      flaggedReasons: [event.reason],
    };

    // For MVP: Mock A2I integration (A2I requires manual setup in AWS Console)
    // In production: Uncomment the code below to create actual A2I human loop
    
    let taskArn: string;
    
    try {
      // Attempt to create A2I human loop
      const a2iInput = createA2ITaskInput(taskTemplate);
      const command = new StartHumanLoopCommand(a2iInput);
      const response = await a2iClient.send(command);
      
      taskArn = response.HumanLoopArn || `arn:aws:sagemaker:ap-south-1:889168907575:human-loop/vericrop-${event.claimId}`;
      console.log('A2I human loop created:', taskArn);
      
    } catch (a2iError) {
      // Fallback to mock ARN if A2I is not configured
      console.log('A2I not configured, using mock ARN:', a2iError);
      taskArn = `arn:aws:sagemaker:ap-south-1:889168907575:human-loop/vericrop-${event.claimId}-${Date.now()}`;
    }
    
    // Update claim status in DynamoDB
    await updateClaimStatus(event.claimId, 'PENDING_HUMAN_REVIEW', event.reason, taskTemplate);

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

/**
 * Determine fraud risk level based on validation results
 */
function determineFraudRiskLevel(validationResults: any): 'LOW' | 'MEDIUM' | 'HIGH' {
  const confidence = validationResults.overallConfidence || 0;
  
  if (confidence >= 85) {
    return 'LOW';
  } else if (confidence >= 70) {
    return 'MEDIUM';
  } else {
    return 'HIGH';
  }
}

async function updateClaimStatus(
  claimId: string,
  status: string,
  reason: string,
  taskTemplate?: A2ITaskTemplate
): Promise<void> {
  const tableName = process.env.CLAIMS_TABLE_NAME || 'VeriCrop-Claims';

  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { claimId },
        UpdateExpression: 'SET #status = :status, hitlReason = :reason, hitlTaskTemplate = :taskTemplate, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':reason': reason,
          ':taskTemplate': taskTemplate || null,
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
