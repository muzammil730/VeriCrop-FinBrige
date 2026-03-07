/**
 * VeriCrop FinBridge - DynamoDB Demo Data Seeding Script
 * 
 * PURPOSE: Seed DynamoDB with realistic demo data for testing and presentations
 * 
 * USAGE:
 *   node scripts/seed-demo-data-to-dynamodb.js
 * 
 * PREREQUISITES:
 *   - AWS credentials configured (aws configure)
 *   - DynamoDB table "VeriCropClaims" exists
 *   - Node.js 18+ installed
 *   - npm install aws-sdk
 * 
 * WHAT THIS SCRIPT DOES:
 *   1. Creates 5 approved claims with certificates
 *   2. Creates 2 rejected claims (fraud detected)
 *   3. Creates 3 pending claims (in review)
 *   4. Seeds realistic farmer data
 *   5. Generates valid SHA-256 hashes for certificates
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

// Configuration
const REGION = 'ap-south-1';
const TABLE_NAME = 'VeriCropClaims';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Demo datasets
const DEMO_FARMERS = [
  { id: 'F10001', name: 'Ramesh Kumar', phone: '9876543210', location: 'Maharashtra' },
  { id: 'F10002', name: 'Priya Sharma', phone: '9876543211', location: 'Punjab' },
  { id: 'F10003', name: 'Suresh Patel', phone: '9876543212', location: 'Gujarat' },
  { id: 'F10004', name: 'Lakshmi Reddy', phone: '9876543213', location: 'Andhra Pradesh' },
  { id: 'F10005', name: 'Vijay Singh', phone: '9876543214', location: 'Rajasthan' },
  { id: 'F10006', name: 'Anita Desai', phone: '9876543215', location: 'Karnataka' },
  { id: 'F10007', name: 'Rajesh Yadav', phone: '9876543216', location: 'Uttar Pradesh' },
  { id: 'F10008', name: 'Meena Kumari', phone: '9876543217', location: 'Bihar' },
];

const CROP_TYPES = ['wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'pulses'];
const DAMAGE_TYPES = ['drought', 'flood', 'hailstorm', 'pest', 'disease'];

const GPS_LOCATIONS = [
  { lat: 19.0760, lon: 72.8777, location: 'Mumbai, Maharashtra' },
  { lat: 30.7333, lon: 76.7794, location: 'Chandigarh, Punjab' },
  { lat: 23.0225, lon: 72.5714, location: 'Ahmedabad, Gujarat' },
  { lat: 17.3850, lon: 78.4867, location: 'Hyderabad, Telangana' },
  { lat: 26.9124, lon: 75.7873, location: 'Jaipur, Rajasthan' },
];

/**
 * Generate SHA-256 hash for certificate
 */
function generateCertificateHash(certificateData) {
  const dataString = JSON.stringify(certificateData);
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Generate a realistic claim with all validations
 */
function generateClaim(farmer, status, index) {
  const timestamp = new Date(Date.now() - (index * 24 * 60 * 60 * 1000)); // Stagger by days
  const claimId = `CLAIM-${timestamp.toISOString().split('T')[0]}-${String(10000 + index).padStart(5, '0')}`;
  const certificateId = status === 'APPROVED' ? `CERT-${timestamp.toISOString().split('T')[0]}-${String(10000 + index).padStart(5, '0')}` : null;
  
  const cropType = CROP_TYPES[index % CROP_TYPES.length];
  const damageType = DAMAGE_TYPES[index % DAMAGE_TYPES.length];
  const gpsLocation = GPS_LOCATIONS[index % GPS_LOCATIONS.length];
  
  // Realistic damage amounts
  const damagePercentage = status === 'REJECTED' ? 95 : (50 + Math.random() * 30); // Rejected claims have suspiciously high %
  const estimatedDamage = status === 'REJECTED' ? 150000 : Math.floor(30000 + Math.random() * 70000);
  
  const validationScore = status === 'APPROVED' ? 90 + Math.floor(Math.random() * 10) : 
                          status === 'REJECTED' ? 20 + Math.floor(Math.random() * 30) :
                          60 + Math.floor(Math.random() * 20);
  
  const claim = {
    claimId,
    farmerId: farmer.id,
    farmerName: farmer.name,
    phoneNumber: farmer.phone,
    cropType,
    damageType,
    damagePercentage: Math.round(damagePercentage),
    estimatedDamage,
    latitude: gpsLocation.lat,
    longitude: gpsLocation.lon,
    location: gpsLocation.location,
    timestamp: timestamp.toISOString(),
    status,
    validationScore,
    validations: {
      solarAzimuth: status === 'REJECTED' ? 'FAIL' : 'PASS',
      weatherCorrelation: 'PASS',
      aiClassification: status === 'REJECTED' ? 'FRAUD_DETECTED' : 'PASS',
      bedrockAnalysis: status === 'REJECTED' ? 'REJECT' : 'APPROVE',
    },
    videoUrl: `s3://vericrop-evidence/${claimId}/field-video.mp4`,
    createdAt: timestamp.toISOString(),
    updatedAt: timestamp.toISOString(),
  };
  
  // Add certificate for approved claims
  if (status === 'APPROVED') {
    const certificateData = {
      certificateId,
      claimId,
      farmerId: farmer.id,
      farmerName: farmer.name,
      damageAmount: estimatedDamage,
      validationScore,
      status: 'APPROVED',
      issuedAt: timestamp.toISOString(),
      expiryDate: new Date(timestamp.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    claim.certificateId = certificateId;
    claim.certificate = {
      ...certificateData,
      hash: generateCertificateHash(certificateData),
    };
  }
  
  // Add rejection reason for rejected claims
  if (status === 'REJECTED') {
    claim.rejectionReason = damagePercentage > 90 
      ? 'Suspicious damage percentage (>90%). AI fraud detection flagged this claim.'
      : 'Weather data does not correlate with reported damage type.';
  }
  
  return claim;
}

/**
 * Seed demo data to DynamoDB
 */
async function seedDemoData() {
  console.log('🌱 Seeding demo data to DynamoDB...\n');
  
  const claims = [];
  let index = 0;
  
  // Generate 5 approved claims
  console.log('Creating 5 approved claims...');
  for (let i = 0; i < 5; i++) {
    const farmer = DEMO_FARMERS[index % DEMO_FARMERS.length];
    const claim = generateClaim(farmer, 'APPROVED', index);
    claims.push(claim);
    console.log(`  ✓ ${claim.claimId} - ${farmer.name} - ₹${claim.estimatedDamage.toLocaleString()}`);
    index++;
  }
  
  // Generate 2 rejected claims
  console.log('\nCreating 2 rejected claims (fraud detected)...');
  for (let i = 0; i < 2; i++) {
    const farmer = DEMO_FARMERS[index % DEMO_FARMERS.length];
    const claim = generateClaim(farmer, 'REJECTED', index);
    claims.push(claim);
    console.log(`  ✗ ${claim.claimId} - ${farmer.name} - REJECTED`);
    index++;
  }
  
  // Generate 3 pending claims
  console.log('\nCreating 3 pending claims...');
  for (let i = 0; i < 3; i++) {
    const farmer = DEMO_FARMERS[index % DEMO_FARMERS.length];
    const claim = generateClaim(farmer, 'PENDING', index);
    claims.push(claim);
    console.log(`  ⏳ ${claim.claimId} - ${farmer.name} - PENDING`);
    index++;
  }
  
  // Write to DynamoDB
  console.log('\n📝 Writing to DynamoDB...');
  
  for (const claim of claims) {
    try {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: claim,
      }));
      console.log(`  ✓ Inserted ${claim.claimId}`);
    } catch (error) {
      console.error(`  ✗ Failed to insert ${claim.claimId}:`, error.message);
    }
  }
  
  console.log('\n✅ Demo data seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   Total claims: ${claims.length}`);
  console.log(`   Approved: ${claims.filter(c => c.status === 'APPROVED').length}`);
  console.log(`   Rejected: ${claims.filter(c => c.status === 'REJECTED').length}`);
  console.log(`   Pending: ${claims.filter(c => c.status === 'PENDING').length}`);
  
  // Output demo certificate IDs for testing
  console.log('\n🎫 Demo Certificate IDs (for testing Bridge Loan):');
  claims
    .filter(c => c.certificateId)
    .forEach(c => console.log(`   ${c.certificateId} - ₹${c.estimatedDamage.toLocaleString()}`));
  
  return claims;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 VeriCrop FinBridge - DynamoDB Demo Data Seeder');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    const claims = await seedDemoData();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('');
    console.log('1. Test Certificate Verification:');
    console.log('   - Go to: https://master.d564kvq3much7.amplifyapp.com/verify-certificate');
    console.log('   - Use any certificate ID from above');
    console.log('');
    console.log('2. Test Bridge Loan:');
    console.log('   - Go to: https://master.d564kvq3much7.amplifyapp.com/bridge-loan');
    console.log('   - Use any certificate ID from above');
    console.log('');
    console.log('3. Submit New Claim:');
    console.log('   - Go to: https://master.d564kvq3much7.amplifyapp.com/claim-submission');
    console.log('   - Use demo inputs from seed-demo-environment.js');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ SEEDING FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateClaim, generateCertificateHash };
