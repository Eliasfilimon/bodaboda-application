# BodaBoda Digital 🏍️

A full-stack web application for a boda boda (motorcycle taxi) association in Dodoma, Tanzania. This platform connects customers with riders, provides real-time tracking, fare estimation, and trip management.

## Features ✨

### For Customers
- **User Registration**: Create account with phone number validation
- **Customer Login**: Sign in with phone number to access rides and history
- **Request Rides**: Book rides with pickup/dropoff locations
- **Real-time Tracking**: Track rider location on interactive map
- **Fare Estimation**: Automatic fare calculation based on distance
- **Trip History**: View past rides and their status
- **Rate Trips**: Rate completed rides and view rider ratings
- **Profile Management**: Update personal details and payment methods

### For Riders
- **Rider Registration**: Register with license plate and vehicle details
- **Rider Dashboard**: View assigned trips, earnings, and statistics
- **Trip Management**: Accept and complete trips
- **Online/Offline Status**: Toggle availability status
- **Earnings Tracking**: Monitor daily and total earnings

### Technical Features
- 🔐 JWT Authentication
- 🗺️ Interactive maps with Leaflet
- 🔄 Real-time updates (Socket.io ready)
- 📱 Responsive mobile-first design
- ✅ Form validation with Tanzanian phone format
- 🐳 Docker support for deployment

## Tech Stack 🛠️

### Frontend
- React 19 + Vite
- React Router DOM
- Tailwind CSS
- Leaflet Maps
- Context API for state management

### Backend
- Node.js + Express
- PostgreSQL + Sequelize
- JWT Authentication
- Socket.io (for real-time features)
- CORS + Helmet security

## Prerequisites 📋

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Quick Start 🚀

### 1. Clone the Repository

```bash
git clone <repository-url>
cd boda-boda-digital
```

### 2. Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your PostgreSQL connection and JWT secret
# DATABASE_URL=postgresql://localhost:5432/bodaboda
# JWT_SECRET=your_secret_key

# Install dependencies
npm install

# Start backend server
npm start
```

Backend will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
# In a new terminal, from project root
cp .env.example .env

# Edit .env with backend URL
# VITE_API_URL=http://localhost:5000/api

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Docker Setup 🐳

### Quick Start with Docker

```bash
# Start all services (production mode)
./docker.sh up

# Or for development with hot reload
./docker.sh dev
```

### Available Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:8080 | React app (production) |
| Frontend Dev | http://localhost:5173 | React app (development) |
| API | http://localhost:5000 | Backend API |
| PostgreSQL | localhost:5433 | Database |

### Docker Commands

```bash
# View all commands
./docker.sh

# Common commands
./docker.sh up      # Start services
./docker.sh dev     # Development mode (uses docker-compose.dev.yml)
./docker.sh logs    # View logs
./docker.sh seed    # Seed database
./docker.sh psql    # Database console
./docker.sh reset   # Reset all data
```

See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

## Environment Variables 🔧

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bodaboda
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

## API Endpoints 📡

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Rider Authentication
- `POST /api/rider-auth/register` - Register new rider
- `POST /api/rider-auth/login` - Login rider
- `GET /api/rider-auth/profile` - Get rider profile

### Users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/payment-methods` - Add payment method

### Riders
- `GET /api/riders` - Get all riders
- `GET /api/riders/online` - Get online riders
- `GET /api/riders/:id` - Get rider details
- `PUT /api/riders/:id/status` - Update rider status
- `PUT /api/riders/:id/location` - Update rider location

### Trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip details
- `GET /api/trips/user/:userId` - Get user's trips
- `GET /api/trips/rider/:riderId` - Get rider's trips
- `PUT /api/trips/:id/accept` - Accept trip (rider)
- `PUT /api/trips/:id/complete` - Complete trip
- `PUT /api/trips/:id/cancel` - Cancel trip
- `PUT /api/trips/:id/rate` - Rate completed trip

## Project Structure 📁

```
boda-boda-digital/
├── src/                      # Frontend source
│   ├── components/          # Reusable components
│   ├── context/            # React Context providers
│   ├── pages/              # Page components
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
├── backend/                 # Backend source
│   ├── src/
│   │   ├── config/        # DB and Socket config
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Sequelize models
│   │   └── routes/        # API routes
│   └── package.json
├── .env.example            # Frontend env template
├── backend/.env.example    # Backend env template
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Frontend Docker image
└── README.md
```

## Form Validation ✅

The application includes comprehensive validation:

- **Phone Numbers**: Tanzanian format (`+2557XXXXXXXX` or `07XXXXXXXX`)
- **Names**: Letters, spaces, hyphens only (2-50 characters)
- **License Plates**: Tanzanian format validation
- **Real-time Feedback**: Errors shown on blur, cleared on input
- **Loading States**: Visual feedback during form submission

## Docker Deployment 🐳

### Build and Run with Docker Compose

```bash
# Copy environment files
cp .env.example .env
cd backend && cp .env.example .env && cd ..

# Build and start all services
docker compose -f docker-compose.yml up --build
```

This will start:
- Frontend on port 8080
- Backend on port 5000
- PostgreSQL on port 5433

### Production Build

```bash
# Frontend production build
npm run build

# Serve built files
npm run preview
```

## Future Enhancements 🚀

- [ ] M-Pesa/Tigo Pesa/Airtel Money payment integration
- [ ] SMS notifications for trip updates
- [ ] Mobile app (React Native)
- [ ] Admin dashboard for association management
- [ ] Rider earnings withdrawal system
- [ ] Multi-language support (Swahili)
- [ ] Offline support (PWA)

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License.

## Support 💬

For support, email support@bodaboda.digital or join our Slack channel.

---

Built with ❤️ for Dodoma Boda Boda Association
