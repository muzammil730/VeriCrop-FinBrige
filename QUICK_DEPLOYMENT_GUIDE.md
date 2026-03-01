# Quick Deployment Guide - For Team Leader

**Time Required:** 15-20 minutes  
**Goal:** Get Live URL for hackathon submission

---

## Step 1: Push Code to GitHub (5 minutes)

```bash
cd "D:\Kiro Hackathon"
git add .
git commit -m "feat: Add frontend and deployment infrastructure for hackathon"
git push origin main
```

---

## Step 2: Deploy to Amplify (10 minutes)

### A. Go to AWS Amplify Console
```
AWS Console → Search "Amplify" → Get Started → Host web app
```

### B. Connect GitHub
1. Select "GitHub"
2. Click "Continue"
3. Authorize AWS Amplify
4. Select your repository
5. Select branch: `main`
6. Click "Next"

### C. Configure Build
**App name:** `vericrop-finbridge`

**Build settings:** Paste this YAML:
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

**Advanced settings:**
- Monorepo app root: `frontend`

Click "Next"

### D. Deploy
1. Review settings
2. Click "Save and deploy"
3. Wait 5-10 minutes
4. **Copy the URL** (e.g., `https://main.d123.amplifyapp.com`)

---

## Step 3: Update README (2 minutes)

Edit `README.md`:

**Find this line:**
```markdown
**Live URL:** [https://main.YOUR_AMPLIFY_ID.amplifyapp.com](...)
```

**Replace with your actual URL:**
```markdown
**Live URL:** [https://main.d1234567890abc.amplifyapp.com](https://main.d1234567890abc.amplifyapp.com)
```

**Also update:**
```markdown
**GitHub Repository:** [https://github.com/YOUR_USERNAME/YOUR_REPO](https://github.com/YOUR_USERNAME/YOUR_REPO)
```

**Commit and push:**
```bash
git add README.md
git commit -m "docs: Update README with live Amplify URL"
git push origin main
```

---

## Step 4: Test (3 minutes)

1. Visit your Amplify URL
2. Try the Solar Azimuth calculator
3. Verify all sections load
4. Take screenshots for submission

---

## Step 5: Submit to Hackathon

**Submit these:**
- ✅ Live URL: Your Amplify URL
- ✅ GitHub Repo: Your GitHub URL
- ✅ README: Updated with Live URL

---

## Troubleshooting

**Build fails?**
- Check Amplify build logs
- Verify `frontend/package.json` exists
- Ensure build settings are correct

**Site shows 404?**
- Check `next.config.js` has `output: 'export'`
- Verify artifacts directory is `frontend/out`

**Need help?**
- See `AMPLIFY_CODEPIPELINE_SETUP.md` for detailed guide
- See `DEPLOYMENT_SUMMARY.md` for complete checklist

---

**That's it! You're ready for hackathon submission! 🚀**
