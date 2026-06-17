# Boda Boda Digital - Business Logic Documentation

## Overview
Boda Boda Digital is a ride-hailing platform specifically designed for motorcycle taxis (boda bodas) in Dodoma, Tanzania. The platform connects customers with riders, providing real-time tracking, fare estimation, and trip management capabilities.

## Core Domain Model

### User Types
The platform supports two primary user types:

1. **Customers** - People who request rides
2. **Riders** - Motorcycle taxi drivers who provide rides

### Key Entities

#### 1. User (Customer)
**Purpose**: Represents customers who request rides

**Attributes**:
- `id`: Primary key
- `name`: Full name (required)
- `phone`: Phone number (unique, required) - Tanzanian format validation
- `email`: Email address (unique, optional)
- `defaultLocation`: Default pickup location (default: "Dodoma CBD")
- `paymentMethods`: Array of payment methods (default: [])
- `provider`: Authentication provider ('local' or 'google')
- `googleId`: Google OAuth ID (for Google authentication)

**Business Rules**:
- Phone numbers must be in Tanzanian format (+2557XXXXXXXX or 07XXXXXXXX)
- Users can authenticate via local registration or Google OAuth
- Default location is Dodoma CBD for new users

#### 2. Rider
**Purpose**: Represents motorcycle taxi drivers

**Attributes**:
- `id`: Primary key
- `name`: Full name (required)
- `phone`: Phone number (unique, required)
- `location`: Current location description (default: "Dodoma CBD")
- `coordinates`: GPS coordinates (lat/lng, default: Dodoma CBD coordinates)
- `status`: Current availability status ('online', 'offline', 'on_trip')
- `rating`: Average customer rating (default: 4.5, scale: 0-5)
- `trips`: Total completed trips count (default: 0)
- `vehicleInfo`: Vehicle details (plateNumber, model)
- `earnings`: Total earnings in TZS (default: 0.00)

**Business Rules**:
- Riders start with a default rating of 4.5
- Riders can toggle between online/offline status
- When a rider accepts a trip, status changes to 'on_trip'
- Riders earn 80% of trip fare (platform keeps 20%)
- Rating is updated based on customer feedback

#### 3. Trip
**Purpose**: Represents ride requests and their lifecycle

**Attributes**:
- `id`: Primary key
- `customerId`: Foreign key to User (required)
- `riderId`: Foreign key to Rider (optional until accepted)
- `pickup`: Pickup location description (required)
- `pickupCoords`: Pickup GPS coordinates (required)
- `dropoff`: Dropoff location description (required)
- `dropoffCoords`: Dropoff GPS coordinates (required)
- `fare`: Calculated fare amount in TZS (required)
- `status`: Trip status ('pending', 'in_progress', 'completed', 'cancelled')
- `paymentMethod`: Payment method ('Cash', 'M-Pesa', 'Tigo Pesa', 'Airtel Money')
- `paymentStatus`: Payment status ('pending', 'paid')
- `rating`: Customer rating (1-5, optional)
- `review`: Customer review text (optional)
- `requestedAt`: Timestamp when trip was requested
- `acceptedAt`: Timestamp when rider accepted trip
- `completedAt`: Timestamp when trip was completed

**Business Rules**:
- Trip status flows: pending → in_progress → completed/cancelled
- Payment is marked as 'paid' when trip is completed
- Only completed trips can be rated
- Trips can be cancelled before completion

## Business Logic & Algorithms

### Fare Calculation
**Formula**:
```
Total Fare = Base Fare + Distance Charge + Rider Fee

Where:
- Base Fare = 500 TZS
- Distance Charge = Distance (km) × 300 TZS
- Rider Fee = Rider Rating × 120 TZS
```

**Example**:
- Distance: 2.5 km
- Rider Rating: 4.8
- Fare = 500 + (2.5 × 300) + (4.8 × 120) = 500 + 750 + 576 = 1,826 TZS

### Rider Earnings
**Formula**:
```
Rider Earnings = Trip Fare × 0.80
Platform Commission = Trip Fare × 0.20
```

**Example**:
- Trip Fare: 1,826 TZS
- Rider Earnings: 1,826 × 0.80 = 1,460.8 TZS
- Platform Commission: 1,826 × 0.20 = 365.2 TZS

### Distance Calculation
**Algorithm**: Haversine Formula for great-circle distance between two points on a sphere

**Implementation**:
```javascript
const R = 6371; // Earth's radius in km
const dLat = toRad(coord2.lat - coord1.lat);
const dLng = toRad(coord2.lng - coord1.lng);

const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
  Math.sin(dLng / 2) * Math.sin(dLng / 2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
return R * c; // Distance in km
```

### Rider Matching
**Algorithm**: Nearest neighbor search using Euclidean distance (simplified for performance)

**Process**:
1. Filter riders by status = 'online'
2. Calculate distance from pickup location to each online rider
3. Select rider with minimum distance
4. Fallback to first available rider if coordinates unavailable

**Geospatial Search**: Backend supports optional geospatial filtering with maxDistance parameter (default: 5000m)

### Rating System
**Algorithm**: Average of all trip ratings for a rider

**Formula**:
```
New Rating = (Sum of all ratings) / (Number of rated trips)
```

**Implementation Details**:
- Ratings are rounded to 1 decimal place
- Only completed trips with ratings are included
- New riders start with default 4.5 rating

## Trip Lifecycle

### 1. Trip Request
- Customer submits pickup/dropoff locations
- System calculates fare estimate
- System identifies nearest available rider
- Trip created with status 'pending'

### 2. Trip Assignment
- Rider accepts trip
- Trip status changes to 'in_progress'
- Rider status changes to 'on_trip'
- acceptedAt timestamp recorded

### 3. Trip Completion
- Rider completes trip
- Trip status changes to 'completed'
- Rider status changes back to 'online'
- Rider earnings updated (+80% of fare)
- completedAt timestamp recorded
- Payment status set to 'paid'

### 4. Trip Rating
- Customer rates completed trip (1-5 stars)
- Optional review text
- Rider's average rating recalculated
- Trip updated with rating and review

### 5. Trip Cancellation
- Trip can be cancelled if status is 'pending' or 'in_progress'
- Cannot cancel completed trips
- If rider was assigned, rider status returns to 'online'
- Trip status set to 'cancelled'

## Payment Methods
The platform supports Tanzanian mobile payment methods:
- **Cash** - Physical cash payment
- **M-Pesa** - Vodacom mobile money
- **Tigo Pesa** - Tigo mobile money
- **Airtel Money** - Airtel mobile money

## Geographic Context
- **Primary Location**: Dodoma, Tanzania
- **Default Coordinates**: -6.1722, 35.7395 (Dodoma CBD)
- **Supported Locations**: Pre-defined list of Dodoma locations with coordinates
- **External Geocoding**: Integration with Photon API for location suggestions

## Authentication & Security

### Customer Authentication
- **Local**: Phone number-based registration/login
- **Google OAuth**: Alternative authentication method
- **JWT Tokens**: 7-day expiration
- **Storage**: localStorage for token and user data

### Rider Authentication
- **Phone Number**: Primary identifier
- **JWT Tokens**: 7-day expiration
- **Authorization**: Role-based access control (Rider vs Customer)

### Security Features
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- JWT verification on protected routes

## Real-time Features

### Socket.io Events
**Client → Server**:
- `join_trip` - Join a trip room for updates
- `leave_trip` - Leave a trip room
- `join_rider` - Join a rider room
- `join_user` - Join a user room
- `rider_location_update` - Send rider GPS updates
- `trip_status_update` - Send trip status updates

**Server → Client**:
- `rider_location_update` - Receive rider location updates
- `trip_status_update` - Receive trip status updates

## Monitoring & Metrics
- **Prometheus**: HTTP request duration, request counts
- **Grafana**: Pre-configured dashboard for Boda Boda Digital metrics
- **Custom Metrics**: Active trips count, online riders count

## Technical Architecture

### Frontend
- **React 19** + **Vite**
- **React Router** for navigation
- **Context API** for state management
- **Leaflet** for interactive maps
- **Tailwind CSS** for styling

### Backend
- **Node.js** + **Express**
- **PostgreSQL** + **Sequelize ORM**
- **Socket.io** for real-time features
- **JWT** for authentication
- **Prometheus** for metrics

### Deployment
- **Docker** & **Docker Compose**
- **Nginx** as reverse proxy
- **Health check endpoints**
- **Database retry logic**

## Key Business Insights

1. **Local Focus**: Platform is specifically designed for Dodoma, Tanzania with local payment methods and geographic data

2. **Fair Pricing**: Transparent fare calculation with base fare, distance-based pricing, and quality-based rider fees

3. **Rider Incentives**: Riders keep 80% of fares, encouraging quality service and platform participation

4. **Quality Control**: Rating system ensures accountability and helps customers make informed choices

5. **Flexible Operations**: Riders can toggle availability, and customers can cancel trips before completion

6. **Real-time Experience**: Socket.io enables live tracking and status updates for better user experience

7. **Mobile-First Design**: Responsive design optimized for mobile devices, given the target market

8. **Scalable Architecture**: Docker-based deployment with monitoring ready for production scaling

## Future Enhancement Areas
- Payment gateway integration for actual mobile money transactions
- SMS notifications for trip updates
- Admin dashboard for association management
- Rider earnings withdrawal system
- Multi-language support (Swahili)
- Offline support (PWA capabilities)
- Advanced geospatial features with PostGIS
