/**
 * Certificate Verifier Lambda Function
 * 
 * PURPOSE: Verify Loss Certificates and their cryptographic proofs
 * 
 * FEATURES:
 * - Query certificate by ID from DynamoDB
 * - Verify cryptographic hash integrity
 * - Return certificate data and verification result
 * - Provide audit trail information
 * 
 * Requirements: 7.3, 12.2
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createHash } from 'crypto';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

// ========================================
// Type Definitions
// ========================================

interface CertificateVerificationRequest {
  certificateId: string;
  verifyIntegrity?: boolean; // Optional: Perform deep integrity check
}

interface CertificateData {
  certificateId: string;
  claimId: string;
  farmerDID: string;
  damageAmount: number;
  validationScore: number;
  issuedAt: string;
  status: 'ACTIVE' | 'USED_AS_COLLATERAL' | 'LOAN_REPAID' | 'EXPIRED';
  blockchainHash: string;
  blockAddress?: string;
  collateralValue: number;
  expiryDate: string;
  metadata?: any;
}

interface VerificationResult {
  isValid: boolean;
  certificate?: CertificateData;
  verificationDetails: {
    certificateExists: boolean;
    hashVerified: boolean;
    notExpired: boolean;
    statusValid: boolean;
  };
  auditTrail?: AuditTrailEntry[];
  verifiedAt: string;
  errorMessage?: string;
}

interface AuditTrailEntry {
  action: string;
  timestamp: string;
  actor?: string;
  details?: any;
}

// ========================================
// Lambda Handler
// ========================================

export const handler = async (event: CertificateVerificationRequest): Promise<VerificationResult> => {
  console.log('Certificate Verification Started', {
    certificateId: event.certificateId,
  });

  const verificationDetails = {
    certificateExists: false,
    hashVerified: false,
    notExpired: false,
    statusValid: false,
  };

  try {
    // Step 1: Query certificate from DynamoDB
    const certificate = await getCertificate(event.certificateId);
    
    if (!certificate) {
      return {
        isValid: false,
        verificationDetails,
        verifiedAt: new Date().toISOString(),
        errorMessage: 'Certificate not found',
      };
    }

    verificationDetails.certificateExists = true;

    // Step 2: Verify cryptographic hash
    const hashValid = await verifyCryptographicHash(certificate);
    verificationDetails.hashVerified = hashValid;

    // Step 3: Check expiry date
    const notExpired = checkExpiryDate(certificate.expiryDate);
    verificationDetails.notExpired = notExpired;

    // Step 4: Verify status is valid
    const statusValid = verifyStatus(certificate.status);
    verificationDetails.statusValid = statusValid;

    // Step 5: Get audit trail (optional)
    const auditTrail = event.verifyIntegrity
      ? await getAuditTrail(event.certificateId)
      : undefined;

    // Overall validation
    const isValid = verificationDetails.certificateExists &&
                    verificationDetails.hashVerified &&
                    verificationDetails.notExpired &&
                    verificationDetails.statusValid;

    const result: VerificationResult = {
      isValid,
      certificate,
      verificationDetails,
      auditTrail,
      verifiedAt: new Date().toISOString(),
    };

    console.log('Certificate Verification Completed', {
      certificateId: event.certificateId,
      isValid,
    });

    return result;

  } catch (error) {
    console.error('Certificate Verification Failed', {
      certificateId: event.certificateId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      isValid: false,
      verificationDetails,
      verifiedAt: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Verification failed',
    };
  }
};

// ========================================
// Helper Functions
// ========================================

/**
 * Get certificate from DynamoDB
 */
async function getCertificate(certificateId: string): Promise<CertificateData | null> {
  const tableName = process.env.CERTIFICATES_TABLE_NAME || 'VeriCrop-Certificates';

  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { certificateId },
    });

    const response = await dynamoClient.send(command);

    if (!response.Item) {
      return null;
    }

    return response.Item as CertificateData;

  } catch (error) {
    console.error('Error getting certificate:', error);
    return null;
  }
}

/**
 * Verify cryptographic hash integrity
 * 
 * Recalculates the hash from certificate data and compares with stored hash
 */
async function verifyCryptographicHash(certificate: CertificateData): Promise<boolean> {
  try {
    // Create canonical representation of certificate data
    const canonicalData = {
      certificateId: certificate.certificateId,
      claimId: certificate.claimId,
      farmerDID: certificate.farmerDID,
      damageAmount: certificate.damageAmount,
      validationScore: certificate.validationScore,
      issuedAt: certificate.issuedAt,
    };

    // Calculate hash
    const calculatedHash = createHash('sha256')
      .update(JSON.stringify(canonicalData))
      .digest('hex');

    // Compare with stored hash
    const hashMatches = calculatedHash === certificate.blockchainHash;

    if (!hashMatches) {
      console.error('Hash verification failed!', {
        expected: certificate.blockchainHash,
        calculated: calculatedHash,
      });
    }

    return hashMatches;

  } catch (error) {
    console.error('Error verifying hash:', error);
    return false;
  }
}

/**
 * Check if certificate has expired
 */
function checkExpiryDate(expiryDate: string): boolean {
  try {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return now < expiry;
  } catch (error) {
    console.error('Error checking expiry date:', error);
    return false;
  }
}

/**
 * Verify certificate status is valid
 */
function verifyStatus(status: string): boolean {
  const validStatuses = ['ACTIVE', 'USED_AS_COLLATERAL', 'LOAN_REPAID'];
  return validStatuses.includes(status);
}

/**
 * Get audit trail for certificate
 * 
 * Returns all actions performed on this certificate
 */
async function getAuditTrail(certificateId: string): Promise<AuditTrailEntry[]> {
  const tableName = process.env.CERTIFICATES_TABLE_NAME || 'VeriCrop-Certificates';

  try {
    // Query for all certificate history entries
    // In production, you would have a separate audit trail table or use DynamoDB Streams
    
    // For MVP: Return mock audit trail
    return [
      {
        action: 'CERTIFICATE_ISSUED',
        timestamp: new Date().toISOString(),
        actor: 'VeriCrop System',
        details: { certificateId },
      },
    ];

  } catch (error) {
    console.error('Error getting audit trail:', error);
    return [];
  }
}

/**
 * Verify certificate by farmer DID
 * 
 * This function can be used to get all certificates for a specific farmer
 */
export async function getCertificatesByFarmer(farmerDID: string): Promise<CertificateData[]> {
  const tableName = process.env.CERTIFICATES_TABLE_NAME || 'VeriCrop-Certificates';

  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: 'FarmerDIDIndex',
      KeyConditionExpression: 'farmerDID = :farmerDID',
      ExpressionAttributeValues: {
        ':farmerDID': farmerDID,
      },
    });

    const response = await dynamoClient.send(command);

    return (response.Items || []) as CertificateData[];

  } catch (error) {
    console.error('Error getting certificates by farmer:', error);
    return [];
  }
}

/**
 * Verify certificate by claim ID
 * 
 * This function can be used to get the certificate for a specific claim
 */
export async function getCertificateByClaimId(claimId: string): Promise<CertificateData | null> {
  const tableName = process.env.CERTIFICATES_TABLE_NAME || 'VeriCrop-Certificates';

  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: 'ClaimIdIndex',
      KeyConditionExpression: 'claimId = :claimId',
      ExpressionAttributeValues: {
        ':claimId': claimId,
      },
      Limit: 1,
    });

    const response = await dynamoClient.send(command);

    if (!response.Items || response.Items.length === 0) {
      return null;
    }

    return response.Items[0] as CertificateData;

  } catch (error) {
    console.error('Error getting certificate by claim ID:', error);
    return null;
  }
}
