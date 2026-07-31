export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remaining = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${remaining}`;
}

// Haversine gives the straight-line distance between two GPS coordinates in metres.
export function distanceBetween(first, second) {
  if (!first || !second) return 0;
  const toRadians = (number) => (number * Math.PI) / 180;
  const earthRadius = 6371000;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(first.latitude)) * Math.cos(toRadians(second.latitude))
    * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Simple activity estimate: about 0.75 kcal per kg per walking/running kilometre.
export function estimateCalories(distanceKm, weightKg) {
  const distance = Math.max(0, Number(distanceKm) || 0);
  const weight = Math.max(0, Number(weightKg) || 0);
  return Math.max(0, distance * weight * 0.75);
}
