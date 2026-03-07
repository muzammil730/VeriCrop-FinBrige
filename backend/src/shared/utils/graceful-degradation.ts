/**
 * Graceful Degradation Utilities
 * 
 * PURPOSE: Handle service unavailability without complete system failure
 * 
 * FEATURES:
 * - Skip non-critical validation steps when services are down
 * - Queue operations for later processing
 * - Notify farmers of delays
 * - Maintain core functionality
 * 
 * Requirements: 17.3
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'ap-south-1' }));
const snsClient = new SNSClient({ region: 'ap-south-1' });

// ========================================
// Type Definitions
// ========================================

export interface DegradationContext {
  claimId: string;
  farmerId: string;
  farmerPhone?: string;
  operation: string;
  reason: string;
  timestamp: string;
}

export interface QueuedOperation {
  operationId: string;
  operationType: 'CERTIFICATE_ISSUANCE' | 'PAYMENT_DISBURSEMENT' | 'WEATHER_CHECK';
  claimId: string;
  payload: any;
  queuedAt: string;
  retryCount: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

// ========================================
// Graceful Degradation Handlers
// ========================================

/**
 * Handle weather API unavailability
 * Strategy: Skip weather validation, proceed with other checks
 */
export async function handleWeatherAPIUnavailable(
  context: DegradationContext
): Promise<{ skipped: boolean; reason: string }> {
  console.log('Weather API unavailable, skipping weather validation', {
    claimId: context.claimId,
    reason: context.reason,
  });

  // Notify farmer of degraded service
  await notifyFarmerOfDelay(
    context.farmerPhone,
    'Weather validation temporarily unavailable. Your claim is being processed with other validation checks.'
  );

  return {
    skipped: true,
    reason: 'Weather API unavailable - validation skipped',
  };
}

/**
 * Handle blockchain unavailability
 * Strategy: Queue certificate issuance for later processing
 */
export async function handleBlockchainUnavailable(
  context: DegradationContext,
  certificateData: any
): Promise<{ queued: boolean; operationId: string }> {
  console.log('Blockchain unavailable, queuing certificate issuance', {
    claimId: context.claimId,
    reason: context.reason,
  });

  // Queue certificate issuance
  const operationId = await queueOperation({
    operationType: 'CERTIFICATE_ISSUANCE',
    claimId: context.claimId,
    payload: certificateData,
  });

  // Notify farmer of delay
  await notifyFarmerOfDelay(
    context.farmerPhone,
    'Certificate issuance is temporarily delayed. You will receive your certificate within 24 hours.'
  );

  return {
    queued: true,
    operationId,
  };
}

/**
 * Handle payment gateway unavailability
 * Strategy: Queue payment disbursement for later processing
 */
export async function handlePaymentGatewayUnavailable(
  context: DegradationContext,
  paymentData: any
): Promise<{ queued: boolean; operationId: string }> {
  console.log('Payment gateway unavailable, queuing disbursement', {
    claimId: context.claimId,
    reason: context.reason,
  });

  // Queue payment disbursement
  const operationId = await queueOperation({
    operationType: 'PAYMENT_DISBURSEMENT',
    claimId: context.claimId,
    payload: paymentData,
  });

  // Notify farmer of delay
  await notifyFarmerOfDelay(
    context.farmerPhone,
    'Payment processing is temporarily delayed. Your funds will be disbursed within 24 hours.'
  );

  return {
    queued: true,
    operationId,
  };
}

// ========================================
// Operation Queue Management
// ========================================

const OPERATIONS_TABLE = 'VeriCrop-QueuedOperations';

/**
 * Queue operation for later processing
 */
async function queueOperation(operation: {
  operationType: QueuedOperation['operationType'];
  claimId: string;
  payload: any;
}): Promise<string> {
  const operationId = `OP-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const queuedOperation: QueuedOperation = {
    operationId,
    operationType: operation.operationType,
    claimId: operation.claimId,
    payload: operation.payload,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
    status: 'QUEUED',
  };

  try {
    await dynamoClient.send(
      new PutCommand({
        TableName: OPERATIONS_TABLE,
        Item: queuedOperation,
      })
    );

    console.log('Operation queued successfully', {
      operationId,
      operationType: operation.operationType,
      claimId: operation.claimId,
    });

    return operationId;
  } catch (error) {
    console.error('Failed to queue operation', {
      operationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // If we can't queue, log to CloudWatch for manual processing
    console.error('MANUAL_PROCESSING_REQUIRED', {
      operation: queuedOperation,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Notify farmer of service delay
 */
async function notifyFarmerOfDelay(
  phoneNumber: string | undefined,
  message: string
): Promise<void> {
  if (!phoneNumber) {
    console.log('No phone number provided, skipping notification');
    return;
  }

  try {
    const hindiMessage = `VeriCrop: ${message} कृपया धैर्य रखें। हम जल्द ही आपसे संपर्क करेंगे।`;

    await snsClient.send(
      new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: hindiMessage,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      })
    );

    console.log('Delay notification sent to farmer', {
      phoneNumber,
    });
  } catch (error) {
    console.error('Failed to send delay notification', {
      phoneNumber,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't throw - notification is secondary
  }
}

// ========================================
// Service Health Check
// ========================================

export interface ServiceHealth {
  service: string;
  healthy: boolean;
  lastCheck: string;
  errorMessage?: string;
}

/**
 * Check if service is healthy
 */
export async function checkServiceHealth(
  serviceName: string,
  healthCheckFn: () => Promise<boolean>
): Promise<ServiceHealth> {
  try {
    const healthy = await healthCheckFn();
    
    return {
      service: serviceName,
      healthy,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      service: serviceName,
      healthy: false,
      lastCheck: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Determine if claim can proceed with degraded services
 */
export function canProceedWithDegradation(
  unavailableServices: string[]
): { canProceed: boolean; reason: string } {
  // Critical services that must be available
  const criticalServices = ['DynamoDB', 'S3'];

  const criticalUnavailable = unavailableServices.filter((service) =>
    criticalServices.includes(service)
  );

  if (criticalUnavailable.length > 0) {
    return {
      canProceed: false,
      reason: `Critical services unavailable: ${criticalUnavailable.join(', ')}`,
    };
  }

  // Non-critical services can be skipped
  return {
    canProceed: true,
    reason: `Proceeding with degraded services: ${unavailableServices.join(', ')}`,
  };
}
