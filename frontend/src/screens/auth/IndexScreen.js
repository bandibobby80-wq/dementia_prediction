// src/screens/auth/IndexScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import GradientBackground from '../../components/GradientBackground';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const IndexScreen = ({ navigation }) => {
  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Spacer to push content to middle */}
        <View style={{ flex: 1 }} />

        {/* Hero Section */}
        <View style={styles.hero}>
          <LinearGradient
            colors={['rgba(45,212,191,0.25)', 'rgba(45,212,191,0.05)']}
            style={styles.logoCircle}
          >
            <Ionicons name="pulse" size={60} color={COLORS.teal} />
          </LinearGradient>
          
          <Text style={styles.appTitle}>DementiaAI</Text>
          <Text style={styles.appSubtitle}>Early Detection System</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.descriptionText}>
            This application uses advanced machine learning models (Random Forest) to evaluate 
            clinical and demographic data for the early detection and risk assessment of dementia. 
          </Text>

          <View style={styles.featureRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.teal} />
            <Text style={styles.featureText}>Secure clinical data entry</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="analytics-outline" size={20} color={COLORS.teal} />
            <Text style={styles.featureText}>Instant model inferences</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.teal} />
            <Text style={styles.featureText}>Persistent prediction history</Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              title="Get Started"
              onPress={() => navigation.navigate('Login')}
              icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
              style={styles.actionBtn}
            />

            <TouchableOpacity 
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Ionicons name="person-add-outline" size={18} color={COLORS.teal} />
              <Text style={styles.secondaryBtnText}>Register Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer to push content up */}
        <View style={{ flex: 1 }} />
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
  },
  hero: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logoCircle: {
    width: 120, height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.3)',
  },
  appTitle: {
    fontSize: FONTS.size.xxxl + 6,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    color: COLORS.teal,
    fontSize: FONTS.size.base,
    marginTop: 6,
    fontWeight: FONTS.weight.bold,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    marginBottom: 12,
  },
  descriptionText: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.sm,
    lineHeight: 22,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  featureText: {
    color: COLORS.textDim,
    fontSize: FONTS.size.sm,
  },
  actions: {
    marginTop: 30,
    gap: 16,
  },
  actionBtn: {
    width: '100%',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.3)',
    backgroundColor: 'rgba(45,212,191,0.05)',
  },
  secondaryBtnText: {
    color: COLORS.teal,
    fontWeight: FONTS.weight.bold,
    fontSize: FONTS.size.base,
  },
});

export default IndexScreen;
