# VeriCrop FinBridge - Setup Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- AWS CLI configured
- AWS credentials with DynamoDB access

### Setup Steps

1. **Clone Repository**
```bash
git clone https://github.com/muzammil730/VeriCrop-FinBrige.git
cd VeriCrop-FinBrige
```

2. **Create DynamoDB Table & Seed Data**
```bash
cd scripts
npm install
node create-dynamodb-table.js
node seed-demo-data-to-dynamodb.js
```

3. **Test the Live App**
- Open: https://main.d564kvq3much7.amplifyapp.com
- Try certificate verification with: `CERT-2026-03-07-10000`
- Try bridge loan with same certificate ID

## 📋 Demo Certificate IDs

```
CERT-2026-03-07-10000  →  ₹59,060  →  ₹41,342 loan
CERT-2026-03-06-10001  →  ₹87,393  →  ₹61,175 loan
CERT-2026-03-05-10002  →  ₹91,792  →  ₹64,254 loan
```

## 🏗️ Project Structure

```
VeriCrop-FinBrige/
├── frontend/          # Next.js frontend (deployed on Amplify)
├── backend/           # Lambda functions (TypeScript/Python)
├── infrastructure/    # AWS CDK infrastructure code
├── ml-training/       # SageMaker model training
├── scripts/           # Setup and demo data scripts
└── docs/              # Additional documentation
```

## 🔧 Development Setup

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
npm install
npm run build
```

### Infrastructure Deployment
```bash
cd infrastructure
npm install
cdk deploy --all
```

## 📖 Documentation

- **[README.md](README.md)** - Project overview
- **[CODE_TOUR.md](CODE_TOUR.md)** - Code walkthrough
- **[TECHNICAL_ROADMAP.md](TECHNICAL_ROADMAP.md)** - Implementation plan
- **[Requirements](.kiro/specs/vericrop-finbridge/requirements.md)** - Detailed requirements
- **[Design](.kiro/specs/vericrop-finbridge/design.md)** - System architecture

## 🆘 Troubleshooting

### DynamoDB Table Not Found
```bash
cd scripts
node create-dynamodb-table.js
```

### AWS Credentials Not Configured
```bash
aws configure
# Enter your AWS Access Key ID and Secret Access Key
# Region: ap-south-1
```

### Demo Data Not Seeded
```bash
cd scripts
node seed-demo-data-to-dynamodb.js
```

---

**Live Demo:** https://main.d564kvq3much7.amplifyapp.com
python --version
# Should show: Python 3.11.x or 3.12.x

pip --version
# Should show: pip 23.x.x
```

**What you learned:** Python is one of the most popular languages for AI/ML and serverless computing. Pip is Python's package manager.

---

## Step 3: Install AWS CLI (Required for AWS Access)

**What is AWS CLI?**
- Command-line tool to interact with AWS services
- Lets you deploy resources from your terminal

**Installation:**
1. Go to: https://aws.amazon.com/cli/
2. Download AWS CLI for Windows (MSI installer)
3. Run installer
4. Keep all default options
5. Restart your terminal

**Verify Installation:**
```bash
aws --version
# Should show: aws-cli/2.x.x
```

**What you learned:** AWS CLI is how developers interact with AWS programmatically instead of clicking through the console.

---

## Step 4: Configure AWS Credentials

**What are AWS Credentials?**
- Your access keys that prove you're authorized to use AWS
- Like a username/password for AWS API access

**Get Your Credentials:**
1. Go to AWS Console: https://console.aws.amazon.com/
2. Click your name (top right) → Security credentials
3. Scroll to "Access keys"
4. Click "Create access key"
5. Choose "Command Line Interface (CLI)"
6. Check "I understand" → Next
7. Copy both:
   - Access Key ID (starts with AKIA...)
   - Secret Access Key (long random string)

**Configure AWS CLI:**
```bash
aws configure
```

**Enter when prompted:**
```
AWS Access Key ID: [paste your access key]
AWS Secret Access Key: [paste your secret key]
Default region name: ap-south-1
Default output format: json
```

**Verify Configuration:**
```bash
aws sts get-caller-identity
# Should show your AWS account info
```

**What you learned:** AWS uses access keys for programmatic access. Never share these keys or commit them to GitHub!

---

## Step 5: Install AWS CDK (Infrastructure as Code)

**What is AWS CDK?**
- Tool that lets you define AWS infrastructure using code (TypeScript)
- Instead of clicking in console, you write code that creates resources
- Can deploy/destroy entire infrastructure with one command

**Installation:**
```bash
npm install -g aws-cdk
```

**Verify Installation:**
```bash
cdk --version
# Should show: 2.x.x
```

**Bootstrap CDK (One-Time Setup):**
```bash
cdk bootstrap aws://ACCOUNT-ID/ap-south-1
```
Replace ACCOUNT-ID with your AWS account number (from `aws sts get-caller-identity`)

**What you learned:** CDK is Infrastructure as Code (IaC). It's like having a blueprint for your AWS resources that you can version control and reuse.

---

## Step 6: Install Git (Version Control)

**What is Git?**
- Version control system that tracks changes to your code
- Required for GitHub integration

**Installation:**
1. Go to: https://git-scm.com/download/win
2. Download and run installer
3. Keep all default options
4. Restart terminal

**Verify Installation:**
```bash
git --version
# Should show: git version 2.x.x
```

**Configure Git:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**What you learned:** Git tracks every change you make to code. It's essential for collaboration and backup.

---

## Step 7: Verify Everything is Ready

Run this checklist:

```bash
# Check Node.js
node --version

# Check Python
python --version

# Check AWS CLI
aws --version

# Check AWS credentials
aws sts get-caller-identity

# Check CDK
cdk --version

# Check Git
git --version
```

**All commands should work without errors!**

---

## Troubleshooting

### "Command not found" errors
- **Solution:** Restart your terminal after installation
- **Why:** Terminal needs to reload PATH environment variable

### AWS credentials not working
- **Solution:** Run `aws configure` again
- **Check:** Make sure you copied the full access key and secret key

### CDK bootstrap fails
- **Solution:** Make sure AWS credentials are configured
- **Check:** Run `aws sts get-caller-identity` first

---

## What's Next?

Once all tools are installed, we'll:
1. Create CDK project structure
2. Define infrastructure (DynamoDB, S3, Lambda, etc.)
3. Deploy to AWS with one command
4. Test the deployed resources

**Estimated time:** 30 minutes for installation, then we start building!

---

## Summary of Tools

| Tool | Purpose | Why We Need It |
|------|---------|----------------|
| Node.js | JavaScript runtime | Required for AWS CDK |
| Python | Programming language | Lambda function code |
| AWS CLI | AWS command-line tool | Deploy to AWS |
| AWS CDK | Infrastructure as Code | Define AWS resources in code |
| Git | Version control | Track code changes |

---

**Once you've installed everything, let me know and we'll start Task 1!** 🚀
