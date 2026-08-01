import { StyleSheet, Text, View } from 'react-native';
export default function StatCard({ label, value, color = '#57E389' }) { return <View style={styles.card}><Text style={styles.value}>{value}</Text><Text style={[styles.label, { color }]}>{label}</Text></View>; }
const styles = StyleSheet.create({ card: { flex: 1, minWidth: '30%', backgroundColor: '#182330', margin: 4, padding: 13, borderRadius: 16 }, value: { color: '#F5F9FF', fontWeight: '800', fontSize: 17 }, label: { marginTop: 5, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' } });
