// src/components/GradientBackground.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';

const GradientBackground = ({ children, style }) => (
  <LinearGradient
    colors={COLORS.gradientBg}
    style={[styles.container, style]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default GradientBackground;
