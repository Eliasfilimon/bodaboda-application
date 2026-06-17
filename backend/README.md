# Boda Boda Digital Backend

Backend API for the Boda Boda Digital ride-hailing application.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Real-time**: Socket.io
- **Authentication**: JWT + Google OAuth
- **Validation**: Joi

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bodaboda
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=development
```

4. Start PostgreSQL (if running locally):
```bash
# Ensure PostgreSQL is running and the database exists
# You can create the database with:
# createdb bodaboda
```

5. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user (requires auth)

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (requires auth)
- `POST /api/users/:id/payment-methods` - Add payment method (requires auth)

### Riders

- `GET /api/riders` - Get all riders
- `GET /api/riders/online` - Get online riders (supports lat/lng query params for geospatial search)
- `GET /api/riders/:id` - Get rider profile
- `PUT /api/riders/:id/status` - Update rider status (online/offline)
- `PUT /api/riders/:id/location` - Update rider location

### Trips

- `POST /api/trips` - Request a ride (requires auth)
- `GET /api/trips/:id` - Get trip details
- `GET /api/trips/user/:userId` - Get user's trips
- `GET /api/trips/rider/:riderId` - Get rider's trips
- `PUT /api/trips/:id/accept` - Accept trip (rider)
- `PUT /api/trips/:id/complete` - Complete trip (rider)
- `PUT /api/trips/:id/cancel` - Cancel trip (requires auth)

## Socket.io Events

### Client → Server

- `join_trip` - Join a trip room
- `leave_trip` - Leave a trip room
- `join_rider` - Join a rider room
- `join_user` - Join a user room
- `rider_location_update` - Send rider GPS updates
- `trip_status_update` - Send trip status updates

### Server → Client

- `rider_location_update` - Receive rider location updates
- `trip_status_update` - Receive trip status updates

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js          # PostgreSQL connection (Sequelize)
│   │   └── socket.js      # Socket.io configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── riderController.js
│   │   └── tripController.js
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   ├── models/
│   │   ├── User.js
│   │   ├── Rider.js
│   │   └── Trip.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── riders.js
│   │   └── trips.js
│   └── app.js             # Main application file
├── .env                   # Environment variables
├── package.json
└── README.md
```

## Database Models

### User
- name, phone, email
- defaultLocation
- paymentMethods (array)
- provider (local/google)
- googleId

### Rider
- name, phone
- location, coordinates (lat/lng)
- status (online/offline/on_trip)
- rating, trips
- vehicleInfo (plateNumber, model)
- earnings

### Trip
- customerId, riderId
- pickup, pickupCoords
- dropoff, dropoffCoords
- fare, status
- paymentMethod, paymentStatus
- requestedAt, acceptedAt, completedAt

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Development

The API runs on port 5000 by default. Socket.io is enabled on the same port.

## Notes

- The backend is PostgreSQL/Sequelize-based.
- Use `DATABASE_URL`, not `MONGODB_URI`.

## License

ISC
