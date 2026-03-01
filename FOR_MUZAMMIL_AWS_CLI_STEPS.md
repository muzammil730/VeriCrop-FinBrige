# 🎯 FOR MUZAMMIL: Complete Step-by-Step AWS CLI Guide

**IMPORTANT:** You need to run 2 AWS CLI commands on YOUR computer (the one with AWS access)

**Time Required:** 10-15 minutes total  
**Difficulty:** Easy (just copy-paste commands)

---

## 📍 WHERE TO RUN THE COMMANDS

**Run these commands on YOUR computer** (Muzammil's computer) in:
- **Windows:** Command Prompt (CMD) or PowerShell
- **Mac/Linux:** Terminal

**NOT in:**
- ❌ AWS Console (browser)
- ❌ Amplify Console
- ❌ Sarafaraz's computer
- ❌ Any online terminal

---

## 🔧 PART 1: Check if AWS CLI is Installed

### Step 1: Open Your Terminal/Command Prompt

**On Windows:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. A black window will open (Command Prompt)

**On Mac:**
1. Press `Command + Space`
2. Type `terminal` and press Enter

**On Linux:**
1. Press `Ctrl + Alt + T`

### Step 2: Check if AWS CLI is Installed

In the terminal/command prompt, type this command and press Enter:

```bash
aws --version
```

**Expected Output (if installed):**
```
aws-cli/2.15.10 Python/3.11.6 Windows/10 exe/AMD64 prompt/off
```
(Version numbers may vary)

**If you see an error like "command not found" or "not recognized":**
- AWS CLI is NOT installed
- Go to PART 2 to install it

**If you see version information:**
- AWS CLI IS installed
- Skip PART 2 and go directly to PART 3

---

## 🔧 PART 2: Install AWS CLI (Only if Not Installed)

### For Windows:

**Step 1:** Download AWS CLI installer
- Go to: https://awscli.amazonaws.com/AWSCLIV2.msi
- The download will start automatically

**Step 2:** Run the installer
- Double-click the downloaded file `AWSCLIV2.msi`
- Click "Next" → "Next" → "Install"
- Click "Finish"

**Step 3:** Close and reopen Command Prompt
- Close the current Command Prompt window
- Open a new Command Prompt (Windows Key + R, type `cmd`, press Enter)

**Step 4:** Verify installation
```bash
aws --version
```

### For Mac:

**Step 1:** Download and install
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

**Step 2:** Verify installation
```bash
aws --version
```

### For Linux:

**Step 1:** Download and install
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Step 2:** Verify installation
```bash
aws --version
```

---

## 🔑 PART 3: Configure AWS CLI with Your Credentials

### Step 1: Check if AWS CLI is Already Configured

In your terminal, run:

```bash
aws sts get-caller-identity
```

**If you see output like this:**
```json
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "889168907575",
    "Arn": "arn:aws:iam::889168907575:user/muzammil"
}
```
✅ **AWS CLI is already configured! Skip to PART 4**

**If you see an error:**
```
Unable to locate credentials
```
❌ **AWS CLI needs to be configured. Continue with Step 2**

### Step 2: Get Your AWS Credentials

You need 3 pieces of information:
1. **AWS Access Key ID** (looks like: AKIAIOSFODNN7EXAMPLE)
2. **AWS Secret Access Key** (looks like: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY)
3. **Default region:** `ap-south-1` (Mumbai)

**Where to find these:**

**Option A: If you have AWS Console access**
1. Go to AWS Console: https://console.aws.amazon.com
2. Click your name (top right) → "Security credentials"
3. Scroll to "Access keys"
4. Click "Create access key"
5. Select "Command Line Interface (CLI)"
6. Check the confirmation box
7. Click "Create access key"
8. **IMPORTANT:** Copy both keys immediately (you can't see the secret key again!)

**Option B: If you already have keys**
- Check your email or secure notes where you saved them
- Or ask your AWS administrator

### Step 3: Configure AWS CLI

In your terminal, run:

```bash
aws configure
```

You'll be prompted for 4 values. Enter them one by one:

```
AWS Access Key ID [None]: PASTE_YOUR_ACCESS_KEY_HERE
AWS Secret Access Key [None]: PASTE_YOUR_SECRET_KEY_HERE
Default region name [None]: ap-south-1
Default output format [None]: json
```

**Example:**
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: ap-south-1
Default output format [None]: json
```

### Step 4: Verify Configuration

Run this command to verify:

```bash
aws sts get-caller-identity
```

**Expected output:**
```json
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "889168907575",
    "Arn": "arn:aws:iam::889168907575:user/muzammil"
}
```

✅ **If you see Account: "889168907575" - Perfect! Continue to PART 4**

❌ **If you see a different account number - STOP! You're using wrong credentials**

---

## 🚀 PART 4: Run the Fix Commands

**NOW you're ready to run the 2 commands that will fix the deployment!**

### Command 1: Set Application Platform to WEB

**Copy this EXACT command and paste it in your terminal:**

```bash
aws amplify update-app --app-id d564vq3much7 --platform WEB --region ap-south-1
```

**Press Enter**

**Expected Output:**
```json
{
    "app": {
        "appId": "d564vq3much7",
        "appArn": "arn:aws:amplify:ap-south-1:889168907575:apps/d564vq3much7",
        "name": "VeriCrop-FinBrige",
        "platform": "WEB",
        "createTime": "2026-03-01T...",
        "updateTime": "2026-03-01T...",
        ...
    }
}
```

✅ **Look for `"platform": "WEB"` in the output - this means it worked!**

### Command 2: Set Branch Framework to Next.js - SSG

**Copy this EXACT command and paste it in your terminal:**

```bash
aws amplify update-branch --app-id d564vq3much7 --branch-name master --framework "Next.js - SSG" --region ap-south-1
```

**Press Enter**

**Expected Output:**
```json
{
    "branch": {
        "branchArn": "arn:aws:amplify:ap-south-1:889168907575:apps/d564vq3much7/branches/master",
        "branchName": "master",
        "framework": "Next.js - SSG",
        "stage": "PRODUCTION",
        "enableAutoBuild": true,
        ...
    }
}
```

✅ **Look for `"framework": "Next.js - SSG"` in the output - this means it worked!**

---

## ✅ PART 5: Verify the Configuration

**Optional but recommended:** Verify both settings were applied correctly.

### Verify App Platform:

```bash
aws amplify get-app --app-id d564vq3much7 --region ap-south-1
```

**Look for:** `"platform": "WEB"`

### Verify Branch Framework:

```bash
aws amplify get-branch --app-id d564vq3much7 --branch-name master --region ap-south-1
```

**Look for:** `"framework": "Next.js - SSG"`

---

## 🔄 PART 6: Trigger a New Deployment

Now that the configuration is fixed, you need to trigger a new deployment.

### Option A: Redeploy from Amplify Console (Recommended)

**Step 1:** Go to AWS Amplify Console
- Open browser: https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1
- Click on "VeriCrop-FinBrige" app

**Step 2:** Find a previous deployment
- You'll see a list of deployments (Deployment-1, Deployment-2, etc.)
- Click on ANY deployment (Deployment-11 is fine)

**Step 3:** Click "Redeploy this version"
- Look for the button "Redeploy this version" (top right)
- Click it
- Confirm by clicking "Redeploy" in the popup

**Step 4:** Watch the deployment
- A new deployment (Deployment-12) will start
- Watch the 4 stages: Provision → Build → Deploy → Verify
- Wait 6-10 minutes for completion

### Option B: Push a New Commit (Alternative)

If you prefer, you can push a small change to GitHub:

```bash
# In your project directory
echo "# Deployment fix applied" >> README.md
git add README.md
git commit -m "trigger: Test deployment after AWS CLI fix"
git push origin master
```

This will automatically trigger a new deployment.

---

## 🎯 PART 7: What to Expect

### During Deployment-12:

**Provision Stage (1 minute):**
```
✅ Provision completed
```

**Build Stage (5-7 minutes):**
```
Line 65: ✓ Compiled successfully
Line 73: ✓ Generating static pages (4/4)
Line 86: ## Build completed successfully
✅ Build completed
```

**Deploy Stage (1-2 minutes):**
```
Deploying static files from 'out/' directory...
✅ Deploy completed successfully  ← THIS WILL WORK NOW!
```

**Verify Stage (30 seconds):**
```
✅ Verify completed
```

### After Success:

**You'll see:**
```
✅ Provision      (Completed)
✅ Build          (Completed)
✅ Deploy         (Completed)  ← FIXED!
✅ Verify         (Completed)

Status: Deployed
Live URL: https://master.d564vq3much7.amplifyapp.com
```

**Copy the Live URL and test it in your browser!**

---

## 🎉 PART 8: After Successful Deployment

### Step 1: Copy the Live URL

From the Amplify Console, copy:
```
https://master.d564vq3much7.amplifyapp.com
```

### Step 2: Test the Site

1. Open the URL in your browser
2. Verify the homepage loads
3. Test the Solar Azimuth Calculator:
   - Enter Latitude: 28.6139
   - Enter Longitude: 77.2090
   - Click "Calculate Shadow Direction"
   - Verify results appear

### Step 3: Share with Sarafaraz

Send this message to Sarafaraz:

```
Hi Sarafaraz,

SUCCESS! The deployment worked after running AWS CLI commands!

Live URL: https://master.d564vq3much7.amplifyapp.com

The issue was that Amplify couldn't auto-detect that our Next.js app 
uses Static Site Generation (SSG). I ran AWS CLI commands to explicitly 
set the framework to "Next.js - SSG" and now it works!

Please verify the Solar Azimuth Calculator works correctly on the live site.

Thanks!
Muzammil
```

---

## ❌ TROUBLESHOOTING

### Problem: "aws: command not found"
**Solution:** AWS CLI is not installed. Go back to PART 2.

### Problem: "Unable to locate credentials"
**Solution:** AWS CLI is not configured. Go back to PART 3.

### Problem: "An error occurred (AccessDeniedException)"
**Solution:** Your AWS user doesn't have Amplify permissions. Contact AWS admin.

### Problem: "An error occurred (NotFoundException)"
**Solution:** Double-check the app-id is correct: `d564vq3much7`

### Problem: Command works but deployment still fails
**Solution:** 
1. Verify the configuration was applied (PART 5)
2. Make sure you triggered a NEW deployment (PART 6)
3. Check the deployment logs for different errors

### Problem: Different account number appears
**Solution:** You're using wrong AWS credentials. Make sure Account is "889168907575"

---

## 📞 QUICK REFERENCE: All Commands in One Place

**For copy-paste convenience:**

```bash
# Check AWS CLI version
aws --version

# Check AWS credentials
aws sts get-caller-identity

# Configure AWS CLI (if needed)
aws configure

# Command 1: Set platform
aws amplify update-app --app-id d564vq3much7 --platform WEB --region ap-south-1

# Command 2: Set framework
aws amplify update-branch --app-id d564vq3much7 --branch-name master --framework "Next.js - SSG" --region ap-south-1

# Verify app platform
aws amplify get-app --app-id d564vq3much7 --region ap-south-1

# Verify branch framework
aws amplify get-branch --app-id d564vq3much7 --branch-name master --region ap-south-1
```

---

## 📊 Summary

**What you did:**
1. ✅ Installed AWS CLI (if needed)
2. ✅ Configured AWS credentials
3. ✅ Ran 2 commands to set platform and framework
4. ✅ Triggered a new deployment
5. ✅ Got a working Live URL!

**Why it works:**
- AWS Amplify couldn't auto-detect that our app is SSG (Static Site Generation)
- The AWS CLI commands explicitly told Amplify: "This is Next.js SSG, not SSR"
- Now Amplify knows to look for static files in `out/` directory
- Deploy stage succeeds because it's not looking for SSR files anymore

**Time taken:**
- Setup: 5-10 minutes
- Deployment: 6-10 minutes
- Total: 11-20 minutes

---

## 🎯 FINAL CHECKLIST

Before you start:
- [ ] I have access to my computer's terminal/command prompt
- [ ] I have AWS credentials (Access Key ID and Secret Access Key)
- [ ] I know my AWS account number is 889168907575

After running commands:
- [ ] Command 1 completed successfully (saw "platform": "WEB")
- [ ] Command 2 completed successfully (saw "framework": "Next.js - SSG")
- [ ] Triggered a new deployment in Amplify Console
- [ ] Deployment-12 completed with all 4 stages successful
- [ ] Copied the Live URL
- [ ] Tested the site in browser
- [ ] Shared URL with Sarafaraz

---

**YOU'VE GOT THIS! 🚀**

**Just follow the steps one by one, and you'll have a working Live URL in 15-20 minutes!**

**If you get stuck at any step, share the error message and I'll help you fix it!**
