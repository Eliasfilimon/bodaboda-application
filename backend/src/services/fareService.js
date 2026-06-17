import { calculateDistance } from "./distanceService.js";

export const calculateFare = (pickupCoords, dropoffCoords, riderRating = 4.5) => {
  const distance = calculateDistance(pickupCoords, dropoffCoords);
  const baseFare = 500;
  const distanceCharge = Math.round(distance * 300);
  const riderFee = Math.round(Number(riderRating) * 120);
  const totalFare = baseFare + distanceCharge + riderFee;

  return {
    baseFare,
    distanceCharge,
    riderFee,
    distance: Math.round(distance * 100) / 100,
    totalFare,
  };
};

