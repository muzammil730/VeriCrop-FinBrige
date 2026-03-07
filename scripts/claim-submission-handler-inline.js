const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

exports.handler = async (event) => {
  console.log('Claim Submission Started', JSON.stringify(event));

  try {
    // Extract claim data from event body (API Gateway passes it in body)
    let claimData;
    
    if (typeof event.body === 'string') {
      claimData = JSON.parse(event.body);
    } else if (event.body) {
      claimData = event.body;
    } else {
      claimData = event;
    }

    console.log('Parsed claim data:', JSON.stringify(claimData));

    // Generate claim ID
    const timestamp = new Date(claimData.timestamp || new Date().toISOString());
    const claimId = `CLAIM-${timestamp.toISOString().split('T')[0]}-${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')}`;

    // Simulate validation (for demo, we'll approve most claims)
    const validationScore = 85 + Math.floor(Math.random() * 10);
    const status = validationScore >= 80 ? 'APPROVED' : 'PENDING';

    // Generate certificate for approved claims
    let certificateId = null;
    let certificate = null;
    
    if (status === 'APPROVED') {
      certificateId = `CERT-${timestamp.toISOString().split('T')[0]}-${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')}`;
      
      const certificateData = {
        certificateId,
        claimId,
        farmerId: claimData.farmerId || 'F' + Math.floor(Math.random() * 90000 + 10000),
        farmerName: claimData.farmerName,
        damageAmount: claimData.estimatedDamage,
        validationScore,
        status: 'APPROVED',
        issuedAt: timestamp.toISOString(),
        expiryDate: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      certificate = {
        ...certificateData,
        hash: crypto.createHash('sha256').update(JSON.stringify(certificateData)).digest('hex'),
      };
    }

    // Create claim record
    const claim = {
      claimId,
      submittedAt: timestamp.toISOString(),
      farmerId: claimData.farmerId || 'F' + Math.floor(Math.random() * 90000 + 10000),
      farmerName: claimData.farmerName,
      phoneNumber: claimData.phoneNumber,
      cropType: claimData.cropType,
      damageType: claimData.damageType,
      damagePercentage: claimData.damagePercentage,
      estimatedDamage: claimData.estimatedDamage,
      latitude: claimData.latitude,
      longitude: claimData.longitude,
      location: `${claimData.latitude}, ${claimData.longitude}`,
      timestamp: timestamp.toISOString(),
      status,
      validationScore,
      validations: {
        solarAzimuth: 'PASS',
        weatherCorrelation: 'PASS',
        aiClassification: 'PASS',
        bedrockAnalysis: 'APPROVE',
      },
      videoUrl: `s3://vericrop-evidence/${claimId}/field-video.mp4`,
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
    };

    if (certificateId) {
      claim.certificateId = certificateId;
      claim.certificate = certificate;
    }

    // Store claim in DynamoDB
    try {
      await dynamoClient.send(new PutCommand({
        TableName: process.env.TABLE_NAME || 'VeriCropClaims',
        Item: claim,
      }));
      console.log('Claim stored in DynamoDB:', claimId);
    } catch (dbError) {
      console.error('Failed to store in DynamoDB:', dbError);
      // Continue anyway for demo purposes
    }

    // Return success response
    const response = {
      claimId,
      status,
      validationScore,
      certificateId,
      damageAmount: claimData.estimatedDamage,
      validations: claim.validations,
      message: status === 'APPROVED' 
        ? `Claim approved! Certificate ${certificateId} issued.`
        : 'Claim submitted and pending review.',
    };

    console.log('Claim Submission Completed', response);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Claim Submission Failed', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error.message || 'Claim submission failed',
      }),
    };
  }
};
