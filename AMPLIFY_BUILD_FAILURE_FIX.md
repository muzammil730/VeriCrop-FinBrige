# 🔧 Amplify Build Failure - "Failed to Fetch" Fix

**Status:** Build failed with "Failed to fetch" error  
**Cause:** Missing `package-lock.json` in frontend directory  
**Solution:** Generate package-lock.json and push to GitHub

---

## 🚨 What Happened

The Amplify build failed because:
1. The `amplify.yml` uses `npm ci` command
2. `npm ci` requires `package-lock.json` to exist
3. The `package-lock.json` file is missing from the `frontend/` directory

**Error Message:** "Failed to fetch"

---

## ✅ Solution - Generate package-lock.json

### Step 1: Generate package-lock.json (Sarafaraz)

Run these commands in PowerShell:

```powershell
# Navigate to frontend directory
cd "D:\Kiro Hackathon\frontend"

# Generate package-lock.json
npm install

# Verify package-lock.json was created
ls package-lock.json
```

**Expected Output:**
```
added 245 packages, and audited 246 packages in 15s
```

You should now see `package-lock.json` in the `frontend/` directory.

---

### Step 2: Commit and Push to GitHub

```powershell
# Go back to project root
cd "D:\Kiro Hackathon"

# Add the new file
git add frontend/package-lock.json

# Commit
git commit -m "fix: Add package-lock.json for Amplify build"

# Push to GitHub
git push origin master
```

---

### Step 3: Amplify Will Auto-Rebuild (Muzammil)

After the push:
1. Go back to Amplify Console
2. Amplify will automatically detect the new commit
3. A new build will start automatically (within 1-2 minutes)
4. Wait for the build to complete (5-8 minutes)

**OR manually trigger rebuild:**
1. In Amplify Console, click on the "master" branch
2. Click "Redeploy this version" button
3. Wait for build to complete

---

## 🔄 Alternative Solution - Use npm install Instead

If you don't want to generate `package-lock.json`, you can change the build command:

### Option A: Update amplify.yml (Recommended - Keep npm ci)

**Keep the current `amplify.yml`** and just add `package-lock.json` (Solution above).

### Option B: Change to npm install (Not Recommended)

Edit `frontend/amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install  # Changed from npm ci
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

**Why Option A is better:**
- `npm ci` is faster and more reliable
- `npm ci` ensures consistent builds
- `npm ci` is the standard for CI/CD pipelines

---

## 📋 Quick Fix Checklist

For Sarafaraz:
- [ ] Navigate to `frontend/` directory
- [ ] Run `npm install`
- [ ] Verify `package-lock.json` was created
- [ ] Commit and push to GitHub
- [ ] Verify push succeeded

For Muzammil:
- [ ] Wait for Amplify to auto-rebuild (1-2 minutes)
- [ ] OR manually click "Redeploy this version"
- [ ] Monitor build progress
- [ ] Verify all 4 stages complete successfully
- [ ] Copy Live URL when done

---

## 🎯 Expected Timeline

- **Generate package-lock.json:** 1 minute
- **Commit and push:** 1 minute
- **Amplify auto-detects:** 1-2 minutes
- **Build completes:** 5-8 minutes
- **Total:** 8-12 minutes

---

## ✅ Success Indicators

After the fix, you should see:

```
✅ Provision      (Completed)
✅ Build          (Completed)
✅ Deploy         (Completed)
✅ Verify         (Completed)

Status: Deployed
Live URL: https://master.d564vq3much7.amplifyapp.com
```

---

## 🆘 If Build Still Fails

### Check Build Logs

1. In Amplify Console, click on the failed build
2. Click "Build logs" tab
3. Look for specific error messages

### Common Issues:

**Error: "Cannot find module 'next'"**
- Solution: Verify `package.json` has all dependencies
- Run `npm install` again

**Error: "Build failed with exit code 1"**
- Solution: Check if `next.config.js` is correct
- Verify `output: 'export'` is set

**Error: "Artifacts not found"**
- Solution: Check `baseDirectory: out` in `amplify.yml`
- Verify `npm run build` creates `out/` directory

---

## 📞 Need More Help?

If the build still fails after adding `package-lock.json`:

1. Share the complete build logs
2. Check if `frontend/package.json` exists
3. Verify all files are in the correct locations
4. Try deleting and recreating the Amplify app

---

**Let's fix this and get your Live URL! 🚀**
