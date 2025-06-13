#!/bin/bash

echo "🏦 Starting Online Banking System with Docker"
echo "============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "🔧 Building and starting services..."
docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Online Banking System started successfully!"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8080/api"
    echo "   Health Check: http://localhost:8080/api/actuator/health"
    echo ""
    echo "👤 Default accounts:"
    echo "   Admin: admin / admin123"
    echo "   Demo User: demo / demo123"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo ""
    echo "⏳ Please wait a few moments for all services to fully start..."
else
    echo "❌ Failed to start services. Check the logs with: docker-compose logs"
    exit 1
fi
