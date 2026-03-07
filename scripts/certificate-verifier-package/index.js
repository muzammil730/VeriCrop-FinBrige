const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

exports.handler = async (event) => {
  console.log('Certificate Verification Started', JSON.stringify(event));

  const verificationDetails = {
    certificateExists: false,
    hashVerified: false,
    notExpired: false,
    statusValid: false,
  };

  try {
    // Extract certificateId from event body (API Gateway passes it in body)
    let certificateId;
    
    if (typeof event.body === 'string') {
      const body = JSON.parse(event.body);
      certificateId = body.certificateId;
    } else if (event.certificateId) {
      certificateId = event.certificateId;
    } else if (event.body && event.body.certificateId) {
      certificateId = event.body.certificateId;
    }

    if (!certificateId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          isValid: false,
          verificationDetails,
          verifiedAt: new Date().toISOString(),
          errorMessage: 'Missing certificateId in request',
        }),
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
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          isValid: false,
          verificationDetails,
          verifiedAt: new Date().toISOString(),
          errorMessage: 'Certificate not found',
        }),
      };
    }

    const claim = result.Items[0];
    const certificate = claim.certificate;

    if (!certificate) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          isValid: false,
          verificationDetails,
          verifiedAt: new Date().toISOString(),
          errorMessage: 'Certificate data not found in claim',
        }),
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
    
    const calculatedHash = crypto.createHash('sha256')
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
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
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
      }),
    };
  } catch (error) {
    console.error('Certificate Verification Failed', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        isValid: false,
        verificationDetails,
        verifiedAt: new Date().toISOString(),
        errorMessage: error.message || 'Verification failed',
      }),
    };
  }
};
