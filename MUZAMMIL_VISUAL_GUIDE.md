# 📸 Visual Guide for Muzammil - AWS Amplify Deployment

**What You'll See:** Step-by-step screenshots guide  
**Time Required:** 15 minutes  
**Goal:** Get Live URL for hackathon submission

---

## 🎯 Quick Overview

You'll go through 4 screens in AWS Amplify Console:

1. **Screen 1:** Select GitHub as source
2. **Screen 2:** Choose repository and branch
3. **Screen 3:** Configure build settings ⚠️ MOST IMPORTANT
4. **Screen 4:** Review and deploy

---

## 📱 Screen 1: Select Source (2 minutes)

### What You'll See:

```
┌─────────────────────────────────────────────────┐
│  AWS Amplify                                    │
│                                                 │
│  Get started with Amplify Hosting              │
│                                                 │
│  From fullstack to static                      │
│                                                 │
│  [GitHub]  [GitLab]  [Bitbucket]  [AWS]       │
│                                                 │
│                    [Continue]                   │
└─────────────────────────────────────────────────┘
```

### What to Do:

1. ✅ Click the **[GitHub]** button
2. ✅ Click **[Continue]**

### What Happens Next:

- A popup will ask you to authorize AWS Amplify
- Click **"Authorize aws-amplify-console"**
- Enter your GitHub password if prompted
- The popup will close automatically

---

## 📱 Screen 2: Add Repository Branch (3 minutes)

### What You'll See:

```
┌─────────────────────────────────────────────────┐
│  Add repository branch                          │
│                                                 │
│  Recently updated repositories                  │
│  ┌─────────────────────────────────────────┐  │
│  │ Select a repository                     ▼│  │
│  │ muzammil730/VeriCrop-FinBrige            │  │
│  │ muzammil730/other-repo                   │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Branch                                         │
│  ┌─────────────────────────────────────────┐  │
│  │ Select a branch                         ▼│  │
│  │ master                                    │  │
│  │ main                                      │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Monorepo? (Optional)                          │
│  ┌─────────────────────────────────────────┐  │
│  │ Enter monorepo root directory            │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│              [Cancel]  [Next]                   │
└─────────────────────────────────────────────────┘
```

### What to Do:

1. ✅ **Repository dropdown:** Select **muzammil730/VeriCrop-FinBrige**
2. ✅ **Branch dropdown:** Select **master**
3. ⚠️ **CRITICAL:** In the "Monorepo root directory" field, type: **frontend**
4. ✅ Click **[Next]**

### Why This Matters:

The "Monorepo root directory" tells Amplify where your Next.js app is located. Without this, the build will fail!

---

## 📱 Screen 3: Configure Build Settings (5 minutes)

### What You'll See:

```
┌─────────────────────────────────────────────────┐
│  Configure build settings                       │
│                                                 │
│  App name                                       │
│  ┌─────────────────────────────────────────┐  │
│  │ vericrop-finbridge                       │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Build and test settings                        │
│  ┌─────────────────────────────────────────┐  │
│  │ version: 1                               │  │
│  │ frontend:                                │  │
│  │   phases:                                │  │
│  │     preBuild:                            │  │
│  │       commands:                          │  │
│  │         - npm ci                         │  │
│  │     build:                               │  │
│  │       commands:                          │  │
│  │         - npm run build                  │  │
│  │   artifacts:                             │  │
│  │     baseDirectory: out                   │  │
│  │     files:                               │  │
│  │       - '**/*'                           │  │
│  │   cache:                                 │  │
│  │     paths:                               │  │
│  │       - node_modules/**/*                │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Advanced settings (Optional)                   │
│  [Expand ▼]                                    │
│                                                 │
│              [Cancel]  [Next]                   │
└─────────────────────────────────────────────────┘
```

### What to Do:

1. ✅ **App name:** Should show `vericrop-finbridge` (auto-filled)
2. ✅ **Build settings:** Should show the YAML above (auto-detected from `amplify.yml`)
3. ✅ **Verify the YAML is correct:**
   - Check `baseDirectory: out` (NOT `frontend/out`)
   - Check `npm ci` and `npm run build` commands
4. ✅ If YAML is different, click **[Edit]** and replace with the correct YAML
5. ✅ Click **[Next]**

### Common Issues:

**If you see `baseDirectory: frontend/out`:**
- Click **[Edit]**
- Change to `baseDirectory: out`
- Click **[Save]**

**If you see `cd frontend` in preBuild:**
- This is okay if you didn't set "Monorepo root directory"
- But it's better to go back and set it to `frontend`

---

## 📱 Screen 4: Review and Deploy (5 minutes)

### What You'll See:

```
┌─────────────────────────────────────────────────┐
│  Review                                         │
│                                                 │
│  App name: vericrop-finbridge                   │
│  Repository: muzammil730/VeriCrop-FinBrige      │
│  Branch: master                                 │
│  Monorepo root: frontend                        │
│                                                 │
│  Build settings:                                │
│  ✓ Automatically detected from amplify.yml     │
│                                                 │
│  Environment variables: None                    │
│                                                 │
│              [Cancel]  [Save and deploy]        │
└─────────────────────────────────────────────────┘
```

### What to Do:

1. ✅ **Review all settings:**
   - App name: `vericrop-finbridge`
   - Repository: `muzammil730/VeriCrop-FinBrige`
   - Branch: `master`
   - Monorepo root: `frontend` ⚠️ VERIFY THIS
2. ✅ Click **[Save and deploy]**

### What Happens Next:

Amplify will start building your app. You'll see a progress screen.

---

## 📱 Build Progress Screen (5-8 minutes)

### What You'll See:

```
┌─────────────────────────────────────────────────┐
│  vericrop-finbridge                             │
│                                                 │
│  https://master.d1234567890abc.amplifyapp.com  │
│                                                 │
│  Branch: master                                 │
│                                                 │
│  ✅ Provision      (1 min)                     │
│  ⏳ Build          (3-5 min)  [In Progress]    │
│  ⏹️ Deploy         (1 min)                     │
│  ⏹️ Verify         (30 sec)                    │
│                                                 │
│  Build logs ▼                                   │
│  ┌─────────────────────────────────────────┐  │
│  │ # Starting build...                      │  │
│  │ # Installing dependencies...             │  │
│  │ # Running npm ci...                      │  │
│  │ # Building Next.js app...                │  │
│  │ # Build completed successfully!          │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### What to Do:

1. ✅ **Wait patiently** - this takes 5-8 minutes
2. ✅ **Watch the progress bars:**
   - Provision: 1 minute
   - Build: 3-5 minutes (longest stage)
   - Deploy: 1 minute
   - Verify: 30 seconds
3. ✅ **Check build logs** if you're curious (optional)

### What Success Looks Like:

```
✅ Provision      (Completed)
✅ Build          (Completed)
✅ Deploy         (Completed)
✅ Verify         (Completed)

Status: Deployed
```

---

## 📱 Success Screen - Get Your Live URL!

### What You'll See:

```
┌─────────────────────────────────────────────────┐
│  vericrop-finbridge                             │
│                                                 │
│  https://master.d1234567890abc.amplifyapp.com  │
│  [Copy URL] [Visit Site]                       │
│                                                 │
│  Branch: master                                 │
│  Status: ✅ Deployed                           │
│                                                 │
│  ✅ Provision      (Completed - 1m 23s)        │
│  ✅ Build          (Completed - 4m 12s)        │
│  ✅ Deploy         (Completed - 1m 05s)        │
│  ✅ Verify         (Completed - 28s)           │
│                                                 │
│  Total time: 7m 08s                            │
└─────────────────────────────────────────────────┘
```

### What to Do:

1. ✅ **Copy the Live URL:**
   - Click **[Copy URL]** button
   - Or manually copy: `https://master.d1234567890abc.amplifyapp.com`
   - **Save this URL** - you need it for hackathon submission!

2. ✅ **Test the Live Site:**
   - Click **[Visit Site]** button
   - Or paste the URL in a new browser tab
   - Verify homepage loads

3. ✅ **Test the Solar Azimuth Calculator:**
   - Scroll down to the calculator section
   - Enter latitude: **28.6139** (Delhi)
   - Enter longitude: **77.2090**
   - Select today's date and current time
   - Click **"Calculate Shadow Direction"**
   - Verify you see:
     - Azimuth angle (e.g., "Solar Azimuth: 245.67°")
     - Shadow direction (e.g., "Shadow Direction: ENE")

4. ✅ **Share the URL with Sarafaraz:**
   - Send via WhatsApp/SMS
   - He will update the README.md file

---

## 🎉 Success Checklist

After completing all steps, verify:

- [ ] All 4 build stages show green checkmarks (✅)
- [ ] Live URL is displayed at the top
- [ ] You've copied and saved the Live URL
- [ ] Homepage loads when you visit the URL
- [ ] Solar Azimuth calculator works
- [ ] You've shared the URL with Sarafaraz

---

## 🆘 What If Something Goes Wrong?

### Build Fails at "Build" Stage

**Error Message:** `npm ci: command not found` or `package.json not found`

**Solution:**
1. Go back to Amplify Console
2. Click **"App settings"** (left sidebar)
3. Click **"Build settings"**
4. Verify **"Monorepo root directory"** is set to `frontend`
5. If not set, click **"Edit"**, add `frontend`, click **"Save"**
6. Click **"Redeploy this version"** button

### Build Succeeds but Site Shows 404

**Error Message:** Site loads but shows "404 Not Found"

**Solution:**
1. Click **"App settings"** → **"Build settings"**
2. Click **"Edit"**
3. Verify `baseDirectory: out` (NOT `frontend/out`)
4. Click **"Save"**
5. Click **"Redeploy this version"**

### Build Takes Too Long (>10 minutes)

**What to Do:**
1. Check build logs for errors
2. If stuck at "Installing dependencies", wait a bit longer (npm can be slow)
3. If stuck for >15 minutes, click **"Stop build"** and try again

### Cannot See Repository in Dropdown

**Solution:**
1. Click **"Refresh"** button next to repository dropdown
2. If still not visible, go back and re-authorize GitHub
3. Verify repository is public or AWS Amplify has access

---

## 📞 Need Help?

**Contact Sarafaraz (Developer):**
- He can help troubleshoot technical issues
- He has access to all configuration files

**Check Documentation:**
- `FOR_MUZAMMIL_DEPLOYMENT_STEPS.md` - Detailed text guide
- `FULL_CICD_SETUP_WALKTHROUGH.md` - Complete walkthrough
- `CURRENT_STATUS_AND_NEXT_STEPS.md` - Current status

---

## 🎯 What Happens After You Get the Live URL?

### Immediate (Today):
1. ✅ Share Live URL with Sarafaraz
2. ✅ He updates README.md with the URL
3. ✅ Take screenshots for hackathon submission
4. ✅ Test the site thoroughly

### Next Steps (Tomorrow):
1. Set up CI/CD Pipeline (optional - 15 minutes)
2. Continue with remaining tasks (Task 2.3, 3.1, etc.)
3. Prepare hackathon submission materials

### Hackathon Submission (March 4):
1. Submit Live URL ✅
2. Submit GitHub Repository ✅
3. Submit README with technical justification ✅
4. Submit demo video (5 minutes)

---

## 🏆 You're Almost Done!

Getting the Live URL is the biggest milestone for hackathon submission. Once you have it, you're 80% done!

**Good luck! 🚀**

---

**Questions?** Contact Sarafaraz for technical support.
