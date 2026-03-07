# VeriCrop FinBridge - End-to-End Farmer Testing Guide

## 🎯 Test Objective
Simulate a complete farmer journey from crop damage to certificate issuance and bridge loan approval.

---

## 📱 Prerequisites

### What You Need:
1. **Mobile Device or Computer** with camera access
2. **Internet Connection** (stable connection recommended)
3. **Test Video** - A short video (10-30 seconds) showing:
   - Damaged crops (can be simulated)
   - Clear shadows visible
   - Outdoor lighting
4. **GPS Location** - Browser will auto-detect your location

### Test URLs:
- **Frontend**: https://main.d564kvq3much7.amplifyapp.com
- **API Gateway**: https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/

---

## 🌾 FARMER JOURNEY - Step-by-Step Test

### STEP 1: Access the Application

**Action:**
1. Open your browser (Chrome, Safari, or Firefox recommended)
2. Navigate to: https://main.d564kvq3much7.amplifyapp.com
3. Wait for the homepage to load

**Expected Result:**
✅ Homepage loads with VeriCrop FinBridge branding
✅ You see "Old Way vs New Way" comparison cards
✅ Navigation menu shows: Home, Submit Claim, Bridge Loan, Verify Certificate

**What to Check:**
- Professional UI with green/emerald color scheme
- No emojis (replaced with SVG icons)
- Smooth animations when page loads

---

### STEP 2: GPS Auto-Detection (Homepage)

**Action:**
1. Scroll down to the "Solar Azimuth Fraud Detection Tool" section
2. Look for the GPS status indicator
3. If browser prompts for location permission, click "Allow"

**Expected Result:**
✅ GPS status shows "Detecting your location..."
✅ After 2-5 seconds, shows "Location detected successfully"
✅ Displays your coordinates (Latitude, Longitude)
✅ Shows calculated solar azimuth angle

**What to Check:**
- Green checkmark icon appears when location detected
- Coordinates are displayed in decimal format (e.g., 19.0760, 72.8777)
- Solar azimuth angle is calculated (e.g., 245.3°)

**Troubleshooting:**
- If GPS fails, click "Detect My Location" button
- If still fails, fallback coordinates (Mumbai) will be used

---

### STEP 3: Navigate to Claim Submission

**Action:**
1. Click "Submit Claim" in the navigation menu
2. Wait for the claim submission page to load

**Expected Result:**
✅ Claim submission page loads
✅ You see a form with multiple fields
✅ GPS auto-detection starts automatically
✅ Camera upload section is visible

**What to Check:**
- Page title: "Submit Your Crop Damage Claim"
- Feature highlights showing "60-Second Processing", "Physics-Based Validation", "Instant Certificate"
- Form fields are clearly labeled

---

### STEP 4: GPS Auto-Detection (Claim Page)

**Action:**
1. Wait for GPS auto-detection to complete
2. Observe the location status indicator

**Expected Result:**
✅ GPS status shows "Detecting your location..."
✅ After 2-5 seconds, coordinates appear in the form
✅ Latitude and Longitude fields are auto-filled
✅ Green checkmark appears next to location fields

**What to Check:**
- Latitude field shows your latitude (e.g., 19.0760)
- Longitude field shows your longitude (e.g., 72.8777)
- Fields are read-only (cannot be manually edited)

---

### STEP 5: Fill Farmer Information

**Action:**
Fill in the following fields:

1. **Farmer Name**: Enter your test name (e.g., "Ramesh Kumar")
2. **Phone Number**: Enter a 10-digit number (e.g., "9876543210")
3. **Crop Type**: Select from dropdown (e.g., "Wheat", "Rice", "Cotton")
4. **Damage Type**: Select from dropdown (e.g., "Flood", "Drought", "Pest")
5. **Damage Percentage**: Enter a number between 1-100 (e.g., "65")
6. **Estimated Loss Amount**: Enter amount in rupees (e.g., "50000")

**Expected Result:**
✅ All fields accept input
✅ Dropdown menus show relevant options
✅ Number fields only accept numeric values
✅ Form validation shows errors for invalid inputs

**What to Check:**
- Phone number must be exactly 10 digits
- Damage percentage must be between 1-100
- Loss amount must be a positive number

---

### STEP 6: Upload Video Evidence

**Action:**
1. Scroll to the "Upload Video Evidence" section
2. Click "Choose File" or "Record Video" button
3. **Option A (Upload existing video):**
   - Select a video file from your device
   - Video should show damaged crops with visible shadows
4. **Option B (Record new video):**
   - If on mobile, camera will open automatically
   - Record 10-30 seconds of outdoor footage
   - Ensure shadows are visible in the video

**Expected Result:**
✅ File picker opens
✅ Video file is selected/recorded
✅ File name appears below the upload button
✅ Upload progress indicator shows (if large file)

**What to Check:**
- Video file size should be under 500MB
- Supported formats: MP4, MOV, AVI
- Video preview may appear after upload

**Important Notes:**
- Video MUST have visible shadows for solar azimuth validation
- Video MUST be taken outdoors during daytime
- GPS metadata in video is helpful but not required

---

### STEP 7: Submit the Claim

**Action:**
1. Review all filled information
2. Click the "Submit Claim" button at the bottom
3. Wait for processing to complete

**Expected Result:**
✅ Submit button shows "Submitting..." with loading spinner
✅ Processing takes 5-60 seconds
✅ Success message appears
✅ Claim ID is displayed (e.g., "CLAIM-2026-03-07-12345")
✅ Certificate ID is displayed (e.g., "CERT-2026-03-07-67890")

**What to Check:**
- Claim status shows "APPROVED" or "PENDING_REVIEW"
- Validation results are displayed:
  - Solar Azimuth: PASS/FAIL
  - Weather Correlation: PASS/FAIL
  - AI Classification: Damage type detected
  - Bedrock Analysis: Recommendation
- Loss Certificate details are shown

**Possible Outcomes:**
1. **APPROVED** - All validations passed, certificate issued
2. **PENDING_REVIEW** - Sent to human reviewer (confidence <85%)
3. **REJECTED** - Fraud detected or validation failed

---

### STEP 8: View Certificate Details

**Action:**
1. After claim approval, scroll to the certificate section
2. Note down the Certificate ID
3. Review the certificate details displayed

**Expected Result:**
✅ Certificate ID is displayed (format: CERT-YYYY-MM-DD-XXXXX)
✅ Certificate details show:
   - Farmer Name
   - Claim ID
   - Damage Amount
   - Issue Date
   - Cryptographic Hash (SHA-256)
✅ "Download Certificate" button is visible

**What to Check:**
- Certificate ID matches the format
- All details are accurate
- SHA-256 hash is displayed (64-character hexadecimal string)

---

### STEP 9: Download Certificate (Optional)

**Action:**
1. Click "Download Certificate" button
2. Save the PDF to your device

**Expected Result:**
✅ PDF file downloads automatically
✅ File name: `VeriCrop_Certificate_[CERT-ID].pdf`
✅ PDF contains all certificate details
✅ PDF is formatted professionally

**What to Check:**
- PDF opens correctly
- All information is readable
- QR code or barcode is present (if implemented)

---

### STEP 10: Navigate to Bridge Loan Page

**Action:**
1. Click "Bridge Loan" in the navigation menu
2. Wait for the bridge loan page to load

**Expected Result:**
✅ Bridge loan page loads
✅ You see loan information cards
✅ Certificate ID input field is visible
✅ "How It Works" section explains the process

**What to Check:**
- Page shows "70% of Damage Amount"
- Page shows "0% Interest Rate"
- Page shows "UPI Instant Disbursement"

---

### STEP 11: Request Bridge Loan

**Action:**
1. Enter the Certificate ID from Step 8
2. Click "Calculate Loan" or "Request Loan" button
3. Wait for loan calculation

**Expected Result:**
✅ Loan amount is calculated (70% of damage amount)
✅ Loan details are displayed:
   - Principal Amount: ₹[amount]
   - Interest Rate: 0%
   - Repayment Source: Insurance Payout
   - Disbursement Method: UPI
✅ Loan approval status is shown

**What to Check:**
- Loan amount = Damage Amount × 0.70
- Example: If damage = ₹50,000, loan = ₹35,000
- Repayment timeline is displayed

---

### STEP 12: Verify Certificate (Blockchain Validation)

**Action:**
1. Click "Verify Certificate" in the navigation menu
2. Enter the Certificate ID from Step 8
3. Click "Verify Certificate" button
4. Wait for verification results

**Expected Result:**
✅ Verification page loads
✅ Certificate ID input field accepts the ID
✅ Verification takes 2-5 seconds
✅ Verification results are displayed:
   - Status: VALID or INVALID
   - Certificate Details (if valid)
   - Cryptographic Hash
   - Issue Date
   - Farmer Name
   - Damage Amount

**What to Check:**
- Status shows "✓ Certificate is Valid"
- SHA-256 hash matches the original certificate
- All details match the original claim
- Blockchain verification badge is displayed

**Tamper Detection Test (Optional):**
- Try entering a fake Certificate ID (e.g., "CERT-2026-03-07-99999")
- Expected: Status shows "✗ Certificate Not Found" or "Invalid"

---

## ✅ SUCCESS CRITERIA

### Your test is successful if:

1. ✅ **GPS Auto-Detection Works**
   - Location detected on homepage and claim page
   - Coordinates displayed correctly

2. ✅ **Claim Submission Works**
   - Form accepts all inputs
   - Video uploads successfully
   - Claim processes within 60 seconds

3. ✅ **Certificate Issued**
   - Certificate ID generated
   - SHA-256 hash displayed
   - Certificate details are accurate

4. ✅ **Bridge Loan Calculated**
   - Loan amount = 70% of damage
   - Interest rate = 0%
   - Approval status displayed

5. ✅ **Certificate Verification Works**
   - Valid certificate shows "VALID" status
   - Invalid certificate shows "INVALID" status
   - Hash verification works correctly

---

## 🐛 Troubleshooting Common Issues

### Issue 1: GPS Not Detecting
**Solution:**
- Check browser location permissions
- Try clicking "Detect My Location" button
- If fails, fallback coordinates (Mumbai) will be used

### Issue 2: Video Upload Fails
**Solution:**
- Check video file size (must be <500MB)
- Check video format (MP4, MOV, AVI supported)
- Try a smaller video file
- Check internet connection

### Issue 3: Claim Processing Takes Too Long
**Solution:**
- Wait up to 60 seconds for processing
- Check internet connection
- Refresh page if stuck for >2 minutes

### Issue 4: Certificate Not Found
**Solution:**
- Double-check Certificate ID (case-sensitive)
- Ensure claim was approved (not rejected)
- Wait 5-10 seconds after claim approval

### Issue 5: Bridge Loan Not Calculating
**Solution:**
- Ensure Certificate ID is correct
- Check that certificate is valid
- Verify damage amount was entered correctly

---

## 📊 Test Data Examples

### Example 1: Legitimate Claim (Should APPROVE)
```
Farmer Name: Ramesh Kumar
Phone: 9876543210
Crop Type: Wheat
Damage Type: Flood
Damage %: 65
Loss Amount: ₹50,000
Location: Auto-detected (Mumbai)
Video: Outdoor footage with visible shadows, daytime
```

**Expected Outcome:**
- Solar Azimuth: PASS
- Weather Correlation: PASS (if flood weather data available)
- AI Classification: Flood damage detected
- Bedrock: APPROVE
- Certificate: Issued
- Bridge Loan: ₹35,000 (70% of ₹50,000)

### Example 2: Fraudulent Claim (Should REJECT)
```
Farmer Name: Test Fraud
Phone: 1234567890
Crop Type: Rice
Damage Type: Drought
Damage %: 90
Loss Amount: ₹100,000
Location: Auto-detected
Video: Indoor footage or nighttime footage (no shadows)
```

**Expected Outcome:**
- Solar Azimuth: FAIL (no shadows or wrong angle)
- Weather Correlation: FAIL (no drought weather data)
- AI Classification: No damage detected
- Bedrock: REJECT
- Certificate: NOT issued
- Bridge Loan: NOT available

---

## 🎥 Demo Video Script

### For Hackathon Judges:

**Scene 1: Homepage (30 seconds)**
- Show GPS auto-detection working
- Highlight solar azimuth calculation
- Show AWS architecture section

**Scene 2: Claim Submission (2 minutes)**
- Fill farmer information
- Upload video evidence
- Submit claim
- Show processing (60 seconds)
- Display approval and certificate

**Scene 3: Bridge Loan (1 minute)**
- Enter certificate ID
- Show loan calculation (70%, 0%)
- Display approval

**Scene 4: Certificate Verification (1 minute)**
- Enter certificate ID
- Show verification results
- Highlight SHA-256 hash
- Show blockchain badge

**Total Demo Time: 4.5 minutes**

---

## 📈 Performance Metrics to Track

### During Testing, Measure:

1. **GPS Detection Time**
   - Target: <5 seconds
   - Acceptable: <10 seconds

2. **Claim Processing Time**
   - Target: <60 seconds
   - Acceptable: <90 seconds

3. **Video Upload Time**
   - Depends on file size and internet speed
   - 10MB video: ~30 seconds on 4G

4. **Certificate Verification Time**
   - Target: <3 seconds
   - Acceptable: <5 seconds

5. **Bridge Loan Calculation Time**
   - Target: <2 seconds
   - Acceptable: <5 seconds

---

## 🏆 Final Validation Checklist

Before declaring the test complete, verify:

- [ ] GPS auto-detection worked on both pages
- [ ] Claim was submitted successfully
- [ ] Certificate was issued with valid ID
- [ ] SHA-256 hash was generated
- [ ] Bridge loan was calculated correctly (70%)
- [ ] Certificate verification returned correct status
- [ ] All pages loaded without errors
- [ ] Mobile responsiveness works (if testing on mobile)
- [ ] No console errors in browser developer tools

---

## 📞 Support

If you encounter issues during testing:

1. **Check Browser Console**
   - Press F12 to open developer tools
   - Look for error messages in Console tab

2. **Check Network Tab**
   - Verify API calls are succeeding
   - Check for 4xx or 5xx errors

3. **Review Documentation**
   - `FINAL_MVP_SUMMARY.md` - Complete system overview
   - `CODE_TOUR.md` - Technical implementation details
   - `API_ENDPOINTS_VERIFICATION.md` - API testing guide

---

## 🎯 Success!

If you completed all 12 steps successfully, you have validated the complete VeriCrop FinBridge MVP from a farmer's perspective!

**Key Achievements:**
✅ Submitted a crop damage claim
✅ Received instant validation (60 seconds)
✅ Obtained a cryptographically hashed loss certificate
✅ Calculated a 0% interest bridge loan
✅ Verified certificate authenticity

**This proves the system can:**
- Reduce claim-to-cash time from 6 months to 60 seconds
- Prevent farmers from falling into 24% interest debt traps
- Provide tamper-evident certificates for regulatory compliance
- Scale to millions of farmers across India

---

**Built with ❤️ for Indian Farmers**

*Reducing claim-to-cash time from 6 months to 60 seconds*

**Last Updated:** March 7, 2026
