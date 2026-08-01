export const KMH_PER_MPS = 3.6;
export const toUnit = (kmh, unit) => unit === 'mph' ? kmh * 0.621371 : kmh;
export const unitLabel = unit => unit === 'mph' ? 'mph' : 'km/h';
export const formatSpeed = (kmh, unit) => `${Math.round(toUnit(kmh || 0, unit))}`;
export const smoothSpeed = (previous, next, alpha = 0.3) => previous + alpha * (next - previous);
export const formatDuration = seconds => {
  const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = Math.floor(seconds % 60);
  return h ? `${h}h ${m}m` : `${m}:${String(s).padStart(2, '0')}`;
};
export const formatDistance = meters => meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)} m`;
