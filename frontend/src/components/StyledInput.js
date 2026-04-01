// src/components/StyledInput.js
import React, { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../theme/colors';

const StyledInput = ({
  label, value, onChangeText, placeholder, secureTextEntry,
  keyboardType = 'default', multiline, numberOfLines,
  error, leftIcon, style, editable = true,
}) => {
  const [focused, setFocused] = useState(false);
  const [show,    setShow]    = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputRow,
        focused && styles.inputFocused,
        error  && styles.inputError,
        !editable && styles.inputDisabled,
      ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={focused ? COLORS.teal : COLORS.textMuted}
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          style={[styles.input, multiline && { height: numberOfLines ? numberOfLines * 22 : 88 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDim}
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShow(!show)}>
            <Ionicons
              name={show ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.medium,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputFocused: {
    borderColor: COLORS.teal,
    backgroundColor: 'rgba(45,212,191,0.06)',
  },
  inputError: { borderColor: COLORS.danger },
  inputDisabled: { opacity: 0.5 },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONTS.size.md,
    padding: 0,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.size.xs,
    marginTop: 4,
  },
});

export default StyledInput;
