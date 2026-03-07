@echo off
echo ========================================
echo Deploying Fixed Lambda Functions
echo ========================================
echo.

echo Step 1: Creating deployment packages...
cd scripts

echo Creating certificate-verifier package...
if exist certificate-verifier-package rmdir /s /q certificate-verifier-package
mkdir certificate-verifier-package
copy certificate-verifier-inline.js certificate-verifier-package\index.js
cd certificate-verifier-package
call npm init -y
call npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
powershell -Command "Compress-Archive -Path * -DestinationPath ../certificate-verifier.zip -Force"
cd ..

echo.
echo Creating bridge-loan-calculator package...
if exist bridge-loan-package rmdir /s /q bridge-loan-package
mkdir bridge-loan-package
copy bridge-loan-calculator-inline.js bridge-loan-package\index.js
cd bridge-loan-package
call npm init -y
call npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb uuid
powershell -Command "Compress-Archive -Path * -DestinationPath ../bridge-loan-calculator.zip -Force"
cd ..

echo.
echo Step 2: Updating Lambda functions...
echo Updating certificate-verifier...
aws lambda update-function-code --function-name vericrop-certificate-verifier --zip-file fileb://certificate-verifier.zip --region ap-south-1

echo.
echo Updating bridge-loan-calculator...
aws lambda update-function-code --function-name vericrop-bridge-loan-calculator --zip-file fileb://bridge-loan-calculator.zip --region ap-south-1

echo.
echo Step 3: Updating environment variables...
aws lambda update-function-configuration --function-name vericrop-certificate-verifier --environment "Variables={TABLE_NAME=VeriCropClaims}" --region ap-south-1
aws lambda update-function-configuration --function-name vericrop-bridge-loan-calculator --environment "Variables={TABLE_NAME=VeriCropClaims}" --region ap-south-1

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Testing endpoints...
echo.

cd ..
pause
