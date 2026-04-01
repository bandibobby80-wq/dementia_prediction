// src/components/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../theme/colors';

const Card = ({ children, style, glow }) => (
  <View style={[styles.card, glow && styles.glow, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    ...SHADOW.card,
  },
  glow: {
    borderColor: COLORS.borderTeal,
    ...SHADOW.teal,
  },
});

export default Card;
