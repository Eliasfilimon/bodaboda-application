import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  riderId: { type: DataTypes.INTEGER, allowNull: true },
  type: { type: DataTypes.ENUM('success','info','alert','warning'), defaultValue: 'info' },
  title: { type: DataTypes.STRING(120), allowNull: false },
  body: { type: DataTypes.STRING(500), allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  tripId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'notifications', timestamps: true });

export default Notification;
