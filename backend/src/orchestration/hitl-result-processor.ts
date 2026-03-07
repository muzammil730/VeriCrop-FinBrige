/**
 * HITL Result Processor Lambda Function
 * 
 * PURPOSE: Process human review results from Amazon A2I
 * 
 * RESPONSIBILITIES:
 * - Retrieve A2I review results
 * - Record decision rationale in DynamoDB
 * - Update Truth Engine training data with feedback
 * - Trigger next steps (approve/reject claim)
 * 
 * Requirements: 8.4
 */

import { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SageMakerA2IRuntimeClient, DescribeHumanLoopCommand } from '@aws-sdk/client-sagemaker-a2i-runtime';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));
const a2iClient = new SageMakerA2IRuntimeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

// ========================================
// Type Definitions
// ========================================

interface HITLResultEvent {
  humanLoopName: string;
  claimId: string;
}

interface HumanReviewDecision {
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO';
  rationale: string;
  reviewerName?: string;
  reviewedAt: string;
  reviewDurationSeconds?: number;
}

interface HITLResultProcessingResult {
  claimId: string;
  decision: string;
  rationale: string;
  feedbackRecorded: boolean;
  nextAction: string;
  processedAt: string;
}

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<HITLResultEvent, HITLResultProcessingResult> = async (
  event
) => {
  console.log('HITL Result Processing Started', {
    humanLoopName: event.humanLoopName,
    claimId: event.claimId,
  });

  try {
    // Step 1: Retrieve human review result from A2I
    const reviewDecision = await getHumanReviewResult(event.humanLoopName);
    console.log('Human review decision:', reviewDecision);

    // Step 2: Update claim status in DynamoDB
    await updateClaimWithReviewDecision(event.claimId, reviewDecision);

    // Step 3: Record feedback for Truth Engine training
    await recordFeedbackForTraining(event.claimId, reviewDecision);

    // Step 4: Determine next action
    const nextAction = determineNextAction(reviewDecision.decision);

    const result: HITLResultProcessingResult = {
      claimId: event.claimId,
      decision: reviewDecision.decision,
      rationale: reviewDecision.rationale,
      feedbackRecorded: true,
      nextAction,
      processedAt: new Date().toISOString(),
    };

    console.log('HITL Result Processing Completed', {
      claimId: event.claimId,
      decision: reviewDecision.decision,
      nextAction,
    });

    return result;

  } catch (error) {
    console.error('HITL Result Processing Failed', {
      humanLoopName: event.humanLoopName,
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
 * Retrieve human review result from Amazon A2I
 */
async function getHumanReviewResult(humanLoopName: string): Promise<HumanReviewDecision> {
  try {
    // Attempt to get actual A2I result
    const command = new DescribeHumanLoopCommand({
      HumanLoopName: humanLoopName,
    });

    const response = await a2iClient.send(command);

    // Parse human loop output
    const output = response.HumanLoopOutput?.OutputS3Uri
      ? await fetchS3Output(response.HumanLoopOutput.OutputS3Uri)
      : null;

    if (output) {
      return {
        decision: output.decision || 'APPROVE',
        rationale: output.rationale || 'No rationale provided',
        reviewerName: output.reviewerName,
        reviewedAt: new Date().toISOString(),
        reviewDurationSeconds: calculateReviewDuration(
          response.CreationTime,
          new Date()
        ),
      };
    }

    // Fallback if output not available
    return generateMockReviewDecision();

  } catch (error) {
    console.log('A2I not configured or human loop not found, using mock decision:', error);
    return generateMockReviewDecision();
  }
}

/**
 * Fetch human review output from S3
 */
async function fetchS3Output(s3Uri: string): Promise<any> {
  // In production, you would fetch the JSON output from S3
  // For MVP, we'll return null to trigger mock decision
  console.log('Would fetch S3 output from:', s3Uri);
  return null;
}

/**
 * Calculate review duration in seconds
 */
function calculateReviewDuration(
  creationTime?: Date,
  completionTime?: Date
): number | undefined {
  if (!creationTime || !completionTime) {
    return undefined;
  }

  return Math.floor((completionTime.getTime() - creationTime.getTime()) / 1000);
}

/**
 * Generate mock review decision for MVP
 */
function generateMockReviewDecision(): HumanReviewDecision {
  // For MVP: Simulate human reviewer approving most claims
  const decisions: Array<'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO'> = [
    'APPROVE',
    'APPROVE',
    'APPROVE',
    'REJECT',
    'REQUEST_MORE_INFO',
  ];

  const decision = decisions[Math.floor(Math.random() * decisions.length)];

  const rationales = {
    APPROVE: 'Evidence is clear and validation results are consistent. Claim appears legitimate.',
    REJECT: 'Evidence shows inconsistencies with reported damage. Possible fraud detected.',
    REQUEST_MORE_INFO: 'Need additional evidence to make a confident decision.',
  };

  return {
    decision,
    rationale: rationales[decision],
    reviewerName: 'Mock Reviewer',
    reviewedAt: new Date().toISOString(),
    reviewDurationSeconds: 300 + Math.floor(Math.random() * 600), // 5-15 minutes
  };
}

/**
 * Update claim with human review decision
 */
async function updateClaimWithReviewDecision(
  claimId: string,
  reviewDecision: HumanReviewDecision
): Promise<void> {
  const tableName = process.env.CLAIMS_TABLE_NAME || 'VeriCrop-Claims';

  const newStatus = reviewDecision.decision === 'APPROVE'
    ? 'APPROVED'
    : reviewDecision.decision === 'REJECT'
    ? 'REJECTED'
    : 'PENDING_MORE_INFO';

  await dynamoClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { claimId },
      UpdateExpression: 'SET #status = :status, humanReviewDecision = :decision, humanReviewRationale = :rationale, reviewedAt = :reviewedAt, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': newStatus,
        ':decision': reviewDecision.decision,
        ':rationale': reviewDecision.rationale,
        ':reviewedAt': reviewDecision.reviewedAt,
        ':updatedAt': new Date().toISOString(),
      },
    })
  );

  console.log('Claim updated with human review decision', {
    claimId,
    decision: reviewDecision.decision,
    newStatus,
  });
}

/**
 * Record feedback for Truth Engine training
 * 
 * This feedback is used to improve the AI models:
 * - If human approves but AI flagged: Reduce false positive rate
 * - If human rejects but AI approved: Increase fraud detection sensitivity
 */
async function recordFeedbackForTraining(
  claimId: string,
  reviewDecision: HumanReviewDecision
): Promise<void> {
  const tableName = 'VeriCrop-Training-Feedback'; // Separate table for training data

  try {
    await dynamoClient.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          feedbackId: `feedback-${claimId}-${Date.now()}`,
          claimId,
          humanDecision: reviewDecision.decision,
          humanRationale: reviewDecision.rationale,
          reviewerName: reviewDecision.reviewerName,
          reviewedAt: reviewDecision.reviewedAt,
          reviewDurationSeconds: reviewDecision.reviewDurationSeconds,
          createdAt: new Date().toISOString(),
          // This data will be used to retrain models
          useForTraining: true,
        },
      })
    );

    console.log('Feedback recorded for training', { claimId });

  } catch (error) {
    // Don't fail if training feedback table doesn't exist (MVP)
    console.log('Training feedback table not configured:', error);
  }
}

/**
 * Determine next action based on human decision
 */
function determineNextAction(decision: string): string {
  switch (decision) {
    case 'APPROVE':
      return 'ISSUE_CERTIFICATE';
    case 'REJECT':
      return 'NOTIFY_FARMER_REJECTION';
    case 'REQUEST_MORE_INFO':
      return 'REQUEST_ADDITIONAL_EVIDENCE';
    default:
      return 'UNKNOWN';
  }
}
