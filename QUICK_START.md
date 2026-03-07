# VeriCrop FinBridge - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Demo Data (One-Time)

**Windows:**
```bash
cd scripts
setup-demo.bat
```

**Mac/Linux:**
```bash
cd scripts
chmod +x setup-demo.sh
./setup-demo.sh
```

### Step 2: Open the App

**URL**: https://master.d564kvq3much7.amplifyapp.com

### Step 3: Test Features

#### Test 1: Verify Certificate (30 sec)
1. Go to: **Verify Certificate** page
2. Enter: `CERT-2026-03-08-10000`
3. Click: **Verify Certificate**
4. ✅ See valid certificate with SHA-256 hash

#### Test 2: Request Bridge Loan (30 sec)
1. Go to: **Bridge Loan** page
2. Enter: `CERT-2026-03-08-10000`
3. Click: **Request Bridge Loan**
4. ✅ See ₹35,000 loan approved

#### Test 3: Submit New Claim (2 min)
1. Go to: **Claim Submission** page
2. Fill form with demo data:
   - Name: Ramesh Kumar
   - Phone: 9999999999
   - Crop: Wheat
   - Damage Type: Flood
   - Damage %: 65
   - Amount: ₹50,000
3. Upload any video
4. Click: **Submit Claim**
5. ✅ See claim approved with certificate

#### Test 4: Fraud Detection (1 min)
1. Go to: **Claim Submission** page
2. Fill form with suspicious data:
   - Damage %: 95
   - Amount: ₹150,000
3. Click: **Submit Claim**
4. ❌ See claim rejected - Fraud detected

## 📋 Demo Certificate IDs

Use these for testing:

```
CERT-2026-03-08-10000  →  ₹50,000  →  ₹35,000 loan
CERT-2026-03-07-10001  →  ₹75,000  →  ₹52,500 loan
CERT-2026-03-06-10002  →  ₹60,000  →  ₹42,000 loan
CERT-2026-03-05-10003  →  ₹45,000  →  ₹31,500 loan
CERT-2026-03-04-10004  →  ₹80,000  →  ₹56,000 loan
```

## 🎯 Key Features

✅ **60-second claim validation**
✅ **AI fraud detection**
✅ **Instant bridge loans (0% interest)**
✅ **Tamper-proof certificates**
✅ **Solar azimuth verification**
✅ **Weather correlation**
✅ **Video analysis**

## 📖 Full Documentation

- `WORKING_MVP_SUMMARY.md` - Complete overview
- `DEMO_DATA_GUIDE.md` - Detailed testing guide
- `API_CONNECTION_ENABLED.md` - Technical details
- `DEMO_CHEAT_SHEET.md` - Presentation script

## 🆘 Troubleshooting

### Demo data not found?
```bash
cd scripts
node seed-demo-data-to-dynamodb.js
```

### API errors?
Check AWS credentials:
```bash
aws sts get-caller-identity
```

### Need perfect inputs?
```bash
cd scripts
node seed-demo-environment.js
```

## 🎉 You're Ready!

Your MVP is fully functional with:
- ✅ Real AWS backend
- ✅ Live API connections
- ✅ Demo datasets
- ✅ Predictable scenarios

**Happy demoing! 🚀**
