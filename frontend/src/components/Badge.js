// src/components/Badge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme/colors';

const Badge = ({ label, type = 'default' }) => {
  const config = {
    high:    { bg: COLORS.dangerDim,  text: COLORS.danger,  border: 'rgba(239,68,68,0.3)' },
    low:     { bg: COLORS.successDim, text: COLORS.success, border: 'rgba(34,197,94,0.3)' },
    pending: { bg: COLORS.warningDim, text: COLORS.warning, border: 'rgba(245,158,11,0.3)' },
    admin:   { bg: 'rgba(56,189,248,0.15)', text: COLORS.info, border: 'rgba(56,189,248,0.3)' },
    default: { bg: COLORS.border, text: COLORS.textMuted, border: 'transparent' },
  };
  const { bg, text, border } = config[type] ?? config.default;

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontSize: FONTS.size.xs, fontWeight: FONTS.weight.semibold },
});

export default Badge;
