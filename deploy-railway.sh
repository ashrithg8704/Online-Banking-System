#!/bin/bash

echo "🚂 Deploying Online Banking System to Railway"
echo "============================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    railway login
fi

echo "🔧 Setting up Railway project..."

# Create new Railway project
railway init

echo "🗄️ Adding MySQL database..."
railway add --database mysql

echo "⚙️ Setting environment variables..."

# Set environment variables
railway variables set SPRING_PROFILES_ACTIVE=production
railway variables set JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
railway variables set DAILY_TRANSFER_LIMIT=10000.00
railway variables set HOURLY_TRANSFER_LIMIT=15000.00
railway variables set NEW_ACCOUNT_LIMIT=5000.00
railway variables set FRAUD_DETECTION_ENABLED=true

echo "🚀 Deploying application..."
railway up

echo "🌐 Getting deployment URL..."
RAILWAY_URL=$(railway domain)

echo ""
echo "🎉 Deployment completed!"
echo "📋 Next steps:"
echo "1. Your backend is deployed at: $RAILWAY_URL"
echo "2. Update frontend/.env with: VITE_API_BASE_URL=$RAILWAY_URL/api"
echo "3. Deploy frontend to Vercel using deploy-vercel.sh"
echo ""
echo "🔧 Useful Railway commands:"
echo "   railway logs    - View application logs"
echo "   railway status  - Check deployment status"
echo "   railway shell   - Access application shell"
