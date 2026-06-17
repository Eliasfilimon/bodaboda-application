import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
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
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  defaultLocation: {
    type: DataTypes.STRING,
    defaultValue: 'Dodoma CBD'
  },
  paymentMethods: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  provider: {
    type: DataTypes.ENUM('local', 'google'),
    defaultValue: 'local'
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['phone'] },
    { unique: true, fields: ['email'] }
  ]
});

export default User;
