/**
 * Create DynamoDB Table for VeriCrop FinBridge
 */

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const REGION = 'ap-south-1';
const TABLE_NAME = 'VeriCropClaims';

const client = new DynamoDBClient({ region: REGION });

async function createTable() {
  console.log('🔧 Creating DynamoDB table...\n');
  
  try {
    // Check if table already exists
    try {
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      const existingTable = await client.send(describeCommand);
      console.log('✅ Table already exists!');
      console.log(`   Table Name: ${TABLE_NAME}`);
      console.log(`   Status: ${existingTable.Table.TableStatus}`);
      console.log(`   Region: ${REGION}`);
      return;
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
      // Table doesn't exist, continue to create it
    }
    
    const createCommand = new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        { AttributeName: 'claimId', AttributeType: 'S' },
        { AttributeName: 'certificateId', AttributeType: 'S' },
        { AttributeName: 'farmerId', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'claimId', KeyType: 'HASH' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'CertificateIndex',
          KeySchema: [
            { AttributeName: 'certificateId', KeyType: 'HASH' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
        {
          IndexName: 'FarmerIndex',
          KeySchema: [
            { AttributeName: 'farmerId', KeyType: 'HASH' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });
    
    const response = await client.send(createCommand);
    
    console.log('✅ Table created successfully!');
    console.log(`   Table Name: ${TABLE_NAME}`);
    console.log(`   Status: ${response.TableDescription.TableStatus}`);
    console.log(`   Region: ${REGION}`);
    console.log('\n⏳ Waiting for table to become active (this takes ~30 seconds)...\n');
    
    // Wait for table to become active
    let isActive = false;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!isActive && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      const tableInfo = await client.send(describeCommand);
      
      if (tableInfo.Table.TableStatus === 'ACTIVE') {
        isActive = true;
        console.log('✅ Table is now ACTIVE and ready to use!');
      } else {
        attempts++;
        process.stdout.write('.');
      }
    }
    
    if (!isActive) {
      console.log('\n⚠️  Table creation is taking longer than expected.');
      console.log('   Check AWS Console: https://console.aws.amazon.com/dynamodb/');
    }
    
  } catch (error) {
    console.error('\n❌ Failed to create table:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check AWS credentials: aws sts get-caller-identity');
    console.error('2. Verify IAM permissions for DynamoDB');
    console.error('3. Check AWS Console: https://console.aws.amazon.com/dynamodb/');
    throw error;
  }
}

async function main() {
  console.log('🚀 VeriCrop FinBridge - DynamoDB Table Setup');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    await createTable();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Next Steps:');
    console.log('');
    console.log('1. Seed demo data:');
    console.log('   node seed-demo-data-to-dynamodb.js');
    console.log('');
    console.log('2. Test your MVP:');
    console.log('   https://master.d564kvq3much7.amplifyapp.com');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ SETUP FAILED');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createTable };
