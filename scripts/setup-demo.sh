#!/bin/bash

# VeriCrop FinBridge - Demo Setup Script
# This script sets up everything needed for a working demo

echo "🚀 VeriCrop FinBridge - Demo Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI not found. Installing AWS SDK packages..."
else
    echo "✓ AWS CLI found: $(aws --version)"
fi

echo ""
echo "📦 Installing dependencies..."
cd "$(dirname "$0")"
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

echo ""
echo "🌱 Seeding demo data to DynamoDB..."
node seed-demo-data-to-dynamodb.js

echo ""
echo "🧮 Calculating perfect demo inputs..."
node seed-demo-environment.js

echo ""
echo "=================================="
echo "✅ Demo setup complete!"
echo "=================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Open your browser to: https://master.d564kvq3much7.amplifyapp.com"
echo "2. Test certificate verification with demo certificate IDs"
echo "3. Test bridge loan with demo certificate IDs"
echo "4. Submit new claims with calculated inputs"
echo ""
echo "📖 See DEMO_DATA_GUIDE.md for detailed instructions"
echo ""
