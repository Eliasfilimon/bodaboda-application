# BodaBoda Digital 🏍️

A real-time ride-hailing application for Dodoma, Tanzania.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express, Sequelize ORM |
| Database | PostgreSQL 16 |
| Real-time | MQTT (Mosquitto), Socket.IO |
| Monitoring | Prometheus + Grafana |
| CI/CD | GitHub Actions |
| Containers | Docker + Docker Compose |

## Quick Start

```bash
cd bodaboda-application-main
./docker.sh dev       # Development mode
./docker.sh up        # Production mode
./docker.sh down      # Stop all services
```

## Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5174 |
| Backend API | http://localhost:5000 |
| API Docs (Swagger) | http://localhost:5000/api-docs |
| Grafana Dashboard | http://localhost:3010 |
| Prometheus | http://localhost:9092 |
| MQTT Broker | mqtt://localhost:1883 |

## Environment Setup

Copy and fill in the env files:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

## CI/CD Pipeline

Three GitHub Actions workflows:
- **`main-assignment.yml`** — Test → Build → Push to Docker Hub → Deploy to Production (on `main` push or version tag)
- **`deploy-staging.yml`** — Test → Build → Push Staging image → Deploy to Staging (on `develop` push)
- **`ci.yml`** — Lint, Unit Tests & MQTT Integration Test (on all branches)

Required GitHub Secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`

## Accounts (Development)

```
Passenger: any phone number → auto-registered
Rider: any phone number → auto-registered
Admin: phone must exist in DB with role = admin
```
