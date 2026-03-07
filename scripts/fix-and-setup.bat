@echo off
REM VeriCrop FinBridge - Fix and Complete Setup
REM This fixes the table name issue and sets up everything

echo.
echo 🚀 VeriCrop FinBridge - Fix and Setup
echo ==========================================
echo.

cd /d "%~dp0"

echo 📦 Installing dependencies...
call npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb 2>nul
echo.

echo 🔧 Step 1: Creating DynamoDB table with correct name...
echo.

REM Create the table using AWS CLI (simpler than Node.js for this)
aws dynamodb create-table ^
  --table-name VeriCropClaims ^
  --attribute-definitions ^
    AttributeName=claimId,AttributeType=S ^
    AttributeName=certificateId,AttributeType=S ^
  --key-schema ^
    AttributeName=claimId,KeyType=HASH ^
  --global-secondary-indexes ^
    "IndexName=CertificateIndex,KeySchema=[{AttributeName=certificateId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" ^
  --provisioned-throughput ^
    ReadCapacityUnits=5,WriteCapacityUnits=5 ^
  --region ap-south-1 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✓ Table created successfully
    echo.
    echo ⏳ Waiting 30 seconds for table to become active...
    timeout /t 30 /nobreak >nul
    echo ✓ Table should be ready now
) else (
    echo ℹ️  Table may already exist or there was an issue
    echo    Checking table status...
    aws dynamodb describe-table --table-name VeriCropClaims --region ap-south-1 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✓ Table exists and is accessible
    ) else (
        echo ❌ Table does not exist and could not be created
        echo.
        echo Please check:
        echo 1. AWS credentials: aws sts get-caller-identity
        echo 2. IAM permissions for DynamoDB
        echo 3. AWS Console: https://console.aws.amazon.com/dynamodb/
        echo.
        pause
        exit /b 1
    )
)

echo.
echo 🌱 Step 2: Seeding demo data...
echo.
node seed-demo-data-to-dynamodb.js

echo.
echo 🧮 Step 3: Calculating demo inputs...
echo.
node seed-demo-environment.js

echo.
echo ==========================================
echo ✅ SETUP COMPLETE!
echo ==========================================
echo.
echo 📋 Next Steps:
echo.
echo 1. Open your browser:
echo    https://master.d564kvq3much7.amplifyapp.com
echo.
echo 2. Test with demo certificate IDs shown above
echo.
echo 3. Or submit a new claim to create fresh data
echo.

pause
