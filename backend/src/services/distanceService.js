export const toRadians = (degrees) => degrees * (Math.PI / 180);

export const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;

  const source = Array.isArray(coord1)
    ? { lat: Number(coord1[0]), lng: Number(coord1[1]) }
    : { lat: Number(coord1.lat), lng: Number(coord1.lng) };

  const target = Array.isArray(coord2)
    ? { lat: Number(coord2[0]), lng: Number(coord2[1]) }
    : { lat: Number(coord2.lat), lng: Number(coord2.lng) };

  const R = 6371;
  const dLat = toRadians(target.lat - source.lat);
  const dLng = toRadians(target.lng - source.lng);

  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(source.lat)) * Math.cos(toRadians(target.lat))
    * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateHaversineDistanceMeters = (coord1, coord2) => calculateDistance(coord1, coord2) * 1000;

