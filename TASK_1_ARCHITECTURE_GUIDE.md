# Task 1: Core Infrastructure - Senior Cloud Architect Perspective

## 🎯 Executive Summary

**Objective**: Establish the foundational serverless infrastructure for VeriCrop FinBridge's 60-second forensic claim processing system.

**Key Challenge**: Build a system that can handle unpredictable disaster-driven traffic spikes (0 to 10,000 claims/hour) while maintaining evidence integrity for 7 years and meeting insurance regulatory compliance.

**Solution**: Serverless, event-driven architecture using AWS managed services with auto-scaling, encryption at rest, and immutable audit trails.

---

## 📐 Architecture Decisions & Rationale

### Decision 1: S3 Object Lock vs. Standard Versioning

#### The Requirement (Requirement 11: Evidence Integrity)

> "THE System SHALL store video and photo files in Amazon S3 with Object Lock enabled in compliance mode. THE System SHALL prevent any modification or deletion of stored evidence files for minimum 7 years (regulatory retention period)."

#### Why Object Lock is REQUIRED (Not Optional)

**Standard S3 Versioning**:
- ✅ Tracks file history
- ✅ Can recover deleted files
- ❌ **Root user can still delete versions**
- ❌ **No legal compliance guarantee**
- ❌ **Versions can be permanently deleted**

**S3 Object Lock (Compliance Mode)**:
- ✅ **WORM (Write Once Read Many)** - physically impossible to modify
- ✅ **Even root user cannot delete** before retention expires
- ✅ **Meets legal/regulatory requirements** (insurance industry standard)
- ✅ **Cryptographic proof of non-tampering**
- ✅ **Automatic retention enforcement** (7 years = 2555 days)

#### Real-World Scenario

**Without Object Lock**:
```
Day 1: Farmer submits video showing crop damage
Day 30: Insurer suspects fraud
Day 31: Farmer's friend (with AWS access) deletes the video
Day 32: No evidence exists - claim cannot be validated
Result: System fails, fraud succeeds
```

**With Object Lock (Compliance Mode)**:
```
Day 1: Farmer submits video → Object Lock enabled (2555 days)
Day 30: Insurer suspects fraud
Day 31: Farmer's friend tries to delete → AWS returns error: "Object locked"
Day 32: Evidence still exists, forensic analysis proceeds
Result: Fraud detected, system integrity maintained
```

#### Technical Implementation

```typescript
const evidenceBucket = new s3.Bucket(this, 'EvidenceBucket', {
  versioned: true,              // Track all changes
  objectLockEnabled: true,      // Enable WORM protection
  // ... other config
});
```

**Object Lock Configuration** (applied per object on upload):
```typescript
// When uploading evidence
s3.putObject({
  Bucket: 'vericrop-evidence',
  Key: 'claim-123/video.mp4',
  Body: videoData,
  ObjectLockMode: 'COMPLIANCE',     // Strictest mode
  ObjectLockRetainUntilDate: new Date(Date.now() + 2555 * 24 * 60 * 60 * 1000) // 7 years
});
```

#### How to Verify in AWS Console

1. **S3 Console** → Select bucket → **Properties** tab
2. Look for **"Object Lock"** section
3. Should show: **"Enabled"** with **"Compliance"** mode
4. Click on any uploaded object → **Properties**
5. See **"Object Lock"** section with retention date

#### Cost Comparison

- **Standard S3**: $0.023/GB/month
- **S3 with Object Lock**: $0.023/GB/month (same price!)
- **Benefit**: Legal compliance at no extra cost

---

### Decision 2: DynamoDB On-Demand vs. Provisioned Capacity

#### The Requirement (Requirement 6: Serverless Architecture)

> "WHEN claim volume surges during disasters, THE System SHALL automatically scale Lambda functions and Step Functions executions without manual intervention. THE System SHALL use DynamoDB for claim data storage with on-demand capacity mode for automatic scaling."

#### Why On-Demand is ESSENTIAL for Disaster Response

**Provisioned Capacity**:
- ❌ Must predict traffic in advance
- ❌ Manual scaling (takes minutes)
- ❌ Throttling during unexpected spikes
- ❌ Pay for unused capacity during quiet periods
- ❌ **Fails during disasters** (the exact time we need it most)

**On-Demand Capacity**:
- ✅ **Instant auto-scaling** (0 to millions of requests)
- ✅ **No capacity planning** required
- ✅ **Pay only for actual usage**
- ✅ **Handles traffic spikes automatically**
- ✅ **Perfect for unpredictable workloads**

#### Real-World Disaster Scenario

**Cyclone hits Maharashtra (real event: Cyclone Tauktae, May 2021)**

| Time | Event | Claims/Hour | Provisioned (FAILS) | On-Demand (SUCCEEDS) |
|------|-------|-------------|---------------------|----------------------|
| Day 0 | Normal operations | 10 | ✅ Handles easily | ✅ Handles easily |
| Day 1 | Cyclone makes landfall | 5,000 | ❌ Throttles at 1,000 | ✅ Auto-scales to 5,000 |
| Day 2 | Farmers assess damage | 10,000 | ❌ Throttles at 1,000 | ✅ Auto-scales to 10,000 |
| Day 3 | Peak claims | 15,000 | ❌ Throttles at 1,000 | ✅ Auto-scales to 15,000 |
| Day 7 | Back to normal | 50 | ❌ Paying for 1,000 | ✅ Scales down to 50 |

**Provisioned Result**: 14,000 farmers couldn't submit claims (system failure)
**On-Demand Result**: All 15,000 farmers served successfully

#### Cost Analysis

**Provisioned Capacity** (for disaster readiness):
- Must provision for peak: 15,000 writes/hour = 4.17 writes/second
- Provisioned WCU needed: 5 WCU (rounded up)
- Cost: 5 WCU × $0.00065/hour × 730 hours = **$2.37/month**
- **But**: Wasted 99% of the time (only needed during disasters)

**On-Demand Capacity**:
- Normal month: 10 claims/hour × 730 hours = 7,300 writes
- Cost: 7,300 × $1.25/million = **$0.009/month**
- Disaster month: 100,000 writes
- Cost: 100,000 × $1.25/million = **$0.125/month**
- **Average**: $0.05/month

**Savings**: $2.32/month (98% cheaper) while handling disasters better!

#### Technical Implementation

```typescript
const claimsTable = new dynamodb.Table(this, 'ClaimsTable', {
  tableName: 'VeriCrop-Claims',
  partitionKey: { name: 'claimId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'submittedAt', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,  // On-demand
  // ... other config
});
```

#### How to Verify in AWS Console

1. **DynamoDB Console** → Select table **"VeriCrop-Claims"**
2. **Overview** tab → **Table details** section
3. Look for **"Capacity mode"**: Should show **"On-demand"**
4. **Metrics** tab → See real-time read/write capacity (auto-adjusts)

---

### Decision 3: IAM Least Privilege for Truth Engine

#### The Requirement (Security Best Practice)

> "Lambda functions have minimal IAM permissions (only what they need). Cross-account roles for financial institution integration. Service Control Policies (SCPs) prevent privilege escalation."

#### Why Least Privilege Matters

**Over-Provisioned Permissions** (Bad):
```json
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}
```
**Risk**: Lambda can delete ANY S3 bucket in the account (including production data)

**Least Privilege** (Good):
```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:GetObjectVersion"],
  "Resource": "arn:aws:s3:::vericrop-evidence-889168907575/*"
}
```
**Benefit**: Lambda can ONLY read from the evidence bucket, nothing else

#### Specific Permissions for Truth Engine Components

**1. Solar Azimuth Validator Lambda**

**Needs**:
- Read video files from S3 (to extract GPS/timestamp)
- Read claim data from DynamoDB (to get claim details)
- Write validation results to DynamoDB (to store fraud score)
- Decrypt KMS-encrypted data (to read encrypted evidence)
- Write logs to CloudWatch (for debugging)

**Permissions**:
```typescript
// S3 Read-Only
evidenceBucket.grantRead(forensicValidatorRole);
// Translates to:
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:GetObjectVersion",
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::vericrop-evidence-889168907575",
    "arn:aws:s3:::vericrop-evidence-889168907575/*"
  ]
}

// DynamoDB Read/Write
claimsTable.grantReadWriteData(forensicValidatorRole);
// Translates to:
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:UpdateItem",
    "dynamodb:Query",
    "dynamodb:Scan"
  ],
  "Resource": [
    "arn:aws:dynamodb:ap-south-1:889168907575:table/VeriCrop-Claims",
    "arn:aws:dynamodb:ap-south-1:889168907575:table/VeriCrop-Claims/index/*"
  ]
}

// KMS Decrypt-Only (cannot encrypt new data)
kmsKey.grantDecrypt(forensicValidatorRole);
// Translates to:
{
  "Effect": "Allow",
  "Action": [
    "kms:Decrypt",
    "kms:DescribeKey"
  ],
  "Resource": "arn:aws:kms:ap-south-1:889168907575:key/xxxxx"
}
```

**Cannot Do** (Security):
- ❌ Delete S3 objects
- ❌ Modify S3 bucket policies
- ❌ Delete DynamoDB table
- ❌ Create new KMS keys
- ❌ Access other AWS services

**2. Certificate Issuer Lambda**

**Needs**:
- Read validated claims from DynamoDB
- Write certificates to QLDB
- Encrypt certificate data with KMS
- Write logs

**Permissions**:
```typescript
// DynamoDB Read/Write
claimsTable.grantReadWriteData(certificateIssuerRole);

// KMS Encrypt AND Decrypt (needs to create encrypted certificates)
kmsKey.grantEncryptDecrypt(certificateIssuerRole);
// Translates to:
{
  "Effect": "Allow",
  "Action": [
    "kms:Encrypt",
    "kms:Decrypt",
    "kms:GenerateDataKey",
    "kms:DescribeKey"
  ],
  "Resource": "arn:aws:kms:ap-south-1:889168907575:key/xxxxx"
}
```

**3. Step Functions Orchestration Role**

**Needs**:
- Invoke Lambda functions (to orchestrate workflow)
- Write logs to CloudWatch
- Send X-Ray traces

**Permissions**:
```typescript
stepFunctionsRole.addToPolicy(
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['lambda:InvokeFunction'],
    resources: [`arn:aws:lambda:ap-south-1:889168907575:function:vericrop-*`]
  })
);
```

**Cannot Do**:
- ❌ Delete Lambda functions
- ❌ Modify Lambda code
- ❌ Access S3 or DynamoDB directly
- ❌ Create new resources

#### How to Verify in AWS Console

1. **IAM Console** → **Roles**
2. Search for **"VeriCrop"**
3. Click on role (e.g., **"VeriCrop-ForensicValidator-Role"**)
4. **Permissions** tab → See attached policies
5. Click **"Show policy"** → See exact JSON permissions
6. **Trust relationships** tab → See which service can assume this role

#### Security Principle: Blast Radius Limitation

**If Solar Azimuth Lambda is compromised**:
- ✅ Can only read evidence (not delete)
- ✅ Can only update claims table (not delete table)
- ✅ Cannot access other AWS services
- ✅ Cannot escalate privileges
- **Blast radius**: Limited to reading evidence and updating claims

**If we used admin permissions**:
- ❌ Could delete entire S3 bucket
- ❌ Could delete DynamoDB table
- ❌ Could create backdoor IAM users
- ❌ Could exfiltrate all data
- **Blast radius**: Entire AWS account compromised

---

## 🏗️ CDK Implementation

### Project Structure

```
infrastructure/
├── bin/
│   └── infrastructure.ts          # CDK app entry point
├── lib/
│   └── vericrop-infrastructure-stack.ts  # Stack definition
├── package.json                   # Dependencies
├── cdk.json                       # CDK configuration
└── tsconfig.json                  # TypeScript config
```

### Complete CDK Stack Code

I'll provide the complete, production-ready CDK code with detailed comments explaining every decision.

---

## 🎓 Educational Deep-Dive

### How CDK Synthesize Works

**Step 1: You write TypeScript**
```typescript
new s3.Bucket(this, 'EvidenceBucket', {
  versioned: true,
  objectLockEnabled: true
});
```

**Step 2: CDK Synthesize (`npx cdk synth`)**
- CDK reads your TypeScript code
- Executes the code in Node.js
- Constructs an in-memory tree of AWS resources
- Converts each resource to CloudFormation JSON

**Step 3: CloudFormation Template Generated**
```json
{
  "Resources": {
    "EvidenceBucket": {
      "Type": "AWS::S3::Bucket",
      "Properties": {
        "VersioningConfiguration": {
          "Status": "Enabled"
        },
        "ObjectLockEnabled": true,
        "ObjectLockConfiguration": {
          "ObjectLockEnabled": "Enabled",
          "Rule": {
            "DefaultRetention": {
              "Mode": "COMPLIANCE",
              "Days": 2555
            }
          }
        }
      }
    }
  }
}
```

**Step 4: Deploy (`npx cdk deploy`)**
- Uploads CloudFormation template to S3
- Calls CloudFormation CreateStack API
- CloudFormation creates actual AWS resources
- Returns stack outputs

**Visualization**:
```
TypeScript Code
     ↓
CDK Synthesize (npx cdk synth)
     ↓
CloudFormation Template (JSON)
     ↓
CDK Deploy (npx cdk deploy)
     ↓
CloudFormation CreateStack API
     ↓
Actual AWS Resources Created
```

### Ensuring Idempotency

**Idempotency**: Running the same deployment multiple times produces the same result (no duplicates, no errors).

**How CDK Ensures Idempotency**:

1. **Logical IDs**: Each resource has a unique logical ID
   ```typescript
   new s3.Bucket(this, 'EvidenceBucket', { ... });
   //                   ^^^^^^^^^^^^^^^^
   //                   Logical ID (must be unique in stack)
   ```

2. **CloudFormation Change Sets**: Before deploying, CDK shows what will change
   ```bash
   npx cdk diff  # Shows: Added, Modified, Removed resources
   ```

3. **Update vs. Create**: CloudFormation knows if resource exists
   - First deploy: Creates new resources
   - Second deploy: Updates existing resources (if changed)
   - Third deploy: No changes (idempotent)

4. **Physical Resource IDs**: AWS assigns unique IDs
   - S3 Bucket: `vericrop-evidence-889168907575`
   - DynamoDB Table: `VeriCrop-Claims`
   - If you try to create again, AWS returns error: "Already exists"

**Example**:
```bash
# First deploy
npx cdk deploy
# Creates: KMS key, DynamoDB table, S3 bucket, IAM roles

# Second deploy (no code changes)
npx cdk deploy
# Output: "No changes to deploy"

# Third deploy (changed retention from 7 to 10 years)
npx cdk deploy
# Updates: S3 bucket lifecycle rule (in-place update)
# Does NOT: Create new bucket or duplicate resources
```

---

## 📍 How to Find Resources in AWS Console

### After Deployment

**1. CloudFormation Stack**
- **Console**: CloudFormation → Stacks
- **Stack Name**: `VeriCropFinBridgeStack`
- **Status**: `CREATE_COMPLETE` (green)
- **Resources Tab**: Lists all 27 created resources

**2. KMS Key**
- **Console**: KMS → Customer managed keys
- **Alias**: `vericrop-finbridge-key`
- **Key ID**: `e811995c-...` (unique)
- **Status**: `Enabled`

**3. DynamoDB Table**
- **Console**: DynamoDB → Tables
- **Table Name**: `VeriCrop-Claims`
- **Status**: `Active`
- **Capacity**: `On-demand`

**4. S3 Bucket**
- **Console**: S3 → Buckets
- **Bucket Name**: `vericrop-evidence-889168907575`
- **Properties**: Object Lock enabled

**5. IAM Roles**
- **Console**: IAM → Roles
- **Search**: `VeriCrop`
- **Roles**: ForensicValidator, CertificateIssuer, StepFunctions

**6. CloudWatch Log Groups**
- **Console**: CloudWatch → Logs → Log groups
- **Filter**: `/aws/lambda/vericrop`
- **Count**: 11 log groups

---

## 🚀 Deployment Commands

### Step 1: Install Dependencies

```bash
cd infrastructure
npm install
```

**What happens**:
- npm reads `package.json`
- Downloads `aws-cdk-lib`, `constructs`, TypeScript
- Installs in `node_modules/`

### Step 2: Compile TypeScript

```bash
npm run build
```

**What happens**:
- Runs `tsc` (TypeScript compiler)
- Reads `tsconfig.json` for compiler options
- Compiles `lib/*.ts` → `lib/*.js`
- Generates `lib/*.d.ts` (type definitions)

### Step 3: Synthesize CloudFormation

```bash
npx cdk synth
```

**What happens**:
- Executes `bin/infrastructure.ts`
- Instantiates `VeriCropInfrastructureStack`
- Calls all resource constructors
- Generates CloudFormation JSON
- Outputs to `cdk.out/VeriCropFinBridgeStack.template.json`
- Prints template to console

**Output**: 500+ lines of CloudFormation JSON

### Step 4: Preview Changes

```bash
npx cdk diff
```

**What happens**:
- Compares local template with deployed stack
- Shows: Added (green), Modified (yellow), Removed (red)
- Helps prevent accidental deletions

**Output**:
```
Stack VeriCropFinBridgeStack
Resources
[+] AWS::KMS::Key VeriCropKMSKey
[+] AWS::DynamoDB::Table ClaimsTable
[+] AWS::S3::Bucket EvidenceBucket
[+] AWS::IAM::Role ForensicValidatorRole
... (27 resources total)
```

### Step 5: Deploy to AWS

```bash
npx cdk deploy
```

**What happens**:
1. Synthesizes template (same as `cdk synth`)
2. Packages assets (Lambda code, etc.)
3. Uploads to CDK staging bucket in S3
4. Calls CloudFormation `CreateStack` API
5. CloudFormation creates resources in order:
   - KMS key (30 seconds)
   - IAM roles (1 minute)
   - DynamoDB table (2 minutes)
   - S3 bucket (30 seconds)
   - CloudWatch log groups (30 seconds)
6. Returns stack outputs
7. Prints resource ARNs

**Output**:
```
✨  Synthesis time: 5.2s

VeriCropFinBridgeStack: deploying...
VeriCropFinBridgeStack: creating CloudFormation changeset...

 ✅  VeriCropFinBridgeStack

✨  Deployment time: 180.5s

Outputs:
VeriCropFinBridgeStack.ClaimsTableName = VeriCrop-Claims
VeriCropFinBridgeStack.EvidenceBucketName = vericrop-evidence-889168907575
VeriCropFinBridgeStack.KMSKeyArn = arn:aws:kms:ap-south-1:889168907575:key/xxxxx

Stack ARN:
arn:aws:cloudformation:ap-south-1:889168907575:stack/VeriCropFinBridgeStack/xxxxx
```

### Step 6: Verify Deployment

```bash
# List all stacks
npx cdk list

# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name VeriCropFinBridgeStack \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs'
```

---

## 📊 Cost Breakdown

| Resource | Pricing | Monthly Cost |
|----------|---------|--------------|
| KMS Key | $1/month + $0.03/10k requests | $1.00 |
| DynamoDB On-Demand | $1.25/million writes, $0.25/million reads | $0.05 |
| S3 Standard | $0.023/GB | $2.00 (for 100GB evidence) |
| CloudWatch Logs | $0.50/GB ingested | $0.50 |
| IAM Roles | Free | $0.00 |
| **Total** | | **$3.55/month** |

**For 100 claims/day with 10MB video each**:
- Storage: 100 claims × 10MB × 30 days = 30GB = $0.69/month
- DynamoDB: 3,000 writes = $0.004/month
- **Total**: ~$2/month for prototype

---

## ✅ Task 1 Completion Checklist

Before moving to Task 2, verify:

- [ ] CDK project initialized
- [ ] All dependencies installed (`npm install`)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] CloudFormation template generated (`npx cdk synth`)
- [ ] Stack deployed successfully (`npx cdk deploy`)
- [ ] All 27 resources created (check CloudFormation console)
- [ ] KMS key has auto-rotation enabled
- [ ] DynamoDB table is on-demand mode
- [ ] S3 bucket has Object Lock enabled
- [ ] IAM roles have least privilege permissions
- [ ] CloudWatch log groups are encrypted

---

## 🎯 Next Steps

Once Task 1 is validated:
- **Task 2**: Implement Solar Azimuth forensic validation Lambda
- **Task 3**: Implement weather correlation validation
- **Task 4**: Implement AI crop damage classification

**Stop here. Validate Task 1 before proceeding.**
