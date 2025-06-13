#!/bin/bash

echo "🏦 Online Banking System Setup"
echo "=============================="

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL is not installed or not in PATH. Please ensure MySQL is installed and running."
fi

echo "✅ Prerequisites check completed"
echo ""

# Setup backend
echo "🔧 Setting up backend..."
if [ -f "pom.xml" ]; then
    mvn clean install -q
    if [ $? -eq 0 ]; then
        echo "✅ Backend dependencies installed successfully"
    else
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
else
    echo "❌ pom.xml not found. Please run this script from the project root directory."
    exit 1
fi

# Setup frontend
echo "🔧 Setting up frontend..."
if [ -d "frontend" ]; then
    cd frontend
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Frontend dependencies installed successfully"
        cd ..
    else
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "❌ Frontend directory not found"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MySQL is running"
echo "2. Update database credentials in src/main/resources/application.yml"
echo "3. Start the backend: mvn spring-boot:run"
echo "4. In another terminal, start the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080/api"
echo ""
echo "👤 Default accounts:"
echo "   Admin: admin / admin123"
echo "   Demo User: demo / demo123"
