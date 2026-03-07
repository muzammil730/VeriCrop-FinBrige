/**
 * Certificate Verifier Lambda Function (Fixed for VeriCropClaims table)
 * 
 * PURPOSE: Verify Loss Certificates stored in VeriCropClaims table
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createHash } from 'crypto';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

interface CertificateVerificationRequest {
  certificateId: string;
}

interface VerificationResult {
  isValid: boolean;
  certificate?: any;
  verificationDetails: {
    certificateExists: boolean;
    hashVerified: boolean;
    notExpired: boolean;
    statusValid: boolean;
  };
  verifiedAt: string;
  errorMessage?: string;
}

export const handler = async (event: any): Promise<VerificationResult> => {
  console.log('Certificate Verification Started', { event });

  const verificationDetails = {
    certificateExists: false,
    hashVerified: false,
    notExpired: false,
    statusValid: false,
  };

  try {
    // Extract certificateId from event body (API Gateway passes it in body)
    let certificateId: string;
    
    if (typeof event.body === 'string') {
      const body = JSON.parse(event.body);
      certificateId = body.certificateId;
    } else if (event.certificateId) {
      certificateId = event.certificateId;
    } else if (event.body && event.body.certificateId) {
      certificateId = event.body.certificateId;
    } else {
      return {
        isValid: false,
        verificationDetails,
        verifiedAt: new Date().toISOString(),
        errorMessage: 'Missing certificateId in request',
      };
    }

    console.log('Looking up certificate:', certificateId);

    // Query VeriCropClaims table using CertificateIndex GSI
    const result = await dynamoClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME || 'VeriCropClaims',
        IndexName: 'CertificateIndex',
        KeyConditionExpression: 'certificateId = :certId',
        ExpressionAttributeValues: {
          ':certId': certificateId,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return {
        isValid: false,
        verificationDetails,
        verifiedAt: new Date().toISOString(),
        errorMessage: 'Certificate not found',
      };
    }

    const claim = result.Items[0];
    const certificate = claim.certificate;

    if (!certificate) {
      return {
        isValid: false,
        verificationDetails,
        verifiedAt: new Date().toISOString(),
        errorMessage: 'Certificate data not found in claim',
      };
    }

    verificationDetails.certificateExists = true;

    // Verify hash
    const certificateData = {
      certificateId: certificate.certificateId,
      claimId: certificate.claimId,
      farmerId: certificate.farmerId,
      farmerName: certificate.farmerName,
      damageAmount: certificate.damageAmount,
      validationScore: certificate.validationScore,
      status: certificate.status,
      issuedAt: certificate.issuedAt,
      expiryDate: certificate.expiryDate,
    };
    
    const calculatedHash = createHash('sha256')
      .update(JSON.stringify(certificateData))
      .digest('hex');
    
    verificationDetails.hashVerified = calculatedHash === certificate.hash;

    // Check expiry
    const expiryDate = new Date(certificate.expiryDate);
    const now = new Date();
    verificationDetails.notExpired = now < expiryDate;

    // Check status
    verificationDetails.statusValid = certificate.status === 'APPROVED';

    const isValid =
      verificationDetails.certificateExists &&
      verificationDetails.hashVerified &&
      verificationDetails.notExpired &&
      verificationDetails.statusValid;

    return {
      isValid,
      certificate: {
        certificateId: certificate.certificateId,
        claimId: certificate.claimId,
        farmerName: certificate.farmerName,
        farmerId: certificate.farmerId,
        damageAmount: certificate.damageAmount,
        validationScore: certificate.validationScore,
        issuedAt: certificate.issuedAt,
        expiryDate: certificate.expiryDate,
        status: certificate.status,
        blockchainHash: certificate.hash,
      },
      verificationDetails,
      verifiedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Certificate Verification Failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      isValid: false,
      verificationDetails,
      verifiedAt: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Verification failed',
    };
  }
};
