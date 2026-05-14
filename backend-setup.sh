#!/bin/bash
# Backend Quick Setup Script for Boda Boda Digital

set -e

echo "🚀 Boda Boda Digital Backend Setup"
echo "===================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found."
    exit 1
fi
echo "✅ npm $(npm -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not installed. Please install PostgreSQL first."
    echo "   Ubuntu/Debian: sudo apt-get install postgresql"
    echo "   macOS: brew install postgresql"
    echo "   Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi
echo "✅ PostgreSQL $(psql --version | awk '{print $NF}')"

# Change to backend directory
cd "$(dirname "$0")/backend" || exit 1

echo ""
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

echo ""
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from template"
    echo ""
    echo "⚠️  Please edit .env with your PostgreSQL credentials:"
    echo "   nano .env"
    echo ""
else
    echo "✅ .env already exists"
fi

echo ""
echo "📂 Checking backend structure..."
test -d "src" && echo "✅ src/ directory found"
test -f "src/app.js" && echo "✅ src/app.js found"
test -f "src/config/db.js" && echo "✅ Database config found"
test -f "src/models" && echo "✅ Models directory found"
test -f "src/controllers" && echo "✅ Controllers directory found"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and ensure PostgreSQL credentials are correct"
echo "2. Ensure PostgreSQL is running"
echo "3. Run: npm run dev"
echo ""
echo "Once running, verify health at: http://localhost:5000/health"
