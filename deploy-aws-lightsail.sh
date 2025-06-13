#!/bin/bash

echo "☁️ Deploying to AWS Lightsail"
echo "============================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "🔧 Building Docker image..."
docker build -f Dockerfile.railway -t online-banking-system .

echo "🏷️ Tagging image for AWS..."
docker tag online-banking-system:latest online-banking-system:lightsail

echo "📦 Creating deployment package..."
mkdir -p lightsail-deployment
cp docker-compose.yml lightsail-deployment/
cp .env.example lightsail-deployment/.env

echo "⚙️ Creating Lightsail container service..."
aws lightsail create-container-service \
    --service-name online-banking \
    --power small \
    --scale 1

echo "🚀 Deploying to Lightsail..."
aws lightsail create-container-service-deployment \
    --service-name online-banking \
    --containers '{
        "banking-app": {
            "image": "online-banking-system:lightsail",
            "ports": {
                "8080": "HTTP"
            },
            "environment": {
                "SPRING_PROFILES_ACTIVE": "production",
                "JWT_SECRET": "'$(openssl rand -base64 64 | tr -d '\n')'",
                "MYSQL_DATABASE": "online_banking",
                "MYSQL_USER": "banking_user",
                "MYSQL_PASSWORD": "bankingpass123"
            }
        }
    }' \
    --public-endpoint '{
        "containerName": "banking-app",
        "containerPort": 8080,
        "healthCheck": {
            "path": "/api/actuator/health"
        }
    }'

echo ""
echo "🎉 AWS Lightsail deployment initiated!"
echo "📋 Next steps:"
echo "1. Wait for deployment to complete (5-10 minutes)"
echo "2. Get your public URL: aws lightsail get-container-services --service-name online-banking"
echo "3. Update frontend environment with the Lightsail URL"
echo "4. Deploy frontend to Vercel"
echo ""
echo "🔧 Useful AWS Lightsail commands:"
echo "   aws lightsail get-container-services --service-name online-banking"
echo "   aws lightsail get-container-service-deployments --service-name online-banking"
