# VeriCrop FinBridge - Hackathon Demo Video Script

## 🎬 Video Overview

**Duration:** 5 minutes
**Format:** Screen recording + voiceover
**Tools:** OBS Studio, Loom, or built-in screen recorder
**Resolution:** 1080p (1920x1080) minimum

---

## 🎯 Demo Objectives

Show judges:
1. ✅ Professional enterprise UI (no emojis, glassmorphism)
2. ✅ GPS auto-detection working
3. ✅ Complete claim submission flow
4. ✅ Physics-based fraud detection (solar azimuth)
5. ✅ Certificate issuance with SHA-256 hash
6. ✅ Bridge loan calculation (70%, 0%)
7. ✅ Certificate verification (blockchain)
8. ✅ All 7 mandatory AWS services highlighted

---

## 📋 Pre-Recording Checklist

### Before You Start Recording:

- [ ] **Clear browser cache** - Fresh start
- [ ] **Close unnecessary tabs** - Clean screen
- [ ] **Disable notifications** - No interruptions
- [ ] **Test microphone** - Clear audio
- [ ] **Prepare test data** - Have values ready
- [ ] **Open URLs in tabs:**
  - Tab 1: https://main.d564kvq3much7.amplifyapp.com
  - Tab 2: AWS Console (CloudWatch/Lambda - optional)
  - Tab 3: GitHub repository (optional)
- [ ] **Prepare a simple video file** - Any outdoor video with shadows (10-30 seconds)
  - Can be: Walking outside, garden, street view
  - Must have: Visible shadows, daytime footage
  - Size: <50MB recommended

### Test Data to Use:

```
Farmer Name: Ramesh Kumar
Phone Number: 9876543210
Crop Type: Wheat
Damage Type: Flood
Damage Percentage: 65
Estimated Loss: ₹50,000
Video: Your prepared outdoor video with shadows
```

---

## 🎬 SCENE-BY-SCENE SCRIPT

### SCENE 1: Introduction (30 seconds)

**Screen:** Homepage (https://main.d564kvq3much7.amplifyapp.com)

**Voiceover Script:**
```
"Hello judges! I'm presenting VeriCrop FinBridge - a 60-second forensic AI 
system that validates agricultural insurance claims using physics-based fraud 
detection and issues instant bridge loans.

The problem: Indian farmers wait 6 months for insurance payouts, forcing them 
into 24% interest debt traps.

Our solution: Validate claims in 60 seconds using solar azimuth calculations, 
AI analysis, and blockchain certificates."
```

**Actions:**
1. Show homepage loading
2. Scroll slowly to show "Old Way vs New Way" comparison
3. Highlight "6 months → 60 seconds"
4. Pause on the comparison cards

**What to Show:**
- Professional UI with green/emerald theme
- No emojis (SVG icons only)
- Glassmorphism effects
- Smooth animations

---

### SCENE 2: GPS Auto-Detection (20 seconds)

**Screen:** Homepage - Solar Azimuth Tool section

**Voiceover Script:**
```
"The system uses GPS auto-detection to capture the farmer's exact location. 
This is critical for our physics-based fraud detection."
```

**Actions:**
1. Scroll to "Solar Azimuth Fraud Detection Tool"
2. Show GPS status: "Detecting your location..."
3. Wait for location to be detected (2-5 seconds)
4. Show coordinates appearing
5. Show solar azimuth angle calculated

**What to Show:**
- GPS icon with animation
- Latitude/Longitude displayed (e.g., 19.0760, 72.8777)
- Solar azimuth angle (e.g., 245.3°)
- Green checkmark when detected

**Tip:** If GPS fails, click "Detect My Location" button

---

### SCENE 3: AWS Architecture Overview (20 seconds)

**Screen:** Homepage - Scroll to AWS Architecture section

**Voiceover Script:**
```
"VeriCrop FinBridge uses 7 mandatory AWS services: Bedrock for AI analysis, 
Lambda for serverless compute, Step Functions for orchestration, DynamoDB 
for certificates, S3 for evidence storage, API Gateway for endpoints, and 
Amplify for hosting."
```

**Actions:**
1. Scroll to "AWS Architecture" section
2. Slowly pan across service cards
3. Highlight each service icon

**What to Show:**
- Amazon Bedrock card
- AWS Lambda card
- Step Functions card
- DynamoDB + SHA-256 card
- Amazon S3 card
- API Gateway card
- AWS Amplify card
- Amazon Rekognition card
- Amazon SageMaker card
- CloudWatch card

---

### SCENE 4: Navigate to Claim Submission (10 seconds)

**Screen:** Navigation menu

**Voiceover Script:**
```
"Let's submit a crop damage claim as a farmer would."
```

**Actions:**
1. Click "Submit Claim" in navigation menu
2. Wait for page to load
3. Show page title and hero section

**What to Show:**
- Smooth page transition
- Professional form layout
- Feature highlights (60-Second Processing, Physics-Based Validation)

---

### SCENE 5: GPS Auto-Detection on Claim Page (15 seconds)

**Screen:** Claim Submission page - GPS section

**Voiceover Script:**
```
"GPS automatically detects the farmer's location again to ensure accuracy."
```

**Actions:**
1. Show GPS auto-detection starting
2. Wait for coordinates to appear
3. Show latitude/longitude fields auto-filled

**What to Show:**
- GPS status indicator
- Coordinates auto-filling
- Green checkmark
- Read-only fields (cannot be manually edited)

---

### SCENE 6: Fill Farmer Information (30 seconds)

**Screen:** Claim Submission form

**Voiceover Script:**
```
"The farmer enters basic information: name, phone number, crop type, 
damage type, damage percentage, and estimated loss amount."
```

**Actions:**
1. Type "Ramesh Kumar" in Farmer Name
2. Type "9876543210" in Phone Number
3. Select "Wheat" from Crop Type dropdown
4. Select "Flood" from Damage Type dropdown
5. Type "65" in Damage Percentage
6. Type "50000" in Estimated Loss Amount

**What to Show:**
- Clean form fields
- Dropdown menus working
- Real-time validation (if any)
- Professional input styling

**Tip:** Type at normal speed, don't rush

---

### SCENE 7: Upload Video Evidence (30 seconds)

**Screen:** Video upload section

**Voiceover Script:**
```
"The farmer uploads video evidence of the damaged crops. The video must 
show visible shadows for our solar azimuth fraud detection to work."
```

**Actions:**
1. Scroll to "Upload Video Evidence" section
2. Click "Choose File" or camera icon
3. Select your prepared video file
4. Show file name appearing
5. Wait for upload to complete (if progress bar shows)

**What to Show:**
- File picker opening
- Video file selected
- File name displayed
- Upload progress (if visible)
- Video preview (if available)

**Important:** Use a video with visible shadows taken outdoors during daytime

---

### SCENE 8: Submit Claim (60 seconds) - MOST IMPORTANT

**Screen:** Submit button and processing

**Voiceover Script:**
```
"Now we submit the claim. The system will process it in under 60 seconds 
using parallel forensic validation: solar azimuth calculation, weather 
correlation analysis, AI crop damage classification, and Bedrock AI analysis."
```

**Actions:**
1. Scroll to bottom of form
2. Click "Submit Claim" button
3. Show loading spinner
4. **WAIT** for processing (this is the key moment!)
5. Show success message appearing
6. Show Claim ID
7. Show Certificate ID

**What to Show:**
- Submit button with loading state
- Processing message: "Validating claim..."
- Validation results appearing:
  - ✓ Solar Azimuth: PASS
  - ✓ Weather Correlation: PASS
  - ✓ AI Classification: Flood damage detected
  - ✓ Bedrock Analysis: APPROVE
- Claim Status: APPROVED
- Claim ID: CLAIM-2026-03-07-XXXXX
- Certificate ID: CERT-2026-03-07-XXXXX

**Critical:** This scene proves the 60-second processing claim!

**Tip:** If processing takes longer than 60 seconds, that's okay - show it anyway

---

### SCENE 9: Certificate Details (30 seconds)

**Screen:** Certificate section after approval

**Voiceover Script:**
```
"A tamper-evident loss certificate is issued immediately, secured with 
SHA-256 cryptographic hashing. This certificate serves as instant collateral 
for bridge loans."
```

**Actions:**
1. Scroll to certificate details
2. Highlight Certificate ID
3. Show SHA-256 hash
4. Show certificate details (farmer name, damage amount, issue date)

**What to Show:**
- Certificate ID clearly visible
- SHA-256 hash (64-character hexadecimal string)
- All certificate details
- Professional certificate card design

**Tip:** Copy the Certificate ID - you'll need it for next scenes

---

### SCENE 10: Navigate to Bridge Loan (10 seconds)

**Screen:** Navigation menu

**Voiceover Script:**
```
"With the certificate issued, the farmer can now request a zero-interest 
bridge loan."
```

**Actions:**
1. Click "Bridge Loan" in navigation menu
2. Wait for page to load

**What to Show:**
- Smooth navigation
- Bridge loan page loading

---

### SCENE 11: Calculate Bridge Loan (30 seconds)

**Screen:** Bridge Loan page

**Voiceover Script:**
```
"The bridge loan provides 70% of the damage amount at 0% interest, 
disbursed instantly via UPI. This prevents farmers from falling into 
24% interest debt traps with moneylenders."
```

**Actions:**
1. Show loan info cards (70%, 0%, UPI)
2. Paste Certificate ID in input field
3. Click "Calculate Loan" or "Request Loan"
4. Show loan calculation results

**What to Show:**
- Info cards: "70% of Damage Amount", "0% Interest Rate", "UPI Instant"
- Certificate ID input
- Loan calculation:
  - Principal Amount: ₹35,000 (70% of ₹50,000)
  - Interest Rate: 0%
  - Repayment Source: Insurance Payout
  - Status: APPROVED
- Timeline showing next steps

**Validation:** ₹50,000 × 0.70 = ₹35,000 ✓

---

### SCENE 12: Navigate to Certificate Verification (10 seconds)

**Screen:** Navigation menu

**Voiceover Script:**
```
"Let's verify the certificate's authenticity using blockchain validation."
```

**Actions:**
1. Click "Verify Certificate" in navigation menu
2. Wait for page to load

**What to Show:**
- Navigation working
- Verification page loading

---

### SCENE 13: Verify Certificate (30 seconds)

**Screen:** Certificate Verification page

**Voiceover Script:**
```
"The certificate verification uses SHA-256 cryptographic hashing to ensure 
tamper-evidence. Any modification to the certificate data will cause the 
hash to mismatch, proving tampering occurred."
```

**Actions:**
1. Show verification page with info cards
2. Paste Certificate ID in input field
3. Click "Verify Certificate"
4. Show verification results

**What to Show:**
- Info cards: "DynamoDB with SHA-256", "Instant Verification", "256-bit Security"
- Certificate ID input
- Verification results:
  - Status: ✓ Certificate is Valid
  - Certificate Details (farmer name, damage amount, issue date)
  - SHA-256 Hash displayed
  - Hash Match: ✓ Verified
  - Blockchain verification badge

**Tip:** The hash should match the one from Scene 9

---

### SCENE 14: Test Invalid Certificate (20 seconds) - OPTIONAL

**Screen:** Certificate Verification page

**Voiceover Script:**
```
"Let's test with an invalid certificate ID to show fraud detection."
```

**Actions:**
1. Clear the input field
2. Type a fake Certificate ID: "CERT-2026-03-07-99999"
3. Click "Verify Certificate"
4. Show error message

**What to Show:**
- Invalid certificate ID entered
- Verification results:
  - Status: ✗ Certificate Not Found
  - Error message: "Certificate does not exist"
  - Red error styling

**This proves:** The system detects invalid/fake certificates

---

### SCENE 15: Show AWS Console (30 seconds) - OPTIONAL

**Screen:** AWS Console - CloudWatch or Lambda

**Voiceover Script:**
```
"Behind the scenes, all 18 Lambda functions are deployed and operational, 
with CloudWatch monitoring and X-Ray tracing enabled."
```

**Actions:**
1. Switch to AWS Console tab
2. Show Lambda functions list (18 functions)
3. Show CloudWatch logs (recent invocations)
4. Show API Gateway endpoints

**What to Show:**
- Lambda functions deployed
- CloudWatch logs with recent activity
- API Gateway with 18 endpoints
- X-Ray traces (if available)

**Tip:** This is optional but impressive for judges

---

### SCENE 16: Show GitHub Repository (20 seconds) - OPTIONAL

**Screen:** GitHub repository

**Voiceover Script:**
```
"The complete source code is available on GitHub, including the Kiro 
spec-driven development proof in the .kiro/specs directory."
```

**Actions:**
1. Switch to GitHub tab
2. Show repository structure
3. Highlight `.kiro/specs/vericrop-finbridge/` folder
4. Show README.md

**What to Show:**
- Clean repository structure
- `.kiro/specs/` folder visible
- Professional README
- Recent commits

---

### SCENE 17: Conclusion (30 seconds)

**Screen:** Homepage or architecture diagram

**Voiceover Script:**
```
"VeriCrop FinBridge demonstrates:
- All 7 mandatory AWS services integrated
- Physics-based fraud detection using solar azimuth
- 60-second claim processing with parallel validation
- Cryptographically hashed certificates with SHA-256
- Zero-interest bridge loans preventing debt traps
- Enterprise-grade UI built with Kiro spec-driven development

This system can scale to serve 140 million Indian farmers, reducing 
claim-to-cash time from 6 months to 60 seconds.

Thank you for watching!"
```

**Actions:**
1. Show homepage or architecture diagram
2. Slowly scroll through key features
3. End on VeriCrop FinBridge logo or tagline

**What to Show:**
- Professional UI
- AWS architecture
- Impact metrics
- Tagline: "Reducing claim-to-cash time from 6 months to 60 seconds"

---

## 🎥 Recording Tips

### Technical Setup:

1. **Screen Resolution:** 1920x1080 (1080p)
2. **Frame Rate:** 30 fps minimum
3. **Audio:** Clear microphone, no background noise
4. **Browser:** Chrome or Firefox (latest version)
5. **Zoom Level:** 100% (no zoom in/out)

### Recording Best Practices:

1. **Rehearse First** - Do a dry run before recording
2. **Speak Clearly** - Enunciate, don't rush
3. **Pause Between Scenes** - Easy to edit later
4. **Show, Don't Tell** - Let the UI speak for itself
5. **Highlight Key Moments** - Use cursor to point at important elements
6. **Keep It Moving** - Don't linger too long on any scene

### What to Avoid:

- ❌ Don't show errors or failures (unless intentional like invalid certificate)
- ❌ Don't show loading screens for too long
- ❌ Don't rush through important scenes
- ❌ Don't use filler words ("um", "uh", "like")
- ❌ Don't show personal information
- ❌ Don't show AWS credentials or sensitive data

---

## 📊 Video Structure Summary

```
00:00 - 00:30  Introduction & Problem Statement
00:30 - 00:50  GPS Auto-Detection Demo
00:50 - 01:10  AWS Architecture Overview
01:10 - 01:20  Navigate to Claim Submission
01:20 - 01:35  GPS Auto-Detection on Claim Page
01:35 - 02:05  Fill Farmer Information
02:05 - 02:35  Upload Video Evidence
02:35 - 03:35  Submit Claim & Processing (KEY SCENE)
03:35 - 04:05  Certificate Details
04:05 - 04:15  Navigate to Bridge Loan
04:15 - 04:45  Calculate Bridge Loan
04:45 - 04:55  Navigate to Certificate Verification
04:55 - 05:25  Verify Certificate
05:25 - 05:45  Test Invalid Certificate (Optional)
05:45 - 06:15  AWS Console (Optional)
06:15 - 06:35  GitHub Repository (Optional)
06:35 - 07:05  Conclusion

Total: 5-7 minutes (5 min core, +2 min optional)
```

---

## ✅ Pre-Flight Checklist

Before you hit record:

- [ ] Browser cache cleared
- [ ] All tabs prepared and open
- [ ] Test data ready (farmer info, video file)
- [ ] Microphone tested
- [ ] Notifications disabled
- [ ] Screen resolution set to 1080p
- [ ] Recording software ready (OBS, Loom, etc.)
- [ ] Rehearsed the script once
- [ ] Certificate ID from previous test saved (if reusing)

---

## 🎬 Recording Software Options

### Option 1: OBS Studio (Free, Professional)
- Download: https://obsproject.com/
- Best for: High-quality recordings
- Settings: 1920x1080, 30fps, MP4 format

### Option 2: Loom (Free, Easy)
- Website: https://www.loom.com/
- Best for: Quick recordings with webcam
- Automatic upload to cloud

### Option 3: Windows Game Bar (Built-in)
- Shortcut: Win + G
- Best for: Quick recordings on Windows
- No installation needed

### Option 4: macOS QuickTime (Built-in)
- App: QuickTime Player → File → New Screen Recording
- Best for: Mac users
- Simple and reliable

---

## 📤 After Recording

### Post-Production:

1. **Trim** - Remove dead air at start/end
2. **Add Captions** - For accessibility (optional)
3. **Add Title Slide** - "VeriCrop FinBridge - AI for Bharat Hackathon"
4. **Add End Slide** - GitHub link, team name
5. **Export** - MP4 format, H.264 codec

### Upload:

1. **YouTube** (Unlisted) - For sharing with judges
2. **Google Drive** - For submission
3. **GitHub** - Add link to README.md

### File Naming:

```
VeriCrop_FinBridge_Demo_Video_2026.mp4
```

---

## 🏆 Success Criteria

Your demo video is successful if it shows:

- ✅ Professional enterprise UI (no emojis)
- ✅ GPS auto-detection working
- ✅ Complete claim submission (with video upload)
- ✅ 60-second processing (or close to it)
- ✅ Certificate issued with SHA-256 hash
- ✅ Bridge loan calculated (70%, 0%)
- ✅ Certificate verification working
- ✅ All 7 AWS services mentioned
- ✅ Clear audio and smooth narration
- ✅ No errors or failures shown

---

## 📞 Troubleshooting During Recording

### If GPS Fails:
- Click "Detect My Location" button
- Continue with fallback coordinates
- Mention: "GPS auto-detection with fallback"

### If Claim Processing Takes >60 Seconds:
- Keep recording, show the full process
- Mention: "Processing time varies based on video size"
- Highlight that it's still faster than 6 months!

### If Video Upload Fails:
- Try a smaller video file (<10MB)
- Use a different video format (MP4 recommended)
- Mention: "System supports videos up to 500MB"

### If Certificate Verification Fails:
- Double-check Certificate ID (case-sensitive)
- Try copying from the claim submission result
- Show the error, then retry with correct ID

---

## 🎯 Key Messages for Judges

Emphasize these points:

1. **Innovation:** World's first physics-based fraud detection using solar azimuth
2. **Speed:** 60-second processing vs 6-month traditional process
3. **Impact:** Prevents 24% interest debt traps for 140 million farmers
4. **Technology:** All 7 mandatory AWS services integrated
5. **Security:** Cryptographically hashed certificates (SHA-256)
6. **Scalability:** Serverless architecture, auto-scaling to millions
7. **Methodology:** Kiro spec-driven development (proof in .kiro/specs/)

---

**Good luck with your demo video! 🎬**

**Remember:** Show confidence, speak clearly, and let the MVP speak for itself!

**Last Updated:** March 7, 2026
