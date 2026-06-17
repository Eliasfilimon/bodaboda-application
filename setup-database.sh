#!/bin/bash

# BodaBoda Digital Database Setup Script
# This script creates the PostgreSQL database and user locally

set -e

echo "==================================="
echo "BodaBoda Digital Database Setup"
echo "==================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first:"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    sudo systemctl start postgresql
    sleep 2
fi

echo "✅ PostgreSQL is running"
echo ""

# Database configuration
DB_NAME="bodaboda"
DB_USER="bodaboda_user"
DB_PASSWORD="bodaboda123"

echo "Creating database: $DB_NAME"
echo "Creating user: $DB_USER"
echo ""

# Create database and user
sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;

EOF

echo "✅ Database created successfully!"
echo ""

# Update backend .env file
ENV_FILE="backend/.env"
if [ -f "$ENV_FILE" ]; then
    echo "📝 Updating backend/.env file..."
    
    # Backup original
    cp "$ENV_FILE" "$ENV_FILE.backup"
    
    # Update DATABASE_URL
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME|" "$ENV_FILE"
    
    echo "✅ Updated $ENV_FILE"
    echo ""
fi

echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo "Next steps:"
echo "1. cd backend"
echo "2. npm install (if not done)"
echo "3. npm run create-db  # Create tables"
echo "4. npm run dev        # Start server"
echo ""
echo "Or use Docker Compose:"
echo "  docker compose -f docker-compose.yml up --build"
