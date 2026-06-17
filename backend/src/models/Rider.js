import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Rider = sequelize.define('Rider', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: 'Dodoma CBD'
  },
  coordinates: {
    type: DataTypes.JSONB,
    defaultValue: { lat: -6.1722, lng: 35.7395 }
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'on_trip'),
    defaultValue: 'offline'
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 4.5
  },
  trips: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  vehicleInfo: {
    type: DataTypes.JSONB,
    defaultValue: { plateNumber: '', model: 'Motorcycle' }
  },
  earnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  isIdentityVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isLicenseValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  hasInsurance: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPhoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'riders',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['phone'] },
    { fields: ['status'] }
  ]
});

export default Rider;
