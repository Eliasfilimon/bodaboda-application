#!/bin/bash

# BodaBoda Digital Setup Script
# This script sets up the environment for local development

set -e

echo "==================================="
echo "BodaBoda Digital Setup"
echo "==================================="
echo ""

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change_this_secret_key_in_production")

echo "Setting up environment configuration..."

# Setup Frontend .env
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
EOF
    echo "✅ Frontend .env created"
else
    echo "✅ Frontend .env already exists"
fi

# Setup Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > backend/.env << EOF
PORT=5000
NODE_ENV=development
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
EOF
    echo "✅ Backend .env created (using SQLite for development)"
else
    echo "✅ Backend .env already exists"
    echo "💡 For development, ensure DATABASE_URL is not set to use SQLite"
fi

echo ""
echo "==================================="
echo "Environment Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo ""
echo "Quick Start (Recommended):"
echo "1. Start backend (in terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Start frontend (in terminal 2):"
echo "   npm run dev"
echo ""
echo "The application uses SQLite for development (no database setup required)"
echo ""
echo "Option 2: Docker with PostgreSQL"
echo "1. Start all services:"
echo "   ./docker.sh dev"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:5173 (dev) or http://localhost:8080 (docker)"
echo "- Backend API: http://localhost:5000"
echo "- Grafana Dashboard: http://localhost:3004 (docker only)"
echo ""