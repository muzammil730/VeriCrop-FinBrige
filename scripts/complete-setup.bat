@echo off
REM VeriCrop FinBridge - Complete Setup Script
REM This script sets up EVERYTHING needed for your MVP

echo.
echo 🚀 VeriCrop FinBridge - Complete Setup
echo ==========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✓ Node.js found
node --version
echo.

REM Check AWS CLI
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS CLI is not installed.
    echo.
    echo Please install AWS CLI:
    echo https://aws.amazon.com/cli/
    echo.
    echo Then configure it with:
    echo aws configure
    echo.
    pause
    exit /b 1
)

echo ✓ AWS CLI found
aws --version
echo.

REM Check AWS credentials
echo 🔐 Checking AWS credentials...
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS credentials not configured.
    echo.
    echo Please run: aws configure
    echo.
    echo You'll need:
    echo - AWS Access Key ID
    echo - AWS Secret Access Key
    echo - Default region: ap-south-1
    echo.
    pause
    exit /b 1
)

echo ✓ AWS credentials configured
aws sts get-caller-identity
echo.

REM Navigate to scripts directory
cd /d "%~dp0"

REM Install dependencies
echo 📦 Installing dependencies...
call npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Some packages may already be installed
)
echo ✓ Dependencies ready
echo.

REM Create DynamoDB table
echo 🔧 Creating DynamoDB table...
node create-dynamodb-table.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Failed to create DynamoDB table
    echo.
    echo Please check:
    echo 1. AWS credentials are correct
    echo 2. You have DynamoDB permissions
    echo 3. Region is set to ap-south-1
    echo.
    pause
    exit /b 1
)
echo.

REM Seed demo data
echo 🌱 Seeding demo data...
node seed-demo-data-to-dynamodb.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Demo data seeding had some issues
    echo    But you can still test by submitting new claims
    echo.
)
echo.

REM Calculate demo inputs
echo 🧮 Calculating perfect demo inputs...
node seed-demo-environment.js
echo.

echo ==========================================
echo ✅ COMPLETE SETUP FINISHED!
echo ==========================================
echo.
echo 📋 Your MVP is ready to test!
echo.
echo 🌐 Open your browser to:
echo    https://master.d564kvq3much7.amplifyapp.com
echo.
echo 📖 Testing guide:
echo    See QUICK_START.md for step-by-step instructions
echo.
echo 🎫 Demo Certificate IDs are displayed above
echo    Use them to test certificate verification and bridge loans
echo.

pause
