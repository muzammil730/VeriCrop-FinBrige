# VeriCrop FinBridge - AWS Manual Setup Guide

## Overview
This guide walks you through manually setting up VeriCrop FinBridge in AWS Console.
**Budget: $100 | Timeline: 5 Days | Region: ap-south-1 (Mumbai)**

## Prerequisites
- AWS Account with $100 credits activated
- Access to AWS Console
- Basic understanding of AWS services

## Cost Tracking
Monitor your spending: AWS Console → Billing Dashboard → Cost Explorer

---

## Phase 1: Core Infrastructure (Day 1 - $10)

### Step 1.1: Create DynamoDB Table for Claims Storage

**Purpose:** Store claim metadata, validation results, and processing status

**Console Steps:**
1. Go to AWS Console → Services → DynamoDB
2. Click "Create table"
3. Configure:
   - **Table name:** `vericrop-claims`
   - **Partition key:** `claimId` (String)
   - **Sort key:** `timestamp` (Number)
4. Table settings:
   - **Capacity mode:** On-demand (auto-scales, pay per request)
   - **Encryption:** AWS owned key (free)
5. Click "Create table"

**Cost:** ~$1/month for 20 test claims

**What you learned:** DynamoDB is a NoSQL database that auto-scales. On-demand mode means you only pay for actual reads/writes.


---

### Step 1.2: Create S3 Bucket for Evidence Storage

**Purpose:** Store farmer-submitted videos with tamper-proof Object Lock

**Console Steps:**
1. Go to AWS Console → Services → S3
2. Click "Create bucket"
3. Configure:
   - **Bucket name:** `vericrop-evidence-[your-account-id]` (must be globally unique)
   - **Region:** ap-south-1 (Mumbai)
   - **Object Ownership:** ACLs disabled
   - **Block Public Access:** Keep all 4 checkboxes CHECKED (security)
   - **Bucket Versioning:** ENABLE (required for Object Lock)
   - **Default encryption:** SSE-S3 (free)
   - **Object Lock:** ENABLE (prevents deletion/modification)
4. Click "Create bucket"
5. After creation, click bucket → Properties → Object Lock
   - Set retention mode: Compliance
   - Retention period: 2555 days (7 years for regulatory compliance)

**Cost:** ~$1 for 5GB storage

**What you learned:** S3 Object Lock makes files immutable (can't be changed/deleted). This is critical for legal evidence.

---

### Step 1.3: Create IAM Role for Lambda Functions

**Purpose:** Give Lambda functions permission to access DynamoDB, S3, and other services

**Console Steps:**
1. Go to AWS Console → Services → IAM → Roles
2. Click "Create role"
3. Select trusted entity:
   - **Trusted entity type:** AWS service
   - **Use case:** Lambda
4. Click "Next"
5. Attach permissions policies (search and select):
   - `AWSLambdaBasicExecutionRole` (CloudWatch logs)
   - `AmazonDynamoDBFullAccess` (read/write claims)
   - `AmazonS3FullAccess` (store evidence)
   - `AmazonRekognitionFullAccess` (video analysis)
6. Click "Next"
7. Role details:
   - **Role name:** `VeriCropLambdaExecutionRole`
   - **Description:** Execution role for VeriCrop Lambda functions
8. Click "Create role"

**Cost:** Free

**What you learned:** IAM roles define what AWS services can do. Lambda needs explicit permission to access other services.


---

### Step 1.4: Create CloudWatch Log Groups

**Purpose:** Centralized logging for debugging and monitoring

**Console Steps:**
1. Go to AWS Console → Services → CloudWatch → Log groups
2. Click "Create log group"
3. Create these log groups:
   - `/aws/lambda/vericrop-solar-azimuth`
   - `/aws/lambda/vericrop-weather-correlation`
   - `/aws/lambda/vericrop-ai-classifier`
   - `/aws/lambda/vericrop-certificate-issuer`
4. Retention: 7 days (to save costs)

**Cost:** ~$0.50 for 1GB logs

**What you learned:** CloudWatch Logs stores all Lambda execution logs. Setting retention prevents unlimited storage costs.

---

## Phase 2: Forensic Validation Engine (Day 2 - $30)

### Step 2.1: Create Lambda Function - Solar Azimuth Calculator

**Purpose:** Calculate expected shadow angle using physics formula (KEY DIFFERENTIATOR)

**Console Steps:**
1. Go to AWS Console → Services → Lambda
2. Click "Create function"
3. Configure:
   - **Function name:** `vericrop-solar-azimuth`
   - **Runtime:** Python 3.11
   - **Architecture:** x86_64
   - **Execution role:** Use existing role → `VeriCropLambdaExecutionRole`
4. Click "Create function"
5. In the code editor, replace the default code with the Solar Azimuth implementation (I'll provide next)
6. Configuration → General configuration:
   - **Memory:** 256 MB
   - **Timeout:** 30 seconds
7. Click "Deploy"

**Cost:** ~$0.20 per 1000 invocations

**What you learned:** Lambda is serverless compute - you only pay when code runs. No servers to manage.


**Lambda Code:** Copy the code from `lambda-functions/solar-azimuth-calculator.py` into the Lambda function editor.

**Test the function:**
1. Click "Test" tab
2. Create new test event:
```json
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "timestamp": "2026-03-01T12:00:00Z"
}
```
3. Click "Test" - should return azimuth angle ~180° (south at noon)

**What you learned:** 
- Cooper's equation calculates solar declination based on day of year
- Hour angle determines sun's east-west position
- The formula `sin α = sin Φ sin δ + cos Φ cos δ cos h` gives solar altitude
- Azimuth is calculated from altitude and declination
- This physics-based validation is impossible to fake!

---

### Step 2.2: Create Lambda Function - Shadow Comparator

**Purpose:** Compare actual shadow angle from video with expected angle

**Console Steps:**
1. Lambda → Create function
2. Configure:
   - **Function name:** `vericrop-shadow-comparator`
   - **Runtime:** Python 3.11
   - **Execution role:** `VeriCropLambdaExecutionRole`
3. Copy code from `lambda-functions/shadow-comparator.py` (creating next)
4. Configuration:
   - **Memory:** 512 MB (needs more for image processing)
   - **Timeout:** 60 seconds
5. Deploy

**Cost:** ~$0.50 per 1000 invocations


---

## Phase 3: Orchestration & Blockchain (Day 3 - $30)

### Step 3.1: Create Amazon QLDB Ledger for Loss Certificates

**Purpose:** Immutable blockchain storage for Loss Certificates (tamper-proof)

**Console Steps:**
1. Go to AWS Console → Services → QLDB (Quantum Ledger Database)
2. Click "Create ledger"
3. Configure:
   - **Ledger name:** `vericrop-certificates`
   - **Permissions mode:** Standard (allows IAM control)
   - **Deletion protection:** ENABLE (prevents accidental deletion)
   - **Encryption:** AWS owned key
4. Click "Create ledger"
5. Wait 2-3 minutes for ledger to become ACTIVE

**Cost:** ~$10 for prototype (charged per request + storage)

**What you learned:** QLDB is a fully managed ledger database that provides an immutable, cryptographically verifiable transaction log. Unlike traditional databases, data cannot be modified or deleted once written.

---

### Step 3.2: Create Lambda Function - Certificate Issuer

**Purpose:** Issue blockchain Loss Certificates after successful validation

**Console Steps:**
1. Lambda → Create function
2. Configure:
   - **Function name:** `vericrop-certificate-issuer`
   - **Runtime:** Python 3.11
   - **Execution role:** `VeriCropLambdaExecutionRole`
3. Add QLDB permissions to the role:
   - Go to IAM → Roles → VeriCropLambdaExecutionRole
   - Attach policy: `AmazonQLDBFullAccess`
4. Copy code from `lambda-functions/certificate-issuer.py` (creating next)
5. Configuration:
   - **Memory:** 256 MB
   - **Timeout:** 30 seconds
6. Deploy

**Cost:** ~$0.20 per 1000 invocations


---

### Step 3.3: Create Lambda Function - Bridge Loan Calculator

**Purpose:** Calculate and approve bridge loans (70% of damage amount)

**Console Steps:**
1. Lambda → Create function
2. Configure:
   - **Function name:** `vericrop-bridge-loan-calculator`
   - **Runtime:** Python 3.11
   - **Execution role:** `VeriCropLambdaExecutionRole`
3. Copy code from `lambda-functions/bridge-loan-calculator.py`
4. Configuration:
   - **Memory:** 256 MB
   - **Timeout:** 30 seconds
5. Deploy

**Cost:** ~$0.20 per 1000 invocations


---

### Step 3.4: Create Step Functions Workflow (60-Second Orchestration)

**Purpose:** Orchestrate all validation steps in parallel to meet 60-second deadline

**Console Steps:**
1. Go to AWS Console → Services → Step Functions
2. Click "Create state machine"
3. Choose "Write your workflow in code"
4. Select "Standard" type
5. Copy the workflow definition from `step-functions/claim-processing-workflow.json` (creating next)
6. Configure:
   - **Name:** `vericrop-claim-processing`
   - **Execution role:** Create new role (auto-generated)
7. Click "Create state machine"

**Cost:** ~$3 for 100 executions

**What you learned:** Step Functions is a visual workflow service that coordinates multiple Lambda functions. It can run tasks in parallel to meet tight deadlines like our 60-second requirement.

---

## Phase 4: Voice Interface (Day 4 - $15)

### Step 4.1: Create Amazon Lex Bot for Voice Claims

**Purpose:** Voice-first interface in Hindi for illiterate farmers

**Console Steps:**
1. Go to AWS Console → Services → Amazon Lex
2. Click "Create bot"
3. Configure:
   - **Bot name:** `VeriCropClaimBot`
   - **IAM role:** Create new role
   - **COPPA:** No
   - **Idle session timeout:** 5 minutes
4. Add language: Hindi (hi_IN)
5. Click "Create"

**Create Intent: FileCropDamageClaim**
1. In bot builder, click "Add intent" → "Add empty intent"
2. Intent name: `FileCropDamageClaim`
3. Sample utterances (Hindi):
   - "मुझे फसल बीमा दावा दर्ज करना है" (I want to file crop insurance claim)
   - "मेरी फसल खराब हो गई है" (My crop is damaged)
   - "बीमा क्लेम करना है" (Want to make insurance claim)
4. Add slots:
   - **farmer_id** (AMAZON.AlphaNumeric) - "आपका किसान आईडी क्या है?"
   - **damage_type** (Custom: drought, flood, pest, disease, hail) - "क्या नुकसान हुआ है?"
   - **location** (AMAZON.City) - "आप कहाँ से हैं?"
5. Fulfillment: AWS Lambda function → `vericrop-lex-fulfillment`
6. Save intent

**Cost:** ~$5 for 100 voice requests

**What you learned:** Amazon Lex is a conversational AI service that understands natural language. It supports multiple languages including Hindi, making it accessible to Indian farmers.
