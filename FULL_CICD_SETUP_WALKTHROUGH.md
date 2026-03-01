# Full CI/CD Setup - Step-by-Step Walkthrough

**Total Time:** 30 minutes  
**Goal:** Deploy frontend on Amplify + Set up CodePipeline for automated deployments

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] AWS Account access (Account ID: 889168907575)
- [ ] AWS Console login credentials
- [ ] GitHub account with repository
- [ ] All code committed locally
- [ ] Terminal/PowerShell open

---

## Phase 1: Prepare GitHub (5 minutes)

### Step 1.1: Create GitHub Personal Access Token

**Why:** Amplify and CodePipeline need permission to access your GitHub repository

**Instructions:**

1. **Go to GitHub Settings**
   - Open browser: https://github.com
   - Click your profile picture (top right)
   - Click "Settings"

2. **Navigate to Developer Settings**
   - Scroll down in left sidebar
   - Click "Developer settings" (bottom of sidebar)

3. **Create Personal Access Token**
   - Click "Personal access tokens" → "Tokens (classic)"
   - Click "Generate new token" → "Generate new token (classic)"

4. **Configure Token**
   - **Note:** `VeriCrop-AWS-Deployment`
   - **Expiration:** 90 days (or custom)
   - **Select scopes:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `admin:repo_hook` (Full control of repository hooks)

5. **Generate and Copy Token**
   - Click "Generate token" (bottom of page)
   - **CRITICAL:** Copy the token immediately (starts with `ghp_`)
   - Save it in a text file temporarily - you'll need it multiple times

**Example token format:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 1.2: Push Code to GitHub

**Open PowerShell/Terminal:**

```powershell
# Navigate to project directory
cd "D:\Kiro Hackathon"

# Check current status
git status

# Add all new files
git add .

# Commit with descriptive message
git commit -m "feat: Add frontend, Amplify, and CodePipeline infrastructure

- Created Next.js frontend with Solar Azimuth demo
- Added AWS Amplify hosting stack
- Added AWS CodePipeline CI/CD stack
- Updated README with Live URL section
- Added comprehensive deployment guides

Ready for hackathon submission!"

# Push to GitHub
git push origin main
```

**Verify:**
- Go to your GitHub repository in browser
- Refresh the page
- Verify you see the new `frontend/` folder
- Verify you see updated `README.md`

**✅ Checkpoint:** Code is on GitHub and token is saved

---

## Phase 2: Deploy Frontend to AWS Amplify (10 minutes)

### Step 2.1: Access AWS Amplify Console

1. **Login to AWS Console**
   - Go to: https://console.aws.amazon.com
   - Region: **ap-south-1 (Mumbai)**
   - Verify region in top-right corner

2. **Navigate to Amplify**
   - Search bar (top): Type "Amplify"
   - Click "AWS Amplify"

3. **Start New App**
   - Click "Get started" under "Amplify Hosting"
   - Or click "New app" → "Host web app"

### Step 2.2: Connect GitHub Repository

1. **Select Source**
   - Choose "GitHub"
   - Click "Continue"

2. **Authorize AWS Amplify**
   - Click "Authorize AWS Amplify"
   - GitHub will open in new tab
   - Click "Authorize aws-amplify-console"
   - You may need to enter GitHub password

3. **Select Repository**
   - **Repository:** Select your VeriCrop repository
   - **Branch:** `main`
   - Click "Next"

### Step 2.3: Configure Build Settings

1. **App Name**
   - **App name:** `vericrop-finbridge`

2. **Build Settings**
   - Amplify will auto-detect Next.js
   - **IMPORTANT:** Replace the auto-detected build spec with this:

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

**How to replace:**
- Scroll down to "Build settings"
- Click "Edit" button
- Delete existing YAML
- Paste the YAML above
- Click "Save"

3. **Advanced Settings (Expand)**
   - Click "Advanced settings" to expand
   - **Monorepo app root:** `frontend`
   - Leave other settings as default

4. **Review and Continue**
   - Click "Next"

### Step 2.4: Review and Deploy

1. **Review All Settings**
   - App name: `vericrop-finbridge`
   - Repository: Your repo
   - Branch: `main`
   - Build settings: Custom YAML

2. **Deploy**
   - Click "Save and deploy"
   - Amplify will start building

3. **Monitor Build Progress**
   - You'll see 4 stages:
     1. ⏳ Provision (1 min)
     2. ⏳ Build (3-5 min)
     3. ⏳ Deploy (1 min)
     4. ⏳ Verify (30 sec)

**Wait for all stages to complete (green checkmarks)**

### Step 2.5: Get Your Live URL

1. **After Deployment Completes**
   - You'll see a green "Deployed" status
   - Look for the URL at the top

2. **Copy the URL**
   - Format: `https://main.d1234567890abc.amplifyapp.com`
   - Click the URL to test it
   - **Save this URL** - you'll add it to README

3. **Test the Live Site**
   - Click the URL
   - Verify homepage loads
   - Try the Solar Azimuth calculator
   - Change coordinates and timestamp
   - Verify calculation works

**✅ Checkpoint:** Frontend is live on Amplify

---

## Phase 3: Set Up AWS CodePipeline (10 minutes)

### Step 3.1: Access CodePipeline Console

1. **Navigate to CodePipeline**
   - AWS Console search bar: Type "CodePipeline"
   - Click "CodePipeline"

2. **Create Pipeline**
   - Click "Create pipeline" (orange button)

### Step 3.2: Pipeline Settings

1. **Pipeline Name**
   - **Pipeline name:** `vericrop-finbridge-pipeline`

2. **Service Role**
   - Select "New service role"
   - **Role name:** (auto-generated) `AWSCodePipelineServiceRole-ap-south-1-vericrop-finbridge-pipeline`

3. **Advanced Settings (Expand)**
   - **Artifact store:** Default location
   - **Encryption key:** Default AWS Managed Key

4. **Continue**
   - Click "Next"

### Step 3.3: Add Source Stage

1. **Source Provider**
   - Select "GitHub (Version 2)"

2. **Connection**
   - Click "Connect to GitHub"
   
3. **Create GitHub Connection**
   - **Connection name:** `vericrop-github-connection`
   - Click "Connect to GitHub"
   - New window opens

4. **Authorize in GitHub**
   - Click "Authorize AWS Connector for GitHub"
   - Enter GitHub password if prompted
   - Click "Install a new app"
   - Select your GitHub account
   - Select "Only select repositories"
   - Choose your VeriCrop repository
   - Click "Install"
   - Window closes automatically

5. **Back in AWS Console**
   - Click "Connect" button
   - Connection status should show "Available"

6. **Repository Settings**
   - **Repository name:** Select your repository from dropdown
   - **Branch name:** `main`
   - **Output artifact format:** CodePipeline default

7. **Continue**
   - Click "Next"

### Step 3.4: Add Build Stage

1. **Build Provider**
   - Select "AWS CodeBuild"

2. **Create Build Project**
   - Click "Create project" button
   - New window opens

3. **Project Configuration**
   - **Project name:** `vericrop-backend-build`
   - **Description:** `Build and deploy VeriCrop backend Lambda functions`

4. **Environment**
   - **Environment image:** Managed image
   - **Operating system:** Ubuntu
   - **Runtime(s):** Standard
   - **Image:** `aws/codebuild/standard:7.0`
   - **Image version:** Always use the latest
   - **Environment type:** Linux
   - **Privileged:** Unchecked
   - **Service role:** New service role
   - **Role name:** (auto-generated)

5. **Buildspec**
   - Select "Insert build commands"
   - Click "Switch to editor"
   - Paste this YAML:

```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - echo "Installing dependencies..."
      - cd infrastructure
      - npm ci
  pre_build:
    commands:
      - echo "Running CDK synth..."
      - npm run build
      - npx cdk synth
  build:
    commands:
      - echo "Deploying infrastructure..."
      - npx cdk deploy VeriCropFinBridgeStack --require-approval never
artifacts:
  files:
    - '**/*'
```

6. **Logs**
   - **CloudWatch logs:** Checked
   - **Group name:** (auto-generated)
   - **Stream name:** (auto-generated)

7. **Create Build Project**
   - Click "Continue to CodePipeline"
   - Window closes

8. **Back in Pipeline**
   - **Project name:** Should show `vericrop-backend-build`
   - **Build type:** Single build

9. **Continue**
   - Click "Next"

### Step 3.5: Skip Deploy Stage

1. **Deploy Stage**
   - Click "Skip deploy stage"
   - Confirmation dialog appears

2. **Confirm**
   - Click "Skip"
   - We don't need a separate deploy stage (CDK deploys in build stage)

### Step 3.6: Review and Create

1. **Review All Settings**
   - Pipeline name: `vericrop-finbridge-pipeline`
   - Source: GitHub (Version 2)
   - Build: AWS CodeBuild (`vericrop-backend-build`)
   - Deploy: Skipped

2. **Create Pipeline**
   - Click "Create pipeline"
   - Pipeline will be created and start automatically

3. **Monitor First Execution**
   - You'll see the pipeline stages:
     1. ⏳ Source (1 min)
     2. ⏳ Build (5-8 min)
   
   - **Wait for both stages to complete**

### Step 3.7: Fix CodeBuild Permissions (If Build Fails)

**If the build stage fails with permission errors:**

1. **Go to IAM Console**
   - AWS Console → IAM → Roles

2. **Find CodeBuild Role**
   - Search for: `codebuild-vericrop-backend-build-service-role`
   - Click on the role

3. **Add Permissions**
   - Click "Add permissions" → "Attach policies"
   - Search and attach these policies:
     - `AWSCloudFormationFullAccess`
     - `AWSLambda_FullAccess`
     - `IAMFullAccess`
   - Click "Add permissions"

4. **Retry Build**
   - Go back to CodePipeline
   - Click "Release change" to retry

**✅ Checkpoint:** CodePipeline is set up and running

---

## Phase 4: Update README with Live URL (3 minutes)

### Step 4.1: Update README Locally

1. **Open README.md in your editor**

2. **Find the Live URL section** (around line 50):
```markdown
**Live URL:** [https://main.YOUR_AMPLIFY_ID.amplifyapp.com](https://main.YOUR_AMPLIFY_ID.amplifyapp.com)  
*(Team leader: Update this after Amplify deployment)*
```

3. **Replace with your actual Amplify URL:**
```markdown
**Live URL:** [https://main.d1234567890abc.amplifyapp.com](https://main.d1234567890abc.amplifyapp.com)
```

4. **Find the GitHub Repository section:**
```markdown
**GitHub Repository:** [https://github.com/YOUR_USERNAME/YOUR_REPO](https://github.com/YOUR_USERNAME/YOUR_REPO)  
*(Team leader: Update with your GitHub repo URL)*
```

5. **Replace with your actual GitHub URL:**
```markdown
**GitHub Repository:** [https://github.com/muzammil/vericrop-finbridge](https://github.com/muzammil/vericrop-finbridge)
```

6. **Find the Pipeline URL section** (around line 120):
```markdown
**Pipeline URL:** [CodePipeline Console](https://ap-south-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/vericrop-finbridge-pipeline/view)  
*(Team leader: Update after pipeline deployment)*
```

7. **Update to:**
```markdown
**Pipeline URL:** [CodePipeline Console](https://ap-south-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/vericrop-finbridge-pipeline/view)
```

### Step 4.2: Commit and Push

```powershell
# Add README
git add README.md

# Commit
git commit -m "docs: Update README with live Amplify URL and GitHub repo link"

# Push
git push origin main
```

### Step 4.3: Verify CI/CD Triggers

1. **Watch Amplify**
   - Go to Amplify Console
   - You should see a new build triggered automatically
   - Wait for it to complete (2-3 minutes)

2. **Watch CodePipeline**
   - Go to CodePipeline Console
   - You should see a new execution triggered
   - Wait for it to complete (5-8 minutes)

**✅ Checkpoint:** CI/CD is working automatically!

---

## Phase 5: Final Testing (2 minutes)

### Step 5.1: Test Live Site

1. **Visit Your Amplify URL**
   - Open browser
   - Go to your Amplify URL
   - Verify homepage loads with updated content

2. **Test Calculator**
   - Try different GPS coordinates:
     - Mumbai: 19.0760, 72.8777
     - Delhi: 28.6139, 77.2090
     - Bangalore: 12.9716, 77.5946
   - Change timestamp
   - Verify calculations work

3. **Test Responsiveness**
   - Resize browser window
   - Test on mobile (if available)
   - Verify all sections display correctly

### Step 5.2: Verify CI/CD

1. **Make a Small Test Change**
   - Edit `frontend/app/page.tsx`
   - Change the tagline or add a comment
   - Commit and push

2. **Watch Automatic Deployment**
   - Amplify should trigger automatically
   - CodePipeline should trigger automatically
   - Both should complete successfully

3. **Verify Changes Appear**
   - Refresh your live site
   - Verify changes are visible

**✅ Checkpoint:** Everything is working!

---

## 🎉 Success Checklist

### Deployment Complete

- [x] GitHub Personal Access Token created
- [x] Code pushed to GitHub
- [x] Amplify app deployed
- [x] Live URL obtained
- [x] CodePipeline created
- [x] First pipeline execution successful
- [x] README updated with Live URL
- [x] CI/CD tested and working

### URLs to Save

**Live URL:** `https://main.d1234567890abc.amplifyapp.com`  
**GitHub Repo:** `https://github.com/YOUR_USERNAME/YOUR_REPO`  
**CodePipeline:** `https://ap-south-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/vericrop-finbridge-pipeline/view`  
**Amplify Console:** `https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/`

### Hackathon Submission Ready

- [x] ✅ Live URL (working)
- [x] ✅ GitHub Repository (public/accessible)
- [x] ✅ CI/CD Pipeline (automated)
- [x] ✅ README (complete)
- [x] ✅ Documentation (comprehensive)

---

## 🔧 Troubleshooting

### Amplify Build Fails

**Error:** `npm ci` fails

**Solution:**
1. Check `frontend/package.json` exists
2. Check `frontend/package-lock.json` exists
3. Verify build spec points to `frontend/` directory

**Error:** Build succeeds but site shows 404

**Solution:**
1. Check `next.config.js` has `output: 'export'`
2. Verify artifacts directory is `frontend/out`
3. Check Amplify build logs

### CodePipeline Build Fails

**Error:** Permission denied

**Solution:**
1. Go to IAM → Roles
2. Find CodeBuild service role
3. Attach necessary policies (CloudFormation, Lambda, IAM)
4. Retry pipeline

**Error:** CDK deploy fails

**Solution:**
1. Check `infrastructure/package.json` exists
2. Verify CDK is installed
3. Check CloudFormation console for detailed errors

### GitHub Connection Fails

**Error:** Cannot connect to GitHub

**Solution:**
1. Verify GitHub token has correct permissions
2. Regenerate token if expired
3. Try disconnecting and reconnecting

---

## 📊 What You've Accomplished

### Infrastructure Deployed

- ✅ AWS Amplify (frontend hosting)
- ✅ AWS CodePipeline (CI/CD orchestration)
- ✅ AWS CodeBuild (build automation)
- ✅ GitHub integration (automatic triggers)

### Automation Achieved

- ✅ Push to GitHub → Automatic deployment
- ✅ Parallel frontend and backend builds
- ✅ Zero-downtime deployments
- ✅ Build logs and monitoring

### Cost

- **Amplify:** $0/month (free tier)
- **CodePipeline:** $0/month (first pipeline free)
- **CodeBuild:** $0-2/month (free tier)
- **Total:** $0-2/month

---

## 🚀 Next Steps

### Immediate

1. ✅ Take screenshots of live site
2. ✅ Record demo video (5 minutes)
3. ✅ Submit to hackathon

### Next Session

1. Continue with Task 2.3 (Shadow Comparator Lambda)
2. Connect frontend to real Lambda via API Gateway
3. Test end-to-end fraud detection

---

**Congratulations! Your full CI/CD pipeline is live! 🎉**

Every time you push to GitHub, your changes will automatically deploy to production!

