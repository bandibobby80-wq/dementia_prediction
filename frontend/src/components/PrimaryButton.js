// src/components/PrimaryButton.js
import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme/colors';

const PrimaryButton = ({
  title, onPress, loading, disabled,
  variant = 'teal',   // 'teal' | 'danger' | 'ghost'
  style, textStyle, icon,
}) => {
  const isDisabled = disabled || loading;

  const gradients = {
    teal:   COLORS.gradientTeal,
    danger: COLORS.gradientDanger,
    ghost:  ['transparent', 'transparent'],
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[styles.wrapper, isDisabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          variant === 'ghost' && styles.ghostBorder,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.md,
    ...SHADOW.teal,
    marginVertical: 4,
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: {
    color: COLORS.white,
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 0.3,
  },
});

export default PrimaryButton;
