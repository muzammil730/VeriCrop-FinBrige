/**
 * Bridge Loan Calculator Lambda Function
 * 
 * PURPOSE: Calculate and disburse 0% interest bridge loans (70% of damage amount)
 * 
 * LOAN FEATURES:
 * - 70% of validated damage amount
 * - 0% interest rate (zero-interest bridge loan)
 * - Instant UPI disbursement
 * - Loss Certificate as collateral
 * - Automatic repayment from insurance payout
 * 
 * Requirements: 10.1, 10.3
 */

import { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

// ========================================
// Type Definitions
// ========================================

interface BridgeLoanRequest {
  certificateId: string;
  damageAmount: number;
  farmerId: string;
  farmerUPI: string;
}

interface LoanRecord {
  loanId: string;
  certificateId: string;
  farmerId: string;
  damageAmount: number;
  loanAmount: number;
  interestRate: number;
  disbursementMethod: string;
  farmerUPI: string;
  status: 'APPROVED' | 'DISBURSED' | 'REPAID' | 'DEFAULTED';
  approvedAt: string;
  disbursedAt?: string;
  repaymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETE';
  collateral: string;
  disbursementRef?: string;
}

interface BridgeLoanResult {
  loanId: string;
  loanAmount: number;
  interestRate: number;
  disbursementRef: string;
  farmerUPI: string;
  message: string;
}

// ========================================
// Constants
// ========================================

const LOANS_TABLE = process.env.LOANS_TABLE_NAME || 'VeriCrop-Loans';
const CERTIFICATES_TABLE = process.env.CERTIFICATES_TABLE_NAME || 'VeriCrop-Certificates';
const BRIDGE_LOAN_PERCENTAGE = 0.70; // 70% of damage amount
const INTEREST_RATE = 0.0; // Zero interest!

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<BridgeLoanRequest, BridgeLoanResult> = async (event) => {
  console.log('Bridge Loan Calculation Started', {
    certificateId: event.certificateId,
    farmerId: event.farmerId,
    damageAmount: event.damageAmount,
  });

  try {
    // Validate Loss Certificate exists and is active
    const certificate = await validateCertificate(event.certificateId);

    if (!certificate) {
      throw new Error(`Certificate ${event.certificateId} not found`);
    }

    if (certificate.status !== 'ACTIVE') {
      throw new Error(`Certificate ${event.certificateId} is not active (status: ${certificate.status})`);
    }

    if (certificate.collateralStatus !== 'AVAILABLE') {
      throw new Error(`Certificate ${event.certificateId} is already used as collateral (status: ${certificate.collateralStatus})`);
    }

    // Calculate loan amount (70% of damage)
    const loanAmount = Math.round(event.damageAmount * BRIDGE_LOAN_PERCENTAGE);

    // Generate loan ID
    const loanId = uuidv4();
    const approvedAt = new Date().toISOString();

    // Create loan record
    const loan: LoanRecord = {
      loanId,
      certificateId: event.certificateId,
      farmerId: event.farmerId,
      damageAmount: event.damageAmount,
      loanAmount,
      interestRate: INTEREST_RATE,
      disbursementMethod: 'UPI',
      farmerUPI: event.farmerUPI,
      status: 'APPROVED',
      approvedAt,
      repaymentStatus: 'PENDING',
      collateral: event.certificateId,
    };

    // Store loan in DynamoDB
    await storeLoan(loan);

    // Simulate UPI disbursement (mock for MVP)
    const disbursementRef = await disburseLoan(loanAmount, event.farmerUPI);

    // Update loan status to DISBURSED
    loan.status = 'DISBURSED';
    loan.disbursedAt = new Date().toISOString();
    loan.disbursementRef = disbursementRef;
    await updateLoanStatus(loanId, 'DISBURSED', disbursementRef);

    // Lock certificate as collateral
    await lockCertificateAsCollateral(event.certificateId, loanId);

    const result: BridgeLoanResult = {
      loanId,
      loanAmount,
      interestRate: INTEREST_RATE,
      disbursementRef,
      farmerUPI: event.farmerUPI,
      message: `Bridge loan of ₹${loanAmount.toLocaleString('en-IN')} approved and disbursed`,
    };

    console.log('Bridge Loan Disbursement Completed', {
      loanId,
      loanAmount,
      disbursementRef,
    });

    return result;
  } catch (error) {
    console.error('Bridge Loan Processing Failed', {
      certificateId: event.certificateId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};

// ========================================
// Helper Functions
// ========================================

/**
 * Validate Loss Certificate exists and is available for collateral
 */
async function validateCertificate(certificateId: string): Promise<any> {
  try {
    const result = await dynamoClient.send(
      new GetCommand({
        TableName: CERTIFICATES_TABLE,
        Key: {
          certificateId,
        },
      })
    );

    return result.Item;
  } catch (error) {
    console.error('Certificate validation failed', {
      certificateId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new Error(`Failed to validate certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Store loan record in DynamoDB
 */
async function storeLoan(loan: LoanRecord): Promise<void> {
  try {
    await dynamoClient.send(
      new PutCommand({
        TableName: LOANS_TABLE,
        Item: {
          loanId: loan.loanId,
          certificateId: loan.certificateId,
          farmerId: loan.farmerId,
          damageAmount: loan.damageAmount,
          loanAmount: loan.loanAmount,
          interestRate: loan.interestRate,
          disbursementMethod: loan.disbursementMethod,
          farmerUPI: loan.farmerUPI,
          status: loan.status,
          approvedAt: loan.approvedAt,
          repaymentStatus: loan.repaymentStatus,
          collateral: loan.collateral,
          // Add TTL for loan records (7 years = 2555 days)
          ttl: Math.floor(Date.now() / 1000) + (2555 * 24 * 60 * 60),
        },
      })
    );

    console.log('Loan stored in DynamoDB', {
      loanId: loan.loanId,
      loanAmount: loan.loanAmount,
    });
  } catch (error) {
    console.error('Loan storage failed', {
      loanId: loan.loanId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new Error(`Failed to store loan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update loan status after disbursement
 */
async function updateLoanStatus(loanId: string, status: string, disbursementRef: string): Promise<void> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: LOANS_TABLE,
        Key: {
          loanId,
        },
        UpdateExpression: 'SET #status = :status, disbursedAt = :disbursedAt, disbursementRef = :disbursementRef',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':disbursedAt': new Date().toISOString(),
          ':disbursementRef': disbursementRef,
        },
      })
    );

    console.log('Loan status updated', {
      loanId,
      status,
      disbursementRef,
    });
  } catch (error) {
    console.error('Loan status update failed', {
      loanId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't throw - loan is already stored, this is just a status update
  }
}

/**
 * Lock certificate as collateral for the loan
 */
async function lockCertificateAsCollateral(certificateId: string, loanId: string): Promise<void> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: CERTIFICATES_TABLE,
        Key: {
          certificateId,
        },
        UpdateExpression: 'SET collateralStatus = :locked, #status = :usedAsCollateral, loanId = :loanId',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':locked': 'LOCKED',
          ':usedAsCollateral': 'USED_AS_COLLATERAL',
          ':loanId': loanId,
        },
      })
    );

    console.log('Certificate locked as collateral', {
      certificateId,
      loanId,
    });
  } catch (error) {
    console.error('Certificate locking failed', {
      certificateId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't throw - loan is already disbursed, this is just a status update
  }
}

/**
 * Simulate UPI disbursement
 * 
 * For MVP: Mock payment gateway
 * In production: Integrate with actual UPI gateway (Razorpay, PayTM, PhonePe, etc.)
 */
async function disburseLoan(amount: number, upiId: string): Promise<string> {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Generate mock disbursement reference
  const disbursementRef = `UPI-${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;

  console.log('UPI Disbursement Simulated (MVP)', {
    amount,
    upiId,
    disbursementRef,
    note: 'Production will integrate with real UPI payment gateway',
  });

  // In production, you would:
  // 1. Call UPI payment gateway API (Razorpay, PayTM, PhonePe)
  // 2. Initiate fund transfer to farmer's UPI ID
  // 3. Wait for confirmation webhook
  // 4. Return actual transaction reference
  // 5. Handle payment failures with retry logic
  // 6. Send SMS and voice call notifications to farmer

  return disbursementRef;
}
