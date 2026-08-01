import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { haversineDistance } from '../utils/distanceUtils';
import { KMH_PER_MPS, smoothSpeed } from '../utils/speedUtils';
import { saveTrip } from '../utils/storageUtils';
const TripContext = createContext(null);
const initial = { speed: 0, maxSpeed: 0, distance: 0, movingSeconds: 0, route: [], location: null, accuracy: null, status: { type: 'searching', text: 'Searching for GPS' }, active: false, paused: false };
export function TripProvider({ children }) {
  const [trip, setTrip] = useState(initial); const [unit, setUnit] = useState('km/h'); const [showAccuracy, setShowAccuracy] = useState(true); const [vibration, setVibration] = useState(true); const subscription = useRef(null); const previous = useRef(null); const lastTime = useRef(null); const tripRef = useRef(initial);
  useEffect(() => { tripRef.current = trip; }, [trip]);
  const stopWatcher = () => { subscription.current?.remove(); subscription.current = null; };
  const requestAndWatch = async () => {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) { setTrip(t => ({ ...t, status: { type: 'unavailable', text: 'Location services are off' } })); return false; }
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) { setTrip(t => ({ ...t, status: { type: 'denied', text: 'Location permission denied' } })); return false; }
    stopWatcher();
    subscription.current = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Highest, timeInterval: 1000, distanceInterval: 1 }, onLocation);
    return true;
  };
  const onLocation = location => {
    const coords = location.coords; const accuracy = coords.accuracy; const now = location.timestamp || Date.now();
    if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) return;
    const weak = !Number.isFinite(accuracy) || accuracy > 35;
    let raw = Number.isFinite(coords.speed) && coords.speed >= 0 ? coords.speed * KMH_PER_MPS : null;
    if (raw !== null && raw < 1.2) raw = 0;
    const point = { latitude: coords.latitude, longitude: coords.longitude };
    setTrip(current => {
      const speed = raw === null ? 0 : smoothSpeed(current.speed, raw);
      let distance = current.distance, route = current.route, movingSeconds = current.movingSeconds;
      const jump = previous.current ? haversineDistance(previous.current, point) : 0;
      const elapsed = lastTime.current ? Math.min((now - lastTime.current) / 1000, 3) : 0;
      if (current.active && !current.paused && !weak && jump < 120) {
        if (jump >= 2) { distance += jump; route = [...route, point]; }
        if (speed > 1.2) movingSeconds += elapsed;
      }
      previous.current = point; lastTime.current = now;
      return { ...current, speed, distance, route, movingSeconds, location: point, accuracy, maxSpeed: current.active && !current.paused ? Math.max(current.maxSpeed, speed) : current.maxSpeed, status: { type: weak ? 'weak' : 'connected', text: weak ? 'Weak GPS signal' : 'GPS connected' } };
    });
  };
  const start = async () => { setTrip({ ...initial, active: true, status: { type: 'searching', text: 'Searching for GPS' } }); previous.current = null; lastTime.current = null; if (await requestAndWatch()) vibration && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); };
  const pause = () => setTrip(t => ({ ...t, paused: true, speed: 0 }));
  const resume = () => { previous.current = null; lastTime.current = null; setTrip(t => ({ ...t, paused: false })); };
  const stop = async () => { const finished = tripRef.current; stopWatcher(); if (finished.active && finished.distance > 0) await saveTrip({ id: String(Date.now()), date: new Date().toISOString(), duration: finished.movingSeconds, distance: finished.distance, maxSpeed: finished.maxSpeed, averageSpeed: finished.movingSeconds ? finished.distance / finished.movingSeconds * 3.6 : 0, route: finished.route }); setTrip({ ...initial, location: finished.location, status: { type: 'searching', text: 'Trip saved. Start when ready' } }); };
  useEffect(() => () => stopWatcher(), []);
  return <TripContext.Provider value={{ trip, unit, setUnit, showAccuracy, setShowAccuracy, vibration, setVibration, start, pause, resume, stop, requestAndWatch }}>{children}</TripContext.Provider>;
}
export const useTrip = () => useContext(TripContext);
