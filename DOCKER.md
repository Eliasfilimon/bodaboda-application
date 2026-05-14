# Docker Setup Guide

## Quick Start

### Production Mode
```bash
# Build and start all services
docker compose -f docker-compose.yml up --build

# Run in background
docker compose -f docker-compose.yml up -d

# View logs
docker compose -f docker-compose.yml logs -f

# Stop all services
docker compose -f docker-compose.yml down

# Stop and remove volumes (reset database)
docker compose -f docker-compose.yml down -v
```

### Development Mode (with hot reload)
```bash
# Uses the explicit development compose file
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
# Database: localhost:5433
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 8080 (prod) / 5173 (dev) | React app served by Nginx or Vite dev server |
| Backend | 5000 | Node.js API server |
| PostgreSQL | 5433 | Database |

## Environment Variables

Create a `.env` file in the project root:
```env
JWT_SECRET=your_secure_jwt_secret_here
```

## Database Management

```bash
# Access PostgreSQL CLI
docker compose exec postgres psql -U bodaboda -d bodaboda

# Seed sample data
docker compose exec backend node scripts/seedData.js

# Backup database
docker compose exec postgres pg_dump -U bodaboda bodaboda > backup.sql

# Restore database
docker compose exec -T postgres psql -U bodaboda < backup.sql
```

## Troubleshooting

### Health Checks
All services have health checks configured:
```bash
# Check service status
docker compose ps

# View health check logs
docker compose logs backend | grep health
```

### Reset Everything
```bash
docker compose down -v
docker system prune -a
docker compose up --build
```

### Port Conflicts
If ports are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "8081:80"  # Change host port
```
