import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useTracking } from './hooks/useTracking';
import { usePedometer } from './hooks/usePedometer';
import { clamp, estimateCalories, formatDuration } from './utils/fitness';
import SpeedGauge from './components/SpeedGauge';
import MetricCard from './components/MetricCard';
import ProgressBar from './components/ProgressBar';

const buzz = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
const Button = ({ title, onPress, variant = 'primary' }) => <TouchableOpacity accessibilityRole="button" style={[styles.button, styles[variant]]} onPress={() => { buzz(); onPress(); }}><Text style={styles.buttonText}>{title}</Text></TouchableOpacity>;

export default function App() {
  const tracking = useTracking();
  const pedometer = usePedometer(tracking.mode === 'tracking');
  const [goal, setGoal] = useState('10000');
  const [profile, setProfile] = useState({ weight: '', height: '', age: '', sex: 'female' });
  const [profileError, setProfileError] = useState('');
  const goalNumber = Math.max(1, Number(goal) || 10000);
  const weight = Number(profile.weight);
  const calories = estimateCalories(tracking.distanceKm, weight);
  const status = tracking.mode === 'denied' || tracking.mode === 'error' ? 'bad' : tracking.mode === 'tracking' && tracking.message === 'Tracking normally' ? 'good' : 'warning';
  const statusColor = status === 'good' ? '#3DDB91' : status === 'bad' ? '#FF6577' : '#F7C948';
  const updateProfile = (key, value) => { setProfile((old) => ({ ...old, [key]: value })); setProfileError(''); };
  const validateProfile = () => {
    if (!(weight >= 25 && weight <= 350) || !(Number(profile.height) >= 80 && Number(profile.height) <= 260) || !(Number(profile.age) >= 10 && Number(profile.age) <= 120)) setProfileError('Enter a realistic weight, height, and age before using this calorie estimate.');
    else setProfileError('Profile looks good — calories update from GPS distance.');
  };
  const reset = () => { tracking.reset(); pedometer.resetSteps(); };

  return <SafeAreaView style={styles.safe}><StatusBar style="light" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>MOTIONTRACK</Text><Text style={styles.title}>Move with purpose.</Text>
    <View style={[styles.status, { borderColor: statusColor }]}><View style={[styles.dot, { backgroundColor: statusColor }]} /><Text style={[styles.statusText, { color: statusColor }]}>{tracking.message}</Text></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>GPS SPEED</Text><View style={styles.center}><SpeedGauge speed={tracking.speed} status={status === 'warning' ? 'warning' : status} /></View>
      <Text style={styles.coordinate}>{tracking.location ? `${tracking.location.latitude.toFixed(5)}, ${tracking.location.longitude.toFixed(5)}` : 'Waiting for GPS…'}</Text>
      <View style={styles.row}><MetricCard label="MAX SPEED" value={`${tracking.maxSpeed.toFixed(1)} km/h`} /><MetricCard label="AVERAGE" value={`${tracking.averageSpeed.toFixed(1)} km/h`} /></View>
      <View style={styles.controls}>{tracking.mode === 'tracking' ? <Button title="Pause" onPress={tracking.pause} variant="secondary" /> : <Button title={tracking.mode === 'paused' ? 'Resume' : tracking.mode === 'denied' ? 'Try Again' : 'Start'} onPress={tracking.mode === 'paused' ? tracking.resume : tracking.start} />}<Button title="Reset" onPress={reset} variant="ghost" /></View>
    </View>
    <View style={styles.section}><Text style={styles.sectionTitle}>STEPS</Text><View style={styles.stepsLine}><Text style={styles.steps}>{pedometer.steps.toLocaleString()}</Text><Text style={styles.goalText}> / {goalNumber.toLocaleString()} goal</Text></View><ProgressBar value={clamp(pedometer.steps / goalNumber, 0, 1)} color="#7E8CFF" />
      <Text style={styles.help}>{pedometer.available === false ? pedometer.error : 'Session steps may reset when the app closes. Your phone must support a pedometer.'}</Text>
      <TextInput style={styles.input} value={goal} keyboardType="number-pad" onChangeText={setGoal} placeholder="Daily step goal" placeholderTextColor="#66779B" /><Text style={styles.inputCaption}>Edit your daily step goal</Text>
    </View>
    <View style={styles.section}><Text style={styles.sectionTitle}>CALORIE ESTIMATE</Text><View style={styles.row}><MetricCard label="DISTANCE" value={`${tracking.distanceKm.toFixed(2)} km`} /><MetricCard label="ACTIVE TIME" value={formatDuration(tracking.duration)} /></View><View style={styles.calorie}><Text style={styles.calorieValue}>{calories.toFixed(0)}</Text><Text style={styles.calorieLabel}>ESTIMATED KCAL</Text></View>
      <Text style={styles.help}>Estimate = distance × body weight × 0.75. It is not medical advice and pauses while tracking is paused.</Text>
      <View style={styles.inputs}><TextInput style={styles.smallInput} value={profile.weight} onChangeText={(v) => updateProfile('weight', v)} keyboardType="decimal-pad" placeholder="Weight kg" placeholderTextColor="#66779B" /><TextInput style={styles.smallInput} value={profile.height} onChangeText={(v) => updateProfile('height', v)} keyboardType="decimal-pad" placeholder="Height cm" placeholderTextColor="#66779B" /><TextInput style={styles.smallInput} value={profile.age} onChangeText={(v) => updateProfile('age', v)} keyboardType="number-pad" placeholder="Age" placeholderTextColor="#66779B" /></View>
      <View style={styles.sexRow}>{['female', 'male'].map((sex) => <TouchableOpacity key={sex} style={[styles.sex, profile.sex === sex && styles.sexSelected]} onPress={() => updateProfile('sex', sex)}><Text style={styles.sexText}>{sex[0].toUpperCase() + sex.slice(1)}</Text></TouchableOpacity>)}</View><Button title="Validate profile" onPress={validateProfile} variant="secondary" />{profileError ? <Text style={styles.help}>{profileError}</Text> : null}
    </View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#0B1220' }, content: { padding: 20, paddingBottom: 42 }, eyebrow: { color: '#7E8CFF', fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { color: '#F5F8FF', fontSize: 29, fontWeight: '800', marginTop: 4 }, status: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 18, backgroundColor: '#111C31' }, dot: { width: 8, height: 8, borderRadius: 4, marginRight: 9 }, statusText: { flex: 1, fontSize: 13, fontWeight: '600' }, section: { backgroundColor: '#101B31', borderRadius: 24, padding: 16, marginTop: 16 }, sectionTitle: { color: '#9BA9C7', fontSize: 12, letterSpacing: 1.4, fontWeight: '800' }, center: { alignItems: 'center', marginVertical: 15 }, coordinate: { color: '#9BA9C7', textAlign: 'center', fontSize: 13 }, row: { flexDirection: 'row', marginHorizontal: -5, marginTop: 12 }, controls: { flexDirection: 'row', gap: 10, marginTop: 16 }, button: { minHeight: 48, flex: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 }, primary: { backgroundColor: '#3DDB91' }, secondary: { backgroundColor: '#273A5D' }, ghost: { borderWidth: 1, borderColor: '#526583' }, buttonText: { color: '#F5F8FF', fontWeight: '800', fontSize: 15 }, stepsLine: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 10 }, steps: { color: '#F5F8FF', fontSize: 34, fontWeight: '800' }, goalText: { color: '#9BA9C7', fontSize: 14 }, help: { color: '#9BA9C7', fontSize: 12, lineHeight: 18, marginTop: 12 }, input: { color: '#F5F8FF', backgroundColor: '#162440', borderRadius: 12, padding: 12, marginTop: 12, fontSize: 15 }, inputCaption: { color: '#66779B', fontSize: 11, marginTop: 5 }, calorie: { alignItems: 'center', paddingTop: 20 }, calorieValue: { color: '#F7C948', fontSize: 42, fontWeight: '800' }, calorieLabel: { color: '#9BA9C7', letterSpacing: 1.2, fontSize: 11, fontWeight: '700' }, inputs: { flexDirection: 'row', gap: 8, marginTop: 12 }, smallInput: { flex: 1, minWidth: 0, backgroundColor: '#162440', color: '#F5F8FF', borderRadius: 12, padding: 11, fontSize: 13 }, sexRow: { flexDirection: 'row', gap: 8, marginVertical: 10 }, sex: { flex: 1, padding: 11, alignItems: 'center', borderRadius: 12, backgroundColor: '#162440' }, sexSelected: { backgroundColor: '#4553A7' }, sexText: { color: '#F5F8FF', fontWeight: '700' } });
