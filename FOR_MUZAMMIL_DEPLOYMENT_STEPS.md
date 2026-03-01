# 🚀 Deployment Steps for Muzammil (Team Leader)

**Status**: Code is ready on GitHub - https://github.com/muzammil730/VeriCrop-FinBrige

**Your Role**: Deploy the frontend to AWS Amplify to get the Live URL for hackathon submission

---

## ⏱️ Quick Timeline

- **Step 1**: Deploy Frontend to Amplify (15 minutes) - **DO THIS FIRST**
- **Step 2**: Update README with Live URL (2 minutes)
- **Step 3** (Optional): Set up CI/CD Pipeline (15 minutes)

---

## 📋 Step 1: Deploy Frontend to AWS Amplify (REQUIRED)

### 1.1 Open AWS Amplify Console

1. Log into AWS Console: https://ap-south-1.console.aws.amazon.com/amplify/
2. Region: **ap-south-1 (Mumbai)**
3. Click **"New app"** → **"Host web app"**

### 1.2 Connect GitHub Repository

1. Select **"GitHub"** as source
2. Authorize AWS Amplify to access your GitHub account
3. Select repository: **muzammil730/VeriCrop-FinBrige**
4. Select branch: **master**
5. Click **"Next"**

### 1.3 Configure Build Settings

Amplify will auto-detect the `frontend/amplify.yml` file. Verify these settings:

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

**App root directory**: Leave empty (Amplify will use the root)

Click **"Next"**

### 1.4 Review and Deploy

1. Review all settings
2. Click **"Save and deploy"**
3. Wait 5-10 minutes for deployment to complete

### 1.5 Get Your Live URL

Once deployment succeeds, you'll see:

```
✅ Provision  ✅ Build  ✅ Deploy  ✅ Verify
```

Your Live URL will be displayed at the top:
```
https://master.xxxxxxxxxxxxxx.amplifyapp.com
```

**Copy this URL** - you need it for the hackathon submission!

---

## 📝 Step 2: Update README with Live URL (REQUIRED)

### 2.1 Update README.md

1. Open the repository on GitHub
2. Edit `README.md`
3. Find the "Live Demo" section (around line 15)
4. Replace the placeholder URL with your actual Amplify URL:

```markdown
## 🌐 Live Demo

**Live Application**: https://master.xxxxxxxxxxxxxx.amplifyapp.com
```

5. Commit the change directly to the `master` branch

### 2.2 Verify the Live Site

1. Open your Live URL in a browser
2. Test the Solar Azimuth Calculator:
   - Enter latitude: 28.6139 (Delhi)
   - Enter longitude: 77.2090
   - Select a date and time
   - Click "Calculate Shadow Direction"
   - Verify you see the azimuth angle and shadow direction

---

## 🔄 Step 3: Set Up CI/CD Pipeline (OPTIONAL)

**Note**: This is optional but recommended for automatic deployments on every git push.

### Option A: Use Amplify's Built-in CI/CD (Easiest)

Amplify automatically sets up CI/CD when you connect GitHub. Every push to `master` will trigger a new deployment.

**You're done!** No additional setup needed.

### Option B: Use AWS CodePipeline (Advanced)

If you want more control, you can set up CodePipeline:

1. Follow the guide in `AMPLIFY_CODEPIPELINE_SETUP.md`
2. This requires deploying the CDK stack in `infrastructure/lib/pipeline-stack.ts`
3. Estimated time: 15 minutes

**For the hackathon, Option A (Amplify's built-in CI/CD) is sufficient.**

---

## ✅ Hackathon Submission Checklist

Before submitting to the hackathon, verify:

- [ ] Live URL is working and accessible
- [ ] README.md has the correct Live URL
- [ ] GitHub repository is public
- [ ] Solar Azimuth Calculator demo works on the live site
- [ ] All documentation is complete (README, architecture diagrams, etc.)

---

## 🆘 Troubleshooting

### Build Fails with "npm ci" Error

**Solution**: Amplify might not find the `frontend` directory. Update build settings:

1. Go to Amplify Console → App Settings → Build settings
2. Change **App root directory** to: `frontend`
3. Update `amplify.yml` to remove `cd frontend` from preBuild:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
```

4. Redeploy

### Build Succeeds but Site Shows 404

**Solution**: Verify the artifacts path:

1. Check that `frontend/next.config.js` has `output: 'export'`
2. Verify `artifacts.baseDirectory` in `amplify.yml` is `frontend/out`
3. Redeploy

### Need Help?

Contact Sarafaraz (your developer) or check:
- `FULL_CICD_SETUP_WALKTHROUGH.md` - Complete walkthrough
- `AMPLIFY_CODEPIPELINE_SETUP.md` - Detailed Amplify setup guide
- `QUICK_DEPLOYMENT_GUIDE.md` - Quick reference

---

## 📞 Next Steps After Deployment

1. **Share the Live URL** with Sarafaraz so he can update documentation
2. **Test the live site** thoroughly
3. **Submit to hackathon** with:
   - Live URL
   - GitHub repository link
   - README with technical justification
4. **Continue development** on remaining tasks (Task 2.3, 3.1, etc.)

---

**Good luck with the hackathon! 🎉**
