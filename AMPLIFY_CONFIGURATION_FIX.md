# 🔧 Amplify Configuration Fix - Complete Solution

**Problem:** Builds keep failing  
**Root Cause:** Amplify might not be finding the frontend directory  
**Solution:** Update Amplify build settings to point to correct directory

---

## 🎯 Most Likely Issue

The `amplify.yml` file is in the `frontend/` directory, but Amplify might be looking in the root directory.

### Current Structure:
```
D:\Kiro Hackathon\
├── frontend/
│   ├── amplify.yml  ← Amplify config is HERE
│   ├── package.json
│   ├── next.config.js
│   └── app/
├── infrastructure/
└── lambda-functions/
```

### The Problem:
Amplify is running commands in the root directory, but needs to run them in `frontend/` directory.

---

## ✅ Solution: Update Build Settings in Amplify Console

### Step 1: Go to App Settings

1. **In Amplify Console, click "App settings" in the left sidebar**
2. **Click "Build settings"**

---

### Step 2: Update Build Specification

1. **Click "Edit" button**

2. **Replace the entire build spec with this:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
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

**Key Changes:**
- Added `cd frontend` in preBuild
- Changed `baseDirectory` to `frontend/out`
- Changed cache path to `frontend/node_modules/**/*`

3. **Click "Save"**

---

### Step 3: Redeploy

1. **Go back to "Deployments" in left sidebar**
2. **Click "Run build" or "Redeploy this version"**
3. **Wait for build to complete (5-8 minutes)**

---

## 🔄 Alternative Solution: Set App Root Directory

If the above doesn't work, try setting the app root directory:

### Step 1: Go to App Settings → General

1. **Click "App settings" in left sidebar**
2. **Click "General"**

### Step 2: Edit App Root Directory

1. **Scroll down to "App root directory"**
2. **Click "Edit"**
3. **Enter:** `frontend`
4. **Click "Save"**

### Step 3: Update Build Spec

If you set app root to `frontend`, update the build spec to:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Note:** No `cd frontend` needed because app root is already set to `frontend`

---

## 🎯 Recommended Approach

### Option A: Use Build Spec with `cd frontend` (Recommended)

**Pros:**
- Works with current setup
- No need to change app root
- More explicit

**Steps:**
1. Go to App Settings → Build settings
2. Edit build spec
3. Add `cd frontend` to preBuild
4. Change `baseDirectory` to `frontend/out`
5. Save and redeploy

---

### Option B: Set App Root to `frontend`

**Pros:**
- Cleaner build spec
- Amplify knows where to look

**Steps:**
1. Go to App Settings → General
2. Set app root to `frontend`
3. Update build spec (remove `cd frontend`, use `out` instead of `frontend/out`)
4. Save and redeploy

---

## 📋 Complete Step-by-Step for Muzammil

### Using Option A (Recommended):

1. **Click "App settings" in left sidebar**
2. **Click "Build settings"**
3. **Click "Edit" button**
4. **Replace the YAML with:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
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

5. **Click "Save"**
6. **Go to "Deployments" in left sidebar**
7. **Click "Run build"**
8. **Wait 5-8 minutes**

---

## 🆘 If This Still Fails

### Check Build Logs for Specific Error

1. Click on the failed deployment
2. Click "Build" tab
3. Look for the error message
4. Share with Sarafaraz

### Common Errors After This Fix:

**Error: "cd: frontend: No such file or directory"**
- **Solution:** The repository structure is wrong
- **Fix:** Verify `frontend/` folder exists in GitHub

**Error: "npm: command not found"**
- **Solution:** Build environment issue
- **Fix:** Add `runtime-versions` to build spec

**Error: "Cannot find module 'next'"**
- **Solution:** `npm install` didn't work
- **Fix:** Check `package.json` exists in `frontend/`

---

## 📊 What Each Part Does

### `cd frontend`
- Changes directory to `frontend/` folder
- All subsequent commands run in `frontend/`

### `npm install`
- Installs dependencies from `package.json`
- Creates `node_modules/` folder

### `npm run build`
- Runs Next.js build
- Creates `out/` folder with static files

### `baseDirectory: frontend/out`
- Tells Amplify where to find the built files
- Amplify will deploy everything in `frontend/out/`

---

## ✅ Success Indicators

After applying this fix and redeploying:

```
✅ Provision      (Completed)
✅ Build          (Completed)  ← Should succeed now
✅ Deploy         (Completed)
✅ Verify         (Completed)

Status: Deployed
Live URL: https://master.d564vq3much7.amplifyapp.com
```

---

## 📞 What to Tell Sarafaraz

If Muzammil can't make these changes in the UI, tell Sarafaraz:

```
Hi Sarafaraz,

The build is failing because Amplify can't find the frontend directory.

Can you update the amplify.yml file to include "cd frontend" in the preBuild commands?

The build spec should be:

version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/out
    files:
      - '**/*'

Then push to GitHub and Amplify will rebuild.

Thanks!
```

---

**This should fix the build issue! Let's get that Live URL! 🚀**
