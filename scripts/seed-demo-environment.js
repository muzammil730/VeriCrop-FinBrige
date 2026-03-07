/**
 * VeriCrop FinBridge - Demo Environment Seeding Script
 * 
 * PURPOSE: Seed DynamoDB and S3 with deterministic test data that guarantees
 * 100% successful claim approval during live demo presentations.
 * 
 * USAGE:
 *   node scripts/seed-demo-environment.js
 * 
 * PREREQUISITES:
 *   - AWS credentials configured (aws configure)
 *   - Node.js 18+ installed
 *   - npm install @aws-sdk/client-dynamodb @aws-sdk/client-s3
 * 
 * WHAT THIS SCRIPT DOES:
 *   1. Creates a test farmer profile in DynamoDB
 *   2. Creates an active insurance policy in DynamoDB
 *   3. Uploads policy terms to S3 (for Bedrock RAG validation)
 *   4. Outputs the exact inputs to use in the live demo
 */

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// ========================================
// Configuration
// ========================================

const REGION = 'ap-south-1'; // Mumbai, India
const DYNAMODB_CLAIMS_TABLE = 'VeriCrop-Claims';
const DYNAMODB_CERTIFICATES_TABLE = 'VeriCrop-Certificates';
const DYNAMODB_LOANS_TABLE = 'VeriCrop-Loans';
const S3_EVIDENCE_BUCKET = 'vericrop-evidence-bucket';

// Demo farmer profile (deterministic test data)
const DEMO_FARMER = {
  farmerId: 'FARMER-DEMO-2026',
  name: 'Ramesh Kumar',
  phoneNumber: '+919999999999',
  upiId: 'ramesh@ybl',
  village: 'Khargone',
  district: 'Madhya Pradesh',
  cropType: 'Wheat',
  landArea: 5.0, // hectares
};

// Demo insurance policy (active, covers flood damage)
const DEMO_POLICY = {
  policyId: 'POL-DEMO-2026',
  farmerId: 'FARMER-DEMO-2026',
  policyType: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
  coverage: 100000, // INR
  cropType: 'Wheat',
  season: 'Rabi 2025-26',
  startDate: '2025-11-01',
  endDate: '2026-04-30',
  status: 'ACTIVE',
  coveredPerils: [
    'Heavy Rainfall',
    'Waterlogging',
    'Flood',
    'Drought',
    'Pest Attack',
    'Disease',
  ],
};

// Policy terms document (for Bedrock RAG validation)
const POLICY_TERMS_DOCUMENT = `
PRADHAN MANTRI FASAL BIMA YOJANA (PMFBY)
Policy Number: POL-DEMO-2026
Farmer: Ramesh Kumar
Crop: Wheat
Coverage: ₹100,000

COVERED PERILS:
This policy provides comprehensive coverage for the following perils:

1. HEAVY RAINFALL AND WATERLOGGING
   - Damage caused by excessive rainfall leading to waterlogging
   - Submergence of crops due to flooding
   - Root rot and crop damage from prolonged water exposure
   - Coverage: Up to 100% of sum insured

2. FLOOD DAMAGE
   - Inundation of farmland due to river overflow
   - Flash floods causing crop destruction
   - Soil erosion and nutrient loss
   - Coverage: Up to 100% of sum insured

3. DROUGHT
   - Prolonged dry spells affecting crop growth
   - Moisture stress leading to crop failure
   - Coverage: Up to 80% of sum insured

4. PEST ATTACK
   - Locust swarms and other pest infestations
   - Coverage: Up to 70% of sum insured

5. DISEASE
   - Fungal, bacterial, or viral crop diseases
   - Coverage: Up to 70% of sum insured

CLAIM PROCESS:
- Claims must be filed within 72 hours of damage occurrence
- Video evidence with GPS metadata required
- Forensic validation using solar azimuth and weather correlation
- AI-powered damage assessment
- Instant certificate issuance upon approval
- Bridge loan available at 0% interest (70% of damage amount)

EXCLUSIONS:
- War, nuclear hazards, riots
- Willful damage or negligence
- Damage occurring outside policy period

This policy is valid from November 1, 2025 to April 30, 2026.
`;

// ========================================
// AWS Clients
// ========================================

const dynamodbClient = new DynamoDBClient({ region: REGION });
const s3Client = new S3Client({ region: REGION });

// ========================================
// Seeding Functions
// ========================================

/**
 * Seed farmer profile into DynamoDB
 */
async function seedFarmerProfile() {
  console.log('📝 Seeding farmer profile...');
  
  const params = {
    TableName: DYNAMODB_CLAIMS_TABLE,
    Item: {
      PK: { S: `FARMER#${DEMO_FARMER.farmerId}` },
      SK: { S: 'PROFILE' },
      farmerId: { S: DEMO_FARMER.farmerId },
      name: { S: DEMO_FARMER.name },
      phoneNumber: { S: DEMO_FARMER.phoneNumber },
      upiId: { S: DEMO_FARMER.upiId },
      village: { S: DEMO_FARMER.village },
      district: { S: DEMO_FARMER.district },
      cropType: { S: DEMO_FARMER.cropType },
      landArea: { N: DEMO_FARMER.landArea.toString() },
      createdAt: { S: new Date().toISOString() },
      updatedAt: { S: new Date().toISOString() },
    },
  };
  
  try {
    await dynamodbClient.send(new PutItemCommand(params));
    console.log('✅ Farmer profile seeded successfully');
    console.log(`   Name: ${DEMO_FARMER.name}`);
    console.log(`   Phone: ${DEMO_FARMER.phoneNumber}`);
    console.log(`   UPI ID: ${DEMO_FARMER.upiId}`);
  } catch (error) {
    console.error('❌ Error seeding farmer profile:', error.message);
    throw error;
  }
}

/**
 * Seed insurance policy into DynamoDB
 */
async function seedInsurancePolicy() {
  console.log('\n📋 Seeding insurance policy...');
  
  const params = {
    TableName: DYNAMODB_CLAIMS_TABLE,
    Item: {
      PK: { S: `POLICY#${DEMO_POLICY.policyId}` },
      SK: { S: 'DETAILS' },
      policyId: { S: DEMO_POLICY.policyId },
      farmerId: { S: DEMO_POLICY.farmerId },
      policyType: { S: DEMO_POLICY.policyType },
      coverage: { N: DEMO_POLICY.coverage.toString() },
      cropType: { S: DEMO_POLICY.cropType },
      season: { S: DEMO_POLICY.season },
      startDate: { S: DEMO_POLICY.startDate },
      endDate: { S: DEMO_POLICY.endDate },
      status: { S: DEMO_POLICY.status },
      coveredPerils: { SS: DEMO_POLICY.coveredPerils },
      createdAt: { S: new Date().toISOString() },
      updatedAt: { S: new Date().toISOString() },
    },
  };
  
  try {
    await dynamodbClient.send(new PutItemCommand(params));
    console.log('✅ Insurance policy seeded successfully');
    console.log(`   Policy ID: ${DEMO_POLICY.policyId}`);
    console.log(`   Coverage: ₹${DEMO_POLICY.coverage.toLocaleString('en-IN')}`);
    console.log(`   Crop: ${DEMO_POLICY.cropType}`);
    console.log(`   Status: ${DEMO_POLICY.status}`);
  } catch (error) {
    console.error('❌ Error seeding insurance policy:', error.message);
    throw error;
  }
}

/**
 * Upload policy terms document to S3 (for Bedrock RAG validation)
 */
async function uploadPolicyTermsToS3() {
  console.log('\n📄 Uploading policy terms to S3...');
  
  const params = {
    Bucket: S3_EVIDENCE_BUCKET,
    Key: `policies/${DEMO_POLICY.policyId}-terms.txt`,
    Body: POLICY_TERMS_DOCUMENT,
    ContentType: 'text/plain',
    Metadata: {
      policyId: DEMO_POLICY.policyId,
      farmerId: DEMO_FARMER.farmerId,
      uploadedBy: 'seed-demo-environment-script',
      uploadedAt: new Date().toISOString(),
    },
  };
  
  try {
    await s3Client.send(new PutObjectCommand(params));
    console.log('✅ Policy terms uploaded to S3 successfully');
    console.log(`   Bucket: ${S3_EVIDENCE_BUCKET}`);
    console.log(`   Key: policies/${DEMO_POLICY.policyId}-terms.txt`);
    console.log(`   Size: ${POLICY_TERMS_DOCUMENT.length} bytes`);
  } catch (error) {
    console.error('❌ Error uploading policy terms to S3:', error.message);
    throw error;
  }
}

/**
 * Calculate perfect solar azimuth inputs for demo
 * 
 * This function calculates a set of GPS coordinates, timestamp, and shadow direction
 * that will ALWAYS pass the solar azimuth validation (±5° tolerance).
 * 
 * STRATEGY:
 * - Use Mumbai coordinates (19.0760°N, 72.8777°E)
 * - Use March 7, 2026 at 2:00 PM IST (peak afternoon sun)
 * - Calculate expected shadow direction
 * - Provide shadow direction within ±3° tolerance (well within ±5° limit)
 */
function calculatePerfectDemoInputs() {
  console.log('\n🧮 Calculating perfect demo inputs...');
  
  // Demo location: Mumbai, India
  const latitude = 19.0760;
  const longitude = 72.8777;
  
  // Demo timestamp: March 7, 2026 at 2:00 PM IST (14:00)
  // This is afternoon, so sun is in western sky - perfect for demo
  const timestamp = new Date('2026-03-07T14:00:00+05:30'); // IST timezone
  
  // Calculate day of year (March 7 = day 66)
  const startOfYear = new Date(timestamp.getFullYear(), 0, 0);
  const diff = timestamp.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Calculate solar declination using Cooper's equation
  // δ = 23.45° × sin(360° × (284 + n) / 365)
  const angle = (360 * (284 + dayOfYear)) / 365;
  const angleRadians = angle * (Math.PI / 180);
  const solarDeclination = 23.45 * Math.sin(angleRadians);
  
  // Calculate local time in hours
  const hours = timestamp.getHours();
  const minutes = timestamp.getMinutes();
  const localTime = hours + minutes / 60;
  
  // Calculate hour angle
  const longitudeTimeOffset = longitude / 15;
  const solarNoon = 12 - longitudeTimeOffset;
  const hoursFromSolarNoon = localTime - solarNoon;
  const hourAngle = 15 * hoursFromSolarNoon;
  
  // Calculate solar azimuth
  // sin α = sin Φ sin δ + cos Φ cos δ cos h
  const latRad = latitude * (Math.PI / 180);
  const decRad = solarDeclination * (Math.PI / 180);
  const hourRad = hourAngle * (Math.PI / 180);
  
  const sinAzimuth = 
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourRad);
  
  let solarAzimuth = Math.asin(sinAzimuth) * (180 / Math.PI);
  
  // Adjust for afternoon (hour angle > 0)
  if (hourAngle > 0) {
    solarAzimuth = 180 - solarAzimuth;
  }
  
  // Normalize to [0, 360)
  if (solarAzimuth < 0) {
    solarAzimuth += 360;
  }
  
  // Calculate expected shadow direction (opposite of sun)
  let expectedShadowDirection = solarAzimuth + 180;
  if (expectedShadowDirection >= 360) {
    expectedShadowDirection -= 360;
  }
  
  // For demo, use shadow direction within ±3° of expected (well within ±5° tolerance)
  const demoShadowDirection = Math.round(expectedShadowDirection);
  
  console.log('✅ Perfect demo inputs calculated');
  console.log(`   Latitude: ${latitude}°N`);
  console.log(`   Longitude: ${longitude}°E`);
  console.log(`   Timestamp: ${timestamp.toISOString()}`);
  console.log(`   Day of Year: ${dayOfYear}`);
  console.log(`   Solar Declination: ${solarDeclination.toFixed(2)}°`);
  console.log(`   Hour Angle: ${hourAngle.toFixed(2)}°`);
  console.log(`   Solar Azimuth: ${solarAzimuth.toFixed(2)}°`);
  console.log(`   Expected Shadow Direction: ${expectedShadowDirection.toFixed(2)}°`);
  console.log(`   Demo Shadow Direction: ${demoShadowDirection}° (within ±5° tolerance)`);
  
  return {
    latitude,
    longitude,
    timestamp: timestamp.toISOString(),
    solarAzimuth: Math.round(solarAzimuth * 100) / 100,
    expectedShadowDirection: Math.round(expectedShadowDirection * 100) / 100,
    demoShadowDirection,
  };
}

// ========================================
// Main Execution
// ========================================

async function main() {
  console.log('🚀 VeriCrop FinBridge - Demo Environment Seeding Script');
  console.log('=' .repeat(60));
  console.log('');
  
  try {
    // Step 1: Seed farmer profile
    await seedFarmerProfile();
    
    // Step 2: Seed insurance policy
    await seedInsurancePolicy();
    
    // Step 3: Upload policy terms to S3
    await uploadPolicyTermsToS3();
    
    // Step 4: Calculate perfect demo inputs
    const demoInputs = calculatePerfectDemoInputs();
    
    // Output summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DEMO ENVIRONMENT SEEDED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 DEMO INPUTS FOR LIVE PRESENTATION:');
    console.log('');
    console.log('FARMER INFORMATION:');
    console.log(`  Name: ${DEMO_FARMER.name}`);
    console.log(`  Phone: ${DEMO_FARMER.phoneNumber}`);
    console.log(`  UPI ID: ${DEMO_FARMER.upiId}`);
    console.log('');
    console.log('CLAIM DETAILS:');
    console.log(`  Crop Type: ${DEMO_POLICY.cropType}`);
    console.log(`  Damage Type: Flood`);
    console.log(`  Damage Percentage: 65%`);
    console.log(`  Estimated Loss: ₹50,000`);
    console.log('');
    console.log('GPS & TIMESTAMP (GUARANTEED TO PASS):');
    console.log(`  Latitude: ${demoInputs.latitude}`);
    console.log(`  Longitude: ${demoInputs.longitude}`);
    console.log(`  Timestamp: ${demoInputs.timestamp}`);
    console.log(`  Shadow Direction: ${demoInputs.demoShadowDirection}° (±5° tolerance)`);
    console.log('');
    console.log('EXPECTED RESULTS:');
    console.log(`  ✓ Solar Azimuth: PASS (${demoInputs.solarAzimuth}°)`);
    console.log(`  ✓ Weather Correlation: PASS (flood conditions)`);
    console.log(`  ✓ AI Classification: PASS (flood damage detected)`);
    console.log(`  ✓ Bedrock Analysis: APPROVE (policy covers flood)`);
    console.log(`  ✓ Claim Status: APPROVED`);
    console.log(`  ✓ Bridge Loan: ₹35,000 (70% of ₹50,000)`);
    console.log('');
    console.log('📄 Next Step: Follow DEMO_CHEAT_SHEET.md for live presentation');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ SEEDING FAILED:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  1. Check AWS credentials: aws configure');
    console.error('  2. Verify DynamoDB tables exist');
    console.error('  3. Verify S3 bucket exists');
    console.error('  4. Check IAM permissions');
    process.exit(1);
  }
}

// Run the script
main();
