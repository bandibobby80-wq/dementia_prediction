// src/components/StatCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import { COLORS, FONTS, RADIUS } from '../theme/colors';

const StatCard = ({ label, value, icon, color = COLORS.teal, style }) => (
  <Card style={[styles.card, style]}>
    <View style={[styles.iconBox, { backgroundColor: `${color}22` }]}>
      {icon}
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </Card>
);

const styles = StyleSheet.create({
  card: { flex: 1, alignItems: 'center', padding: 16, margin: 4 },
  iconBox: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  value: {
    color: COLORS.white, fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.extrabold,
  },
  label: {
    color: COLORS.textMuted, fontSize: FONTS.size.xs,
    marginTop: 2, textAlign: 'center',
  },
});

export default StatCard;
