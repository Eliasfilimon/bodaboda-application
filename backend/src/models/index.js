import User from "./User.js";
import Rider from "./Rider.js";
import Trip from "./Trip.js";

export const setupAssociations = () => {
  User.hasMany(Trip, { foreignKey: "customerId", as: "userTrips" });
  Trip.belongsTo(User, { foreignKey: "customerId", as: "customer" });

  Rider.hasMany(Trip, { foreignKey: "riderId", as: "riderTrips" });
  Trip.belongsTo(Rider, { foreignKey: "riderId", as: "rider" });
};

export { User, Rider, Trip };
