import User from './User.js';
import Rider from './Rider.js';
import Trip from './Trip.js';
import Notification from './Notification.js';

export const setupAssociations = () => {
  Trip.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
  Trip.belongsTo(Rider, { foreignKey: 'riderId', as: 'rider' });
  User.hasMany(Trip, { foreignKey: 'customerId', as: 'trips' });
  Rider.hasMany(Trip, { foreignKey: 'riderId', as: 'trips' });
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
  Rider.hasMany(Notification, { foreignKey: 'riderId', as: 'notifications' });
};

export { User, Rider, Trip, Notification };
