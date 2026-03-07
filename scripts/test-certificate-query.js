const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function testQuery() {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: 'VeriCropClaims',
      IndexName: 'CertificateIndex',
      KeyConditionExpression: 'certificateId = :certId',
      ExpressionAttributeValues: {
        ':certId': 'CERT-2026-03-07-10000'
      }
    }));
    
    console.log('Query successful!');
    console.log('Items found:', result.Items?.length || 0);
    if (result.Items && result.Items.length > 0) {
      console.log('\nCertificate data:');
      console.log(JSON.stringify(result.Items[0], null, 2));
    }
  } catch (error) {
    console.error('Query failed:', error.message);
  }
}

testQuery();
