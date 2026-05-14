#!/bin/bash
# Quick Start Guide for Boda Boda Digital

echo "🚀 Boda Boda Digital - Quick Start"
echo "===================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node &>/dev/null && echo "✅ Node.js $(node -v)" || echo "❌ Node.js not installed"
command -v npm &>/dev/null && echo "✅ npm $(npm -v)" || echo "❌ npm not installed"
command -v psql &>/dev/null && echo "✅ PostgreSQL $(psql --version | awk '{print $NF}')" || echo "❌ PostgreSQL not installed"
command -v pg_isready &>/dev/null && pg_isready -h localhost -p 5432 >/dev/null 2>&1 && echo "✅ PostgreSQL running" || echo "⚠️  PostgreSQL not responding"

echo ""
echo "🏃 To start the application:"
echo "  1. Start Frontend (Port 5173):"
echo "     cd /home/elly23/Desktop/boda\ boda\ digital"
echo "     npm run dev"
echo ""
echo "  2. Start Backend (Port 5000):"
echo "     cd /home/elly23/Desktop/boda\ boda\ digital/backend"
echo "     npm run dev"
echo ""

echo "🧪 Testing:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend Health: curl http://localhost:5000/health"
echo "  - API Root: http://localhost:5000"
echo "  - Prometheus Metrics: http://localhost:5000/metrics"
echo ""

echo "📚 Documentation:"
echo "  - Setup Guide: /home/elly23/Desktop/boda\ boda\ digital/BACKEND_SETUP.md"
echo "  - Readiness Check: /home/elly23/Desktop/boda\ boda\ digital/BACKEND_READINESS.md"
echo "  - Completion Report: /home/elly23/Desktop/boda\ boda\ digital/BACKEND_COMPLETION.md"
echo ""

echo "✨ Happy coding!"
