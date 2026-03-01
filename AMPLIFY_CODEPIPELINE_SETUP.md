# VeriCrop FinBridge - Amplify & CodePipeline Setup Guide

## Overview

This guide explains how to deploy the VeriCrop FinBridge frontend on AWS Amplify and set up CI/CD with AWS CodePipeline for automated deployments.

---

## Prerequisites

### 1. GitHub Repository Setup

**Required:**
- GitHub repository must be public or you must have access
- Repository must contain all VeriCrop code
- Main branch should be named `main`

**Steps:**
1. Ensure all code is committed to GitHub
2. Note your GitHub username/organization name
3. Note your repository name

### 2. GitHub Personal Access Token

**Required for:** Amplify and CodePipeline to access your GitHub repo

**Steps to create:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: `VeriCrop-Amplify-Pipeline`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `admin:repo_hook` (Full control of repository hooks)
5. Click "Generate token"
6. **IMPORTANT:** Copy the token immediately (you won't see it again!)
7. Save it securely - you'll need it for deployment

---

## Deployment Options

### Option A: Manual Deployment (Recommended for Hackathon)

**Pros:** Quick, no code changes needed, works immediately  
**Cons:** Manual setup in AWS Console

#### Step 1: Deploy Frontend to Amplify

**Using AWS Console:**

1. **Go to AWS Amplify Console**
   ```
   AWS Console → Amplify → Get Started → Host web app
   ```

2. **Connect GitHub Repository**
   - Select "GitHub" as source
   - Click "Continue"
   - Authorize AWS Amplify to access your GitHub
   - Select your repository: `YOUR_REPO_NAME`
   - Select branch: `main`
   - Click "Next"

3. **Configure Build Settings**
   - App name: `vericrop-finbridge`
   - Environment: `production`
   - Build settings: Use the following YAML

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/out
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```

4. **Advanced Settings (Optional)**
   - Monorepo app root: `frontend`
   - Click "Next"

5. **Review and Deploy**
   - Review all settings
   - Click "Save and deploy"
   - Wait 5-10 minutes for deployment

6. **Get Your Live URL**
   - After deployment completes, you'll see a URL like:
   - `https://main.d1234567890abc.amplifyapp.com`
   - **Copy this URL** - you'll add it to README.md

#### Step 2: Set Up CodePipeline (Optional but Recommended)

**Using AWS Console:**

1. **Go to CodePipeline Console**
   ```
   AWS Console → CodePipeline → Create pipeline
   ```

2. **Pipeline Settings**
   - Pipeline name: `vericrop-finbridge-pipeline`
   - Service role: New service role
   - Click "Next"

3. **Add Source Stage**
   - Source provider: GitHub (Version 2)
   - Click "Connect to GitHub"
   - Connection name: `vericrop-github`
   - Authorize AWS Connector for GitHub
   - Repository name: Select your repo
   - Branch name: `main`
   - Output artifact format: CodePipeline default
   - Click "Next"

4. **Add Build Stage**
   - Build provider: AWS CodeBuild
   - Click "Create project"
   
   **CodeBuild Project Settings:**
   - Project name: `vericrop-backend-build`
   - Environment image: Managed image
   - Operating system: Ubuntu
   - Runtime: Standard
   - Image: aws/codebuild/standard:7.0
   - Service role: New service role
   - Buildspec: Insert build commands

   ```yaml
   version: 0.2
   phases:
     install:
       runtime-versions:
         nodejs: 18
       commands:
         - cd infrastructure
         - npm ci
     pre_build:
       commands:
         - npm run build
         - npx cdk synth
     build:
       commands:
         - npx cdk deploy VeriCropFinBridgeStack --require-approval never
   ```

   - Click "Continue to CodePipeline"
   - Click "Next"

5. **Skip Deploy Stage**
   - Click "Skip deploy stage"
   - Click "Skip"

6. **Review and Create**
   - Review all settings
   - Click "Create pipeline"
   - Pipeline will start automatically

7. **Get Pipeline URL**
   - Copy the pipeline URL from the console
   - Format: `https://ap-south-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/vericrop-finbridge-pipeline/view`

---

### Option B: CDK Deployment (Advanced)

**Pros:** Infrastructure as Code, repeatable  
**Cons:** Requires code changes and GitHub token in code

#### Step 1: Update CDK App

Edit `infrastructure/bin/infrastructure.ts`:

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VeriCropInfrastructureStack } from '../lib/vericrop-infrastructure-stack';
import { AmplifyStack } from '../lib/amplify-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

// Get GitHub configuration from context or environment
const githubOwner = app.node.tryGetContext('githubOwner') || 'YOUR_GITHUB_USERNAME';
const githubRepo = app.node.tryGetContext('githubRepo') || 'YOUR_REPO_NAME';
const githubToken = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN';

// Deploy main infrastructure
new VeriCropInfrastructureStack(app, 'VeriCropFinBridgeStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1',
  },
});

// Deploy Amplify frontend
new AmplifyStack(app, 'VeriCropAmplifyStack', {
  githubOwner,
  githubRepo,
  githubToken,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1',
  },
});

// Deploy CodePipeline
new PipelineStack(app, 'VeriCropPipelineStack', {
  githubOwner,
  githubRepo,
  githubToken,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1',
  },
});
```

#### Step 2: Set Environment Variables

**On Windows (PowerShell):**
```powershell
$env:GITHUB_TOKEN="your_github_token_here"
```

**On Linux/Mac:**
```bash
export GITHUB_TOKEN="your_github_token_here"
```

#### Step 3: Deploy Stacks

```bash
cd infrastructure

# Deploy Amplify stack
npx cdk deploy VeriCropAmplifyStack

# Deploy Pipeline stack
npx cdk deploy VeriCropPipelineStack
```

#### Step 4: Get Outputs

After deployment, CDK will output:
- Amplify App URL
- CodePipeline Console URL

---

## Post-Deployment Steps

### 1. Update README.md

Add the Live URL to your README:

```markdown
## 🚀 Live Demo

**Live URL:** https://main.d1234567890abc.amplifyapp.com

Try the Solar Azimuth fraud detection calculator in real-time!
```

### 2. Test the Deployment

1. **Visit the Live URL**
   - Should see the VeriCrop FinBridge homepage
   - Try the Solar Azimuth calculator
   - Verify all sections load correctly

2. **Test CI/CD (if set up)**
   - Make a small change to `frontend/app/page.tsx`
   - Commit and push to GitHub
   - Watch Amplify automatically rebuild
   - Or watch CodePipeline trigger

### 3. Update Hackathon Submission

Add these to your hackathon submission:
- ✅ Live URL: `https://main.d1234567890abc.amplifyapp.com`
- ✅ GitHub Repo: `https://github.com/YOUR_USERNAME/YOUR_REPO`
- ✅ CI/CD: CodePipeline URL (if set up)

---

## Troubleshooting

### Amplify Build Fails

**Error:** `npm ci` fails in frontend folder

**Solution:**
1. Ensure `frontend/package.json` exists
2. Ensure `frontend/package-lock.json` exists
3. Check build logs in Amplify Console

**Error:** Build succeeds but site shows 404

**Solution:**
1. Check that `next.config.js` has `output: 'export'`
2. Verify artifacts are in `frontend/out` folder
3. Check Amplify build settings point to correct directory

### CodePipeline Fails

**Error:** GitHub connection fails

**Solution:**
1. Verify GitHub token has correct permissions
2. Regenerate token if expired
3. Update connection in CodePipeline settings

**Error:** CDK deploy fails in CodeBuild

**Solution:**
1. Check CodeBuild has necessary IAM permissions
2. Verify `infrastructure/package.json` exists
3. Check build logs in CodeBuild console

### Frontend Shows "Demo Mode"

**Expected Behavior:**
- Frontend will show "Demo Mode" until you connect it to API Gateway
- This is normal for initial deployment
- Calculator still works with sample data

**To Connect to Real Lambda:**
1. Create API Gateway endpoint for Solar Azimuth Lambda
2. Update `frontend/app/page.tsx` with real API URL
3. Redeploy frontend

---

## Cost Estimate

### Amplify Hosting
- **Build minutes:** 1000 minutes/month free tier
- **Hosting:** 15 GB storage + 15 GB served free tier
- **Estimated cost:** $0/month (within free tier)

### CodePipeline
- **First pipeline:** Free for 1 pipeline/month
- **Additional pipelines:** $1/month each
- **Estimated cost:** $0/month (first pipeline free)

### CodeBuild
- **Build minutes:** 100 minutes/month free tier
- **Compute:** $0.005/minute after free tier
- **Estimated cost:** $0-2/month

**Total Estimated Cost:** $0-2/month

---

## Next Steps

After deployment:

1. ✅ Copy Live URL and add to README
2. ✅ Test the live site
3. ✅ Commit and push changes
4. ✅ Verify CI/CD triggers (if set up)
5. ✅ Update hackathon submission with Live URL
6. ✅ Continue with Task 2.3 (Shadow Comparator Lambda)

---

## Support

**For Amplify Issues:**
- AWS Amplify Console → Your App → Build logs
- Check `frontend/amplify.yml` configuration

**For CodePipeline Issues:**
- CodePipeline Console → Your Pipeline → Execution history
- Check CodeBuild logs for detailed errors

**For CDK Issues:**
- Run `npx cdk synth` to check for errors
- Check CloudFormation console for stack events

---

**Ready to deploy!** Choose Option A (Manual) for quickest setup, or Option B (CDK) for Infrastructure as Code approach.
