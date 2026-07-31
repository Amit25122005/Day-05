import { Animated, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
export default function ProgressBar({ value, color = '#3DDB91' }) { const progress = useRef(new Animated.Value(0)).current; useEffect(() => { Animated.timing(progress, { toValue: Math.max(0, Math.min(value, 1)), duration: 400, useNativeDriver: false }).start(); }, [value]); return <View style={styles.track}><Animated.View style={[styles.fill, { backgroundColor: color, width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} /></View>; }
const styles = StyleSheet.create({ track: { height: 10, backgroundColor: '#263653', borderRadius: 10, overflow: 'hidden' }, fill: { height: '100%', borderRadius: 10 } });
