/**
 * Payment Gateway Handler Lambda Function
 * 
 * PURPOSE: Integrate with UPI payment gateway for bridge loan disbursement
 * 
 * PAYMENT FEATURES:
 * - UPI fund transfer to farmer's account
 * - Payment status tracking
 * - Retry logic for failed payments
 * - SMS and voice call notifications
 * 
 * Requirements: 10.2, 10.6
 */

import { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'ap-south-1' });

// ========================================
// Type Definitions
// ========================================

interface PaymentRequest {
  loanId: string;
  farmerId: string;
  farmerUPI: string;
  farmerPhone: string;
  amount: number;
  purpose: 'BRIDGE_LOAN' | 'INSURANCE_PAYOUT';
}

interface PaymentResult {
  paymentId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  transactionRef: string;
  amount: number;
  timestamp: string;
  message: string;
  retryCount?: number;
}

interface UPIGatewayResponse {
  success: boolean;
  transactionId: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  message: string;
}

// ========================================
// Constants
// ========================================

const LOANS_TABLE = process.env.LOANS_TABLE_NAME || 'VeriCrop-Loans';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

// Mock UPI Gateway Configuration (for MVP)
const UPI_GATEWAY_ENDPOINT = process.env.UPI_GATEWAY_ENDPOINT || 'https://mock-upi-gateway.example.com';
const UPI_MERCHANT_ID = process.env.UPI_MERCHANT_ID || 'VERICROP_MERCHANT';

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<PaymentRequest, PaymentResult> = async (event) => {
  console.log('Payment Gateway Processing Started', {
    loanId: event.loanId,
    amount: event.amount,
    farmerUPI: event.farmerUPI,
  });

  try {
    // Generate unique payment ID
    const paymentId = uuidv4();
    const timestamp = new Date().toISOString();

    // Initiate UPI payment with retry logic
    const paymentResponse = await initiateUPIPaymentWithRetry(
      event.amount,
      event.farmerUPI,
      event.loanId,
      paymentId
    );

    // Update loan record with payment status
    await updateLoanPaymentStatus(event.loanId, paymentResponse);

    // Send notifications to farmer
    await sendPaymentNotifications(
      event.farmerPhone,
      event.amount,
      paymentResponse.status,
      paymentResponse.transactionId
    );

    const result: PaymentResult = {
      paymentId,
      status: paymentResponse.status === 'COMPLETED' ? 'SUCCESS' : paymentResponse.status === 'PENDING' ? 'PENDING' : 'FAILED',
      transactionRef: paymentResponse.transactionId,
      amount: event.amount,
      timestamp,
      message: paymentResponse.message,
    };

    console.log('Payment Gateway Processing Completed', {
      paymentId,
      status: result.status,
      transactionRef: result.transactionRef,
    });

    return result;
  } catch (error) {
    console.error('Payment Gateway Processing Failed', {
      loanId: event.loanId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return failed payment result
    return {
      paymentId: uuidv4(),
      status: 'FAILED',
      transactionRef: 'FAILED',
      amount: event.amount,
      timestamp: new Date().toISOString(),
      message: `Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

// ========================================
// Helper Functions
// ========================================

/**
 * Initiate UPI payment with retry logic
 */
async function initiateUPIPaymentWithRetry(
  amount: number,
  upiId: string,
  loanId: string,
  paymentId: string,
  retryCount: number = 0
): Promise<UPIGatewayResponse> {
  try {
    const response = await initiateUPIPayment(amount, upiId, loanId, paymentId);

    if (response.success) {
      return response;
    }

    // Retry if failed and retry count is less than max
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      console.log('Payment failed, retrying...', {
        retryCount: retryCount + 1,
        maxRetries: MAX_RETRY_ATTEMPTS,
      });

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

      return initiateUPIPaymentWithRetry(amount, upiId, loanId, paymentId, retryCount + 1);
    }

    // Max retries reached
    return response;
  } catch (error) {
    console.error('UPI payment initiation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      retryCount,
    });

    // Retry on error if retry count is less than max
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return initiateUPIPaymentWithRetry(amount, upiId, loanId, paymentId, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Initiate UPI payment via payment gateway
 * 
 * For MVP: Mock payment gateway integration
 * In production: Integrate with actual UPI gateway (Razorpay, PayTM, PhonePe, etc.)
 */
async function initiateUPIPayment(
  amount: number,
  upiId: string,
  loanId: string,
  paymentId: string
): Promise<UPIGatewayResponse> {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock payment gateway response (90% success rate for demo)
  const isSuccess = Math.random() > 0.1;

  if (isSuccess) {
    const transactionId = `UPI-${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;

    console.log('UPI Payment Initiated (Mock)', {
      amount,
      upiId,
      loanId,
      paymentId,
      transactionId,
      gateway: 'MOCK_UPI_GATEWAY',
      note: 'Production will integrate with real UPI payment gateway',
    });

    return {
      success: true,
      transactionId,
      status: 'COMPLETED',
      message: `Payment of ₹${amount.toLocaleString('en-IN')} successfully transferred to ${upiId}`,
    };
  } else {
    // Simulate payment failure
    return {
      success: false,
      transactionId: 'FAILED',
      status: 'FAILED',
      message: 'Payment gateway temporarily unavailable. Please retry.',
    };
  }

  // In production, you would:
  // 1. Call UPI payment gateway API (Razorpay, PayTM, PhonePe)
  // 2. Provide: amount, recipient UPI ID, merchant ID, callback URL
  // 3. Wait for synchronous response or webhook callback
  // 4. Handle payment status: SUCCESS, PENDING, FAILED
  // 5. Implement idempotency to prevent duplicate payments
  // 6. Store payment audit trail in DynamoDB
}

/**
 * Update loan record with payment status
 */
async function updateLoanPaymentStatus(
  loanId: string,
  paymentResponse: UPIGatewayResponse
): Promise<void> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: LOANS_TABLE,
        Key: {
          loanId,
        },
        UpdateExpression: 'SET paymentStatus = :status, paymentTransactionId = :txnId, paymentCompletedAt = :completedAt',
        ExpressionAttributeValues: {
          ':status': paymentResponse.status,
          ':txnId': paymentResponse.transactionId,
          ':completedAt': new Date().toISOString(),
        },
      })
    );

    console.log('Loan payment status updated', {
      loanId,
      status: paymentResponse.status,
      transactionId: paymentResponse.transactionId,
    });
  } catch (error) {
    console.error('Failed to update loan payment status', {
      loanId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't throw - payment was successful, this is just a status update
  }
}

/**
 * Send payment notifications to farmer via SMS and voice call
 */
async function sendPaymentNotifications(
  phoneNumber: string,
  amount: number,
  status: string,
  transactionId: string
): Promise<void> {
  try {
    // Format message based on payment status
    let message = '';
    if (status === 'COMPLETED') {
      message = `VeriCrop: आपका ₹${amount.toLocaleString('en-IN')} का ब्रिज लोन सफलतापूर्वक आपके UPI खाते में जमा कर दिया गया है। Transaction ID: ${transactionId}. धन्यवाद!`;
    } else if (status === 'PENDING') {
      message = `VeriCrop: आपका ₹${amount.toLocaleString('en-IN')} का भुगतान प्रक्रिया में है। Transaction ID: ${transactionId}. कृपया प्रतीक्षा करें।`;
    } else {
      message = `VeriCrop: आपका ₹${amount.toLocaleString('en-IN')} का भुगतान विफल रहा। कृपया ग्राहक सेवा से संपर्क करें। Transaction ID: ${transactionId}`;
    }

    // Send SMS via SNS
    await snsClient.send(
      new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      })
    );

    console.log('Payment notification sent', {
      phoneNumber,
      status,
      transactionId,
    });

    // In production, also trigger voice call via Amazon Connect or Polly
    // For MVP, SMS notification is sufficient
  } catch (error) {
    console.error('Failed to send payment notification', {
      phoneNumber,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't throw - payment was successful, notification is secondary
  }
}
