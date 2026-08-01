const radians = value => value * Math.PI / 180;
export const haversineDistance = (a, b) => {
  if (!a || !b) return 0;
  const earth = 6371000; const dLat = radians(b.latitude - a.latitude); const dLon = radians(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
};
