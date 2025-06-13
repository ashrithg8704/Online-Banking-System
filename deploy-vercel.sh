#!/bin/bash

echo "▲ Deploying Frontend to Vercel"
echo "==============================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

# Navigate to frontend directory
cd frontend

echo "🔧 Installing dependencies..."
npm install

echo "🏗️ Building application..."
npm run build

echo "⚙️ Setting up environment variables..."
echo "Please enter your Railway backend URL (e.g., https://your-app.railway.app):"
read -p "Backend URL: " BACKEND_URL

# Set environment variable for Vercel
vercel env add VITE_API_BASE_URL production <<< "$BACKEND_URL/api"

echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Frontend deployment completed!"
echo "📋 Your application is now live!"
echo ""
echo "🔧 Useful Vercel commands:"
echo "   vercel logs     - View deployment logs"
echo "   vercel domains  - Manage custom domains"
echo "   vercel env      - Manage environment variables"
