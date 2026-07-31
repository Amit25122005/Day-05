import { Animated, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';

export default function SpeedGauge({ speed, status }) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(value, { toValue: Math.min(speed / 40, 1), duration: 450, useNativeDriver: false }).start(); }, [speed]);
  const color = status === 'good' ? '#3DDB91' : status === 'bad' ? '#FF6577' : '#F7C948';
  return <View style={[styles.gauge, { borderColor: color }]}><Animated.View style={[styles.fill, { backgroundColor: color, opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.42] }) }]} /><Text style={styles.value}>{Number(speed || 0).toFixed(1)}</Text><Text style={styles.unit}>KM/H</Text></View>;
}
const styles = StyleSheet.create({ gauge: { width: 210, height: 210, borderRadius: 105, borderWidth: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#101B31' }, fill: { ...StyleSheet.absoluteFillObject }, value: { color: '#F5F8FF', fontSize: 52, fontWeight: '800' }, unit: { color: '#9BA9C7', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 } });
