<div align="center">

# 🏍️ BodaBoda Application

**Fast, safe, and affordable motorcycle taxi rides across Dodoma — powered by real-time matching.**

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

## 📖 Overview

BodaBoda Application is a full-stack ride-sharing platform built for the **Dodoma Bodaboda Association**, connecting passengers with trusted motorcycle taxi riders. The platform provides real-time ride matching, transparent pricing, and a seamless booking experience tailored for Tanzania's urban transport needs.

## ✨ Features

- 🔴 **Real-time ride matching** — connects passengers and riders instantly
- 💰 **Transparent pricing** — clear fare estimates before booking
- 📍 **Live GPS tracking** — track your rider on an interactive map
- 🔐 **Secure authentication** — JWT-based auth for riders and passengers
- 📊 **Admin dashboard** — fleet management, analytics, and driver management
- 🐳 **Docker-ready** — full containerized deployment with Prometheus + Grafana monitoring
- 📱 **Responsive UI** — works seamlessly on mobile and desktop

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL |
| **Auth** | JWT (JSON Web Tokens) |
| **DevOps** | Docker, Docker Compose, Nginx |
| **Monitoring** | Prometheus, Grafana |

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Docker & Docker Compose
- PostgreSQL 15+

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/Eliasfilimon/bodaboda-application.git
cd bodaboda-application

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up --build
```

The app will be available at `http://localhost:3000`

### Manual Setup

```bash
# Install dependencies
npm install

# Set up the database
bash setup-database.sh

# Start development server
npm run dev
```

For full backend setup details, see [BACKEND_SETUP.md](./BACKEND_SETUP.md).

## 📁 Project Structure

```
bodaboda-application/
├── src/                  # React frontend source
├── backend/              # Node.js/Express API
├── grafana/              # Grafana dashboard configs
├── docker-compose.yml    # Production compose
├── docker-compose.dev.yml# Development compose
├── nginx.conf            # Nginx reverse proxy config
└── prometheus.yml        # Monitoring config
```

## 📄 Documentation

- [Backend Setup Guide](./BACKEND_SETUP.md)
- [Docker Deployment](./DOCKER.md)
- [Business Logic](./BUSINESS_LOGIC.md)
- [Backend Readiness Checklist](./BACKEND_READINESS.md)

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">
Built with ❤️ for Dodoma, Tanzania
</div>
