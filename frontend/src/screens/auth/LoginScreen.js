// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import StyledInput from '../../components/StyledInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [loginid, setLoginid] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const errs = {};
    if (!loginid.trim()) errs.loginid = 'Login ID is required.';
    if (!password.trim()) errs.password = 'Password is required.';
    return errs;
  };

  const handleLogin = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await login(loginid.trim(), password.trim());
      if (!res.success) {
        Toast.show({ type: 'error', text1: 'Login Failed', text2: res.message });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Hero */}
          <View style={styles.hero}>
            <LinearGradient
              colors={['rgba(45,212,191,0.2)', 'rgba(45,212,191,0.05)']}
              style={styles.logoCircle}
            >
              <Ionicons name="pulse" size={52} color={COLORS.teal} />
            </LinearGradient>
            <Text style={styles.appTitle}>DementiaAI</Text>
            <Text style={styles.appSubtitle}>Personalized Dementia Prediction</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSub}>Sign in to your account</Text>

            <StyledInput
              label="Login ID"
              placeholder="Enter your login ID"
              value={loginid}
              onChangeText={setLoginid}
              leftIcon="person-outline"
              error={errors.loginid}
            />
            <StyledInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 8 }}
              icon={<Ionicons name="log-in-outline" size={18} color="#fff" />}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>or</Text>
              <View style={styles.divLine} />
            </View>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                Don't have an account?{' '}
                <Text style={{ color: COLORS.teal, fontWeight: FONTS.weight.bold }}>
                  Create one
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info note */}
          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.textDim} />
            <Text style={styles.noteText}>
              New accounts require admin activation before you can log in.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  hero: { alignItems: 'center', marginBottom: 36 },
  logoCircle: {
    width: 100, height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderTeal,
  },
  appTitle: {
    fontSize: FONTS.size.xxxl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.sm,
    marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  cardSub: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.sm,
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: {
    color: COLORS.textDim,
    marginHorizontal: 12,
    fontSize: FONTS.size.sm,
  },
  registerBtn: { alignItems: 'center', paddingVertical: 4 },
  registerText: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.sm,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  noteText: {
    color: COLORS.textDim,
    fontSize: FONTS.size.xs,
    flex: 1,
    lineHeight: 17,
  },
});

export default LoginScreen;
