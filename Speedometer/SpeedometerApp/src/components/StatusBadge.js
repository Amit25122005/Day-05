import { StyleSheet, Text, View } from 'react-native';
const colors = { connected: '#57E389', weak: '#FFB020', denied: '#FF5C70', searching: '#48A8FF', unavailable: '#FF5C70' };
export default function StatusBadge({ status }) { const color = colors[status.type] || colors.searching; return <View style={[styles.badge, { borderColor: color }]}><View style={[styles.dot, { backgroundColor: color }]} /><Text style={styles.text}>{status.text}</Text></View>; }
const styles = StyleSheet.create({ badge: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }, dot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 }, text: { color: '#E8F1FC', fontWeight: '700', fontSize: 12 } });
