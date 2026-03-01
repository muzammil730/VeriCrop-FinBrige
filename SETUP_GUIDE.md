# VeriCrop FinBridge - Development Setup Guide

## Prerequisites Installation (30 minutes)

You need to install these tools before we can start development.

---

## Step 1: Install Node.js (Required for AWS CDK)

**What is Node.js?**
- JavaScript runtime that lets you run JavaScript code outside a browser
- Required for AWS CDK (Infrastructure as Code tool)

**Installation:**
1. Go to: https://nodejs.org/
2. Download "LTS" version (Long Term Support) - currently v20.x
3. Run installer
4. Keep all default options
5. Click "Install"
6. Restart your terminal

**Verify Installation:**
```bash
node --version
# Should show: v20.x.x

npm --version
# Should show: 10.x.x
```

**What you learned:** Node.js is the foundation for modern JavaScript development. NPM (Node Package Manager) comes with it and manages code libraries.

---

## Step 2: Install Python (Required for Lambda Functions)

**What is Python?**
- Programming language we'll use for Lambda functions
- Easy to read and write, perfect for serverless functions

**Installation:**
1. Go to: https://www.python.org/downloads/
2. Download Python 3.11 or 3.12
3. **IMPORTANT:** Check "Add Python to PATH" during installation
4. Run installer
5. Click "Install Now"

**Verify Installation:**
```bash
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
