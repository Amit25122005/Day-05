import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = '@real_speedometer_history';
export const loadTrips = async () => JSON.parse((await AsyncStorage.getItem(KEY)) || '[]');
export const saveTrip = async trip => { const all = await loadTrips(); await AsyncStorage.setItem(KEY, JSON.stringify([trip, ...all])); };
export const deleteTrip = async id => { const all = await loadTrips(); await AsyncStorage.setItem(KEY, JSON.stringify(all.filter(t => t.id !== id))); };
export const clearTrips = () => AsyncStorage.removeItem(KEY);
