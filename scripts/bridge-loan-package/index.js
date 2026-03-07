const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

const BRIDGE_LOAN_PERCENTAGE = 0.70; // 70% of damage amount
const INTEREST_RATE = 0.0; // Zero interest!

exports.handler = async (event) => {
  console.log('Bridge Loan Calculation Started', JSON.stringify(event));

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
          error: 'Missing certificateId in request',
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
          error: 'Certificate not found',
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
          error: 'Certificate data not found in claim',
        }),
      };
    }

    if (certificate.status !== 'APPROVED') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: `Certificate is not approved (status: ${certificate.status})`,
        }),
      };
    }

    // Check if certificate is expired
    const expiryDate = new Date(certificate.expiryDate);
    const now = new Date();
    if (now >= expiryDate) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Certificate has expired',
        }),
      };
    }

    // Calculate loan amount (70% of damage)
    const damageAmount = certificate.damageAmount;
    const loanAmount = Math.round(damageAmount * BRIDGE_LOAN_PERCENTAGE);

    // Generate loan ID and disbursement reference
    const loanId = uuidv4();
    const disbursementRef = `UPI-${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;

    const loanResult = {
      loanId,
      certificateId,
      farmerName: certificate.farmerName,
      damageAmount,
      loanAmount,
      interestRate: INTEREST_RATE,
      disbursementRef,
      message: `Bridge loan of ₹${loanAmount.toLocaleString('en-IN')} approved and disbursed to ${certificate.farmerName}`,
    };

    console.log('Bridge Loan Disbursement Completed', loanResult);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(loanResult),
    };
  } catch (error) {
    console.error('Bridge Loan Processing Failed', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error.message || 'Bridge loan processing failed',
      }),
    };
  }
};
