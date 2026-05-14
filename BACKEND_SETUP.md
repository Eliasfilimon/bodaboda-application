# Backend Setup Guide

## Prerequisites

### 1. PostgreSQL Installation
Ensure PostgreSQL is installed and running on your system:

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

**macOS (with Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### 2. Create Database & User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Inside psql:
CREATE DATABASE bodaboda;
CREATE USER bodaboda WITH PASSWORD 'bodaboda_password';
GRANT ALL PRIVILEGES ON DATABASE bodaboda TO bodaboda;
\q
```

## Backend Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# If using local PostgreSQL:
# DATABASE_URL=postgresql://bodaboda:bodaboda_password@localhost:5432/bodaboda
```

### 3. Start Development Server
```bash
npm run dev
```

The server will:
- Connect to PostgreSQL
- Automatically create tables (via Sequelize sync)
- Seed sample data (5 riders, 1 user, 2 trips)
- Start listening on `http://localhost:5000`
- Emit metrics on `http://localhost:5000/metrics` for Prometheus

### 4. Verify Backend is Running
```bash
# Check health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T..."}
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Express server port |
| `NODE_ENV` | development | Environment mode |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `PGHOST` | localhost | Fallback host if no DATABASE_URL |
| `PGPORT` | 5432 | Fallback port |
| `PGDATABASE` | bodaboda | Fallback database name |
| `PGUSER` | postgres | Fallback user |
| `PGPASSWORD` | postgres | Fallback password |
| `JWT_SECRET` | - | **Required**: Generate with `openssl rand -base64 32` |
| `JWT_EXPIRE` | 7d | Token expiration time |
| `CORS_ORIGIN` | http://localhost:5173 | Comma-separated allowed origins |

## Database Management

### View Seeded Data
```bash
# Connect to the database
psql postgresql://bodaboda:bodaboda_password@localhost:5432/bodaboda

# List tables
\dt

# View riders
SELECT id, name, phone, location FROM "Riders";

# View users
SELECT id, name, phone FROM "Users";

# View trips
SELECT * FROM "Trips";
```

### Reset Database (Development Only)
```bash
# Delete and recreate
dropdb bodaboda
createdb bodaboda
psql bodaboda < schema.sql  # if schema backup exists
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Riders
- `GET /api/riders` - List all riders
- `GET /api/riders/online` - List online riders
- `GET /api/riders/:id` - Get rider profile
- `PUT /api/riders/:id/status` - Update rider status (online/offline)
- `PUT /api/riders/:id/location` - Update rider coordinates

### Trips
- `POST /api/trips` - Create a new trip request
- `GET /api/trips/user/:userId` - Get user's trips
- `GET /api/trips/rider/:riderId` - Get rider's trips
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id/accept` - Accept trip (rider only)
- `PUT /api/trips/:id/complete` - Complete trip (rider only)
- `PUT /api/trips/:id/cancel` - Cancel trip
- `PUT /api/trips/:id/rate` - Rate completed trip

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/payment-methods` - Add payment method

## Real-Time Events (Socket.io)

Connect to `http://localhost:5000` with Socket.io client:

- `join_trip` - Join a trip room
- `leave_trip` - Leave a trip room
- `rider_location_update` - Broadcast rider location
- `trip_status_update` - Broadcast trip status change

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Ensure PostgreSQL is running: `sudo service postgresql start` (Linux) or `brew services start postgresql` (macOS)

### Port Already in Use
```bash
# Kill process using port 5000
sudo lsof -ti:5000 | xargs kill -9
```

### JWT Secret Not Set
```bash
# Generate a strong secret
openssl rand -base64 32

# Add to .env
JWT_SECRET=<generated-value>
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` generated with `openssl rand -base64 32`
3. Set `PGSSLMODE=require` for remote PostgreSQL
4. Configure `CORS_ORIGIN` for your frontend domain
5. Use Docker Compose: `docker-compose up -d`

See [DOCKER.md](../DOCKER.md) for containerization details.
