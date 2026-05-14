import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  riderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'riders',
      key: 'id'
    }
  },
  pickup: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pickupCoords: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: { lat: -6.1722, lng: 35.7395 }
  },
  dropoff: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dropoffCoords: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: { lat: -6.1722, lng: 35.7395 }
  },
  fare: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('Cash', 'M-Pesa', 'Tigo Pesa', 'Airtel Money'),
    defaultValue: 'Cash'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid'),
    defaultValue: 'pending'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'trips',
  timestamps: true,
  indexes: [
    { fields: ['customerId'] },
    { fields: ['riderId'] },
    { fields: ['status'] }
  ]
});

export default Trip;
