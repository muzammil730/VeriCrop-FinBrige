/**
 * Insurance Payout Processor Lambda Function
 * 
 * PURPOSE: Process insurance payouts and automatically repay bridge loans
 * 
 * PAYOUT FEATURES:
 * - Receive insurance payout notifications
 * - Automatically repay bridge loan from payout
 * - Handle insufficient payout (convert to standard loan)
 * - Update certificate status on blockchain
 * - Release certificate collateral
 * 
 * Requirements: 10.4, 10.5
 */

import { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'ap-south-1' });

// ========================================
// Type Definitions
// ========================================

interface InsurancePayoutEvent {
  claimId: string;
  certificateId: string;
  farmerId: string;
  payoutAmount: number;
  insuranceCompany: string;
  payoutDate: string;
  payoutReference: string;
}

interface PayoutProcessingResult {
  status: 'LOAN_REPAID' | 'PARTIAL_REPAYMENT' | 'CONVERTED_TO_STANDARD_LOAN' | 'NO_LOAN_FOUND';
  loanId?: string;
  loanAmount?: number;
  payoutAmount: number;
  remainingAmount?: number;
  certificateStatus: string;
  message: string;
}

interface LoanRecord {
  loanId: string;
  certificateId: string;
  farmerId: string;
  loanAmount: number;
  status: string;
  repaymentStatus: string;
}

// ========================================
// Constants
// ========================================

const LOANS_TABLE = process.env.LOANS_TABLE_NAME || 'VeriCrop-Loans';
const CERTIFICATES_TABLE = process.env.CERTIFICATES_TABLE_NAME || 'VeriCrop-Certificates';
const STANDARD_LOAN_INTEREST_RATE = 0.12; // 12% annual interest for converted loans

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<InsurancePayoutEvent, PayoutProcessingResult> = async (event) => {
  console.log('Insurance Payout Processing Started', {
    claimId: event.claimId,
    certificateId: event.certificateId,
    payoutAmount: event.payoutAmount,
  });

  try {
    // Find active bridge loan for this certificate
    const loan = await findLoanByCertificate(event.certificateId);

    if (!loan) {
      console.log('No active loan found for certificate', {
        certificateId: event.certificateId,
      });

      // Release certificate collateral anyway
      await releaseCertificateCollateral(event.certificateId, 'REDEEMED');

      return {
        status: 'NO_LOAN_FOUND',
        payoutAmount: event.payoutAmount,
        certificateStatus: 'REDEEMED',
        message: 'No active bridge loan found. Certificate released.',
      };
    }

    // Check if payout is sufficient to repay loan
    if (event.payoutAmount >= loan.loanAmount) {
      // Full repayment
      await repayLoan(loan.loanId, event.payoutAmount, event.payoutReference);
      await releaseCertificateCollateral(event.certificateId, 'REDEEMED');

      const remainingAmount = event.payoutAmount - loan.loanAmount;

      // Notify farmer
      await notifyFarmer(
        event.farmerId,
        'LOAN_REPAID',
        loan.loanAmount,
        event.payoutAmount,
        remainingAmount
      );

      console.log('Bridge loan fully repaid', {
        loanId: loan.loanId,
        loanAmount: loan.loanAmount,
        payoutAmount: event.payoutAmount,
        remainingAmount,
      });

      return {
        status: 'LOAN_REPAID',
        loanId: loan.loanId,
        loanAmount: loan.loanAmount,
        payoutAmount: event.payoutAmount,
        remainingAmount,
        certificateStatus: 'REDEEMED',
        message: `Bridge loan of ₹${loan.loanAmount.toLocaleString('en-IN')} fully repaid. Remaining amount: ₹${remainingAmount.toLocaleString('en-IN')}`,
      };
    } else {
      // Insufficient payout - convert to standard loan
      const shortfall = loan.loanAmount - event.payoutAmount;

      await partialRepayment(loan.loanId, event.payoutAmount, event.payoutReference);
      await convertToStandardLoan(loan.loanId, shortfall);

      // Keep certificate as collateral for standard loan
      await updateCertificateStatus(event.certificateId, 'USED_AS_COLLATERAL');

      // Notify farmer
      await notifyFarmer(
        event.farmerId,
        'CONVERTED_TO_STANDARD_LOAN',
        loan.loanAmount,
        event.payoutAmount,
        shortfall
      );

      console.log('Insufficient payout - converted to standard loan', {
        loanId: loan.loanId,
        loanAmount: loan.loanAmount,
        payoutAmount: event.payoutAmount,
        shortfall,
      });

      return {
        status: 'CONVERTED_TO_STANDARD_LOAN',
        loanId: loan.loanId,
        loanAmount: loan.loanAmount,
        payoutAmount: event.payoutAmount,
        remainingAmount: shortfall,
        certificateStatus: 'USED_AS_COLLATERAL',
        message: `Partial repayment of ₹${event.payoutAmount.toLocaleString('en-IN')}. Remaining ₹${shortfall.toLocaleString('en-IN')} converted to standard loan at ${STANDARD_LOAN_INTEREST_RATE * 100}% interest.`,
      };
    }
  } catch (error) {
    console.error('Insurance Payout Processing Failed', {
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
 * Find active bridge loan by certificate ID
 */
async function findLoanByCertificate(certificateId: string): Promise<LoanRecord | null> {
  try {
    const result = await dynamoClient.send(
      new QueryCommand({
        TableName: LOANS_TABLE,
        IndexName: 'CertificateIdIndex',
        KeyConditionExpression: 'certificateId = :certId',
        FilterExpression: '#status = :status AND repaymentStatus = :repaymentStatus',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':certId': certificateId,
          ':status': 'DISBURSED',
          ':repaymentStatus': 'PENDING',
        },
      })
    );

    if (result.Items && result.Items.length > 0) {
      return result.Items[0] as LoanRecord;
    }

    return null;
  } catch (error) {
    console.error('Failed to find loan by certificate', {
      certificateId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Repay bridge loan in full
 */
async function repayLoan(
  loanId: string,
  payoutAmount: number,
  payoutReference: string
): Promise<void> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: LOANS_TABLE,
        Key: {
          loanId,
        },
        UpdateExpression: 'SET #status = :status, repaymentStatus = :repaymentStatus, repaidAt = :repaidAt, payoutAmount = :payoutAmount, payoutReference = :payoutReference',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'REPAID',
          ':repaymentStatus': 'COMPLETE',
          ':repaidAt': new Date().toISOString(),
          ':payoutAmount': payoutAmount,
          ':payoutReference': payoutReference,
        },
      })
    );

    console.log('Loan repaid successfully', {
      loanId,
      payoutAmount,
      payoutReference,
    });
  } catch (error) {
    console.error('Failed to repay loan', {
      loanId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Process partial repayment
 */
async function partialRepayment(
  loanId: string,
  payoutAmount: number,
  payoutReference: string
): Promise<void> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: LOANS_TABLE,
        Key: {
          loanId,
        },
        UpdateExpression: 'SET repaymentStatus = :repaymentStatus, partialRepaymentAt = :repaidAt, payoutAmount = :payoutAmount, payoutReference = :payoutReference',
        ExpressionAttributeValues: {
          ':repaymentStatus': 'PARTIAL',
          ':repaidAt': new Date().toISOString(),
          ':payoutAmount': payoutAmount,
          ':payoutReference': payoutReference,
        },
      })
    );

    console.log('Partial repayment processed', {
      loanId,
      payoutAmount,
    });
  } catch (error) {
    console.error('Failed to process partial repayment', {
      loanId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Convert bridge loan to standard loan with interest
 */
async function convertToStandardLoan(loanId: string, remainingAmount: number): Promise<void> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: LOANS_TABLE,
        Key: {
          loanId,
        },
        UpdateExpression: 'SET loanType = :loanType, interestRate = :interestRate, remainingAmount = :remainingAmount, convertedAt = :convertedAt',
        ExpressionAttributeValues: {
          ':loanType': 'STANDARD_LOAN',
          ':interestRate': STANDARD_LOAN_INTEREST_RATE,
          ':remainingAmount': remainingAmount,
          ':convertedAt': new Date().toISOString(),
        },
      })
    );

    console.log('Loan converted to standard loan', {
      loanId,
      remainingAmount,
      interestRate: STANDARD_LOAN_INTEREST_RATE,
    });
  } catch (error) {
    console.error('Failed to convert to standard loan', {
      loanId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Release certificate collateral
 */
async function releaseCertificateCollateral(
  certificateId: string,
  newStatus: string
): Promise<void> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: CERTIFICATES_TABLE,
        Key: {
          certificateId,
        },
        UpdateExpression: 'SET collateralStatus = :released, #status = :newStatus, releasedAt = :releasedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':released': 'RELEASED',
          ':newStatus': newStatus,
          ':releasedAt': new Date().toISOString(),
        },
      })
    );

    console.log('Certificate collateral released', {
      certificateId,
      newStatus,
    });
  } catch (error) {
    console.error('Failed to release certificate collateral', {
      certificateId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't throw - this is a secondary operation
  }
}

/**
 * Update certificate status
 */
async function updateCertificateStatus(certificateId: string, newStatus: string): Promise<void> {
  try {
    await dynamoClient.send(
      new UpdateCommand({
        TableName: CERTIFICATES_TABLE,
        Key: {
          certificateId,
        },
        UpdateExpression: 'SET #status = :newStatus',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':newStatus': newStatus,
        },
      })
    );

    console.log('Certificate status updated', {
      certificateId,
      newStatus,
    });
  } catch (error) {
    console.error('Failed to update certificate status', {
      certificateId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't throw - this is a secondary operation
  }
}

/**
 * Notify farmer about payout processing result
 */
async function notifyFarmer(
  farmerId: string,
  status: string,
  loanAmount: number,
  payoutAmount: number,
  remainingAmount: number
): Promise<void> {
  try {
    let message = '';

    if (status === 'LOAN_REPAID') {
      message = `VeriCrop: आपका ₹${loanAmount.toLocaleString('en-IN')} का ब्रिज लोन बीमा भुगतान से पूरी तरह चुका दिया गया है। शेष राशि: ₹${remainingAmount.toLocaleString('en-IN')}। धन्यवाद!`;
    } else if (status === 'CONVERTED_TO_STANDARD_LOAN') {
      message = `VeriCrop: आपका ₹${payoutAmount.toLocaleString('en-IN')} का आंशिक भुगतान प्राप्त हुआ। शेष ₹${remainingAmount.toLocaleString('en-IN')} को ${STANDARD_LOAN_INTEREST_RATE * 100}% ब्याज पर मानक ऋण में परिवर्तित कर दिया गया है।`;
    }

    // In production, get farmer's phone number from database
    // For MVP, log the notification
    console.log('Farmer notification', {
      farmerId,
      status,
      message,
    });

    // Uncomment to send actual SMS via SNS
    // await snsClient.send(
    //   new PublishCommand({
    //     PhoneNumber: farmerPhone,
    //     Message: message,
    //   })
    // );
  } catch (error) {
    console.error('Failed to notify farmer', {
      farmerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Don't throw - notification is secondary
  }
}
