import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { distanceBetween } from '../utils/fitness';

const initial = { speed: 0, maxSpeed: 0, averageSpeed: 0, distanceKm: 0, duration: 0, location: null };

export function useTracking() {
  const [state, setState] = useState(initial);
  const [mode, setMode] = useState('idle');
  const [message, setMessage] = useState('Ready to start');
  const subscription = useRef(null);
  const readings = useRef([]);
  const speedTotal = useRef(0);
  const speedCount = useRef(0);
  const previousLocation = useRef(null);
  const startedAt = useRef(null);
  const elapsedBeforeStart = useRef(0);

  const stopSubscription = () => {
    subscription.current?.remove();
    subscription.current = null;
  };

  const updateDuration = () => {
    if (startedAt.current) {
      setState((old) => ({ ...old, duration: elapsedBeforeStart.current + Math.floor((Date.now() - startedAt.current) / 1000) }));
    }
  };

  useEffect(() => {
    const timer = setInterval(updateDuration, 1000);
    return () => { clearInterval(timer); stopSubscription(); };
  }, []);

  const handleLocation = (next) => {
    const { latitude, longitude, accuracy, speed } = next.coords;
    const coordinates = { latitude, longitude, timestamp: next.timestamp };
    const accuracyIsGood = Number.isFinite(accuracy) && accuracy <= 50;
    const rawSpeed = Number(speed);
    const validSpeed = accuracyIsGood && Number.isFinite(rawSpeed) && rawSpeed >= 0;
    const speedKmh = validSpeed ? Math.max(0, rawSpeed * 3.6) : 0;

    setState((old) => {
      let distanceKm = old.distanceKm;
      if (accuracyIsGood && previousLocation.current) {
        const metres = distanceBetween(previousLocation.current, coordinates);
        const elapsed = Math.max(1, (coordinates.timestamp - previousLocation.current.timestamp) / 1000);
        // Reject a GPS teleport: over 200 m or beyond a generous 43 km/h + tolerance.
        if (Number.isFinite(metres) && metres >= 0 && metres <= 200 && metres <= (12 * elapsed) + 30) distanceKm += metres / 1000;
      }
      if (accuracyIsGood) previousLocation.current = coordinates;
      if (!validSpeed) return { ...old, location: coordinates, distanceKm, speed: 0 };
      readings.current = [...readings.current, speedKmh].slice(-5);
      const smooth = readings.current.reduce((sum, value) => sum + value, 0) / readings.current.length;
      const stationarySpeed = smooth < 1 ? 0 : smooth;
      speedTotal.current += stationarySpeed;
      speedCount.current += 1;
      return { ...old, location: coordinates, distanceKm, speed: stationarySpeed, maxSpeed: Math.max(old.maxSpeed, stationarySpeed), averageSpeed: speedTotal.current / speedCount.current };
    });
    setMessage(!accuracyIsGood ? 'Poor GPS signal — speed is paused until accuracy improves.' : 'Tracking normally');
  };

  const beginWatching = async () => {
    subscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 1500, distanceInterval: 1 },
      handleLocation,
    );
  };

  const start = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setMode('denied'); setMessage('Location permission is needed to measure GPS speed and distance.'); return;
      }
      startedAt.current = Date.now();
      setMode('tracking'); setMessage('Waiting for GPS…');
      await beginWatching();
    } catch (error) { setMode('error'); setMessage('Unable to start GPS tracking. Check that Location is enabled.'); }
  };

  const pause = () => {
    elapsedBeforeStart.current += startedAt.current ? Math.floor((Date.now() - startedAt.current) / 1000) : 0;
    startedAt.current = null; stopSubscription(); setMode('paused'); setMessage('Tracking paused');
  };
  const resume = () => start();
  const reset = () => {
    stopSubscription(); readings.current = []; speedTotal.current = 0; speedCount.current = 0; previousLocation.current = null;
    startedAt.current = null; elapsedBeforeStart.current = 0; setState(initial); setMode('idle'); setMessage('Session reset');
  };
  return { ...state, mode, message, start, pause, resume, reset };
}
