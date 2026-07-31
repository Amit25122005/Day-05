import { useEffect, useRef, useState } from 'react';
import { Pedometer } from 'expo-sensors';

export function usePedometer(isTracking) {
  const [steps, setSteps] = useState(0);
  const [available, setAvailable] = useState(null);
  const [error, setError] = useState('');
  const subscription = useRef(null);
  const sessionStartSteps = useRef(0);
  useEffect(() => {
    let active = true;
    async function watch() {
      try {
        const supported = await Pedometer.isAvailableAsync();
        if (!active) return;
        setAvailable(supported);
        if (!supported) { setError('Step counting is not available on this device.'); return; }
        if (isTracking) {
          sessionStartSteps.current = steps;
          subscription.current = Pedometer.watchStepCount((result) => setSteps(sessionStartSteps.current + Math.max(0, result.steps || 0)));
        }
      } catch (caught) { if (active) setError('Unable to access the step sensor.'); }
    }
    watch();
    return () => { active = false; subscription.current?.remove(); subscription.current = null; };
  }, [isTracking]);
  return { steps, available, error, resetSteps: () => setSteps(0) };
}
