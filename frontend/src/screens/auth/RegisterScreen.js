// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import StyledInput from '../../components/StyledInput';
import PrimaryButton from '../../components/PrimaryButton';
import { registerUser } from '../../services/apiService';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '', loginid: '', password: '', mobile: '',
    email: '', locality: '', address: '', city: '', state: '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Full name is required.';
    if (!form.loginid.trim())  e.loginid  = 'Login ID is required.';
    if (form.password.length < 8) e.password = 'Min 8 characters required.';
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(form.password))
      e.password = 'Must have uppercase, lowercase & number.';
    if (!/^[56789]\d{9}$/.test(form.mobile)) e.mobile = '10-digit mobile (start 5-9).';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    if (!form.locality.trim()) e.locality = 'Locality is required.';
    if (!form.address.trim())  e.address  = 'Address is required.';
    if (!/^[A-Za-z ]+$/.test(form.city))  e.city  = 'Letters only.';
    if (!/^[A-Za-z ]+$/.test(form.state)) e.state = 'Letters only.';
    return e;
  };

  const handleRegister = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await registerUser(form);
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Registered!', text2: res.message });
        navigation.navigate('Login');
      } else {
        Toast.show({ type: 'error', text1: 'Registration Failed', text2: res.message });
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.teal} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Fill in your details to register</Text>
            </View>
          </View>

          <View style={styles.card}>
            {/* Personal Info */}
            <SectionLabel label="Personal Information" icon="person-circle-outline" />
            <StyledInput label="Full Name" value={form.name} onChangeText={set('name')} error={errors.name} leftIcon="person-outline" placeholder="e.g. John Smith" />
            <StyledInput label="Login ID" value={form.loginid} onChangeText={set('loginid')} error={errors.loginid} leftIcon="at-outline" placeholder="Choose a unique ID" />
            <StyledInput label="Password" value={form.password} onChangeText={set('password')} error={errors.password} leftIcon="lock-closed-outline" placeholder="Min 8 chars, upper+lower+number" secureTextEntry />
            <StyledInput label="Mobile" value={form.mobile} onChangeText={set('mobile')} error={errors.mobile} leftIcon="call-outline" placeholder="10-digit number" keyboardType="phone-pad" />
            <StyledInput label="Email" value={form.email} onChangeText={set('email')} error={errors.email} leftIcon="mail-outline" placeholder="your@email.com" keyboardType="email-address" />

            {/* Address */}
            <SectionLabel label="Address Details" icon="location-outline" />
            <StyledInput label="Locality / Area" value={form.locality} onChangeText={set('locality')} error={errors.locality} leftIcon="map-outline" placeholder="e.g. Sector 12" />
            <StyledInput label="City" value={form.city} onChangeText={set('city')} error={errors.city} leftIcon="business-outline" placeholder="e.g. Mumbai" />
            <StyledInput label="State" value={form.state} onChangeText={set('state')} error={errors.state} leftIcon="flag-outline" placeholder="e.g. Maharashtra" />
            <StyledInput
              label="Full Address" value={form.address}
              onChangeText={set('address')} leftIcon="home-outline"
              placeholder="Street address, landmark…"
              multiline numberOfLines={3} error={errors.address}
            />

            <PrimaryButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: 8 }}
              icon={<Ionicons name="checkmark-circle-outline" size={18} color="#fff" />}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={{ color: COLORS.teal, fontWeight: FONTS.weight.bold }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const SectionLabel = ({ label, icon }) => (
  <View style={styles.sectionLabel}>
    <Ionicons name={icon} size={14} color={COLORS.teal} />
    <Text style={styles.sectionText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 20, paddingTop: 56, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.bgCard, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  headerText: {},
  title:    { fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.bold, color: COLORS.white },
  subtitle: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginTop: 2 },
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border, padding: 20,
  },
  sectionLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 12, marginTop: 8, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sectionText: { color: COLORS.tealLight, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.semibold },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
});

export default RegisterScreen;
