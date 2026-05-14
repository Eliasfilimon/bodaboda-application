#!/bin/bash

# Docker helper script for Boda Boda Digital

set -e

case "$1" in
  "up")
    echo "🚀 Starting services in production mode..."
    docker compose -f docker-compose.yml up --build -d
    echo "✅ Services started!"
    echo "📱 Frontend: http://localhost:8080"
    echo "🔌 API: http://localhost:5000"
    ;;
  "dev")
    echo "🚀 Starting services in development mode..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up
    echo "✅ Services started!"
    echo "📱 Frontend: http://localhost:5173"
    echo "🔌 API: http://localhost:5000"
    ;;
  "down")
    echo "🛑 Stopping services..."
    docker compose -f docker-compose.yml down
    ;;
  "logs")
    docker compose -f docker-compose.yml logs -f "${2:-}"
    ;;
  "seed")
    echo "🌱 Seeding database..."
    docker compose -f docker-compose.yml exec backend node scripts/seedData.js
    ;;
  "psql")
    echo "🐘 Opening PostgreSQL console..."
    docker compose -f docker-compose.yml exec database psql -U bodaboda -d bodaboda
    ;;
  "reset")
    echo "🗑️  Resetting all data..."
    docker compose -f docker-compose.yml down -v
    echo "✅ All data cleared. Run './docker.sh up' to start fresh."
    ;;
  "status")
    docker compose -f docker-compose.yml ps
    ;;
  "")
    echo "Usage: ./docker.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up      - Start in production mode (detached)"
    echo "  dev     - Start in development mode (with hot reload)"
    echo "  down    - Stop all services"
    echo "  logs    - View logs (optional: service name)"
    echo "  seed    - Seed database with sample data"
    echo "  psql    - Open PostgreSQL console"
    echo "  reset   - Reset all data and volumes"
    echo "  status  - Show service status"
    ;;
  *)
    echo "Unknown command: $1"
    echo "Run './docker.sh' for usage"
    exit 1
    ;;
esac
