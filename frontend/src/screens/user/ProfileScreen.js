// src/screens/user/ProfileScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try { await logout(); }
          catch (_) {}
          finally { setLoggingOut(false); }
        },
      },
    ]);
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={COLORS.teal} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Banner */}
        <LinearGradient colors={['#134e4a', '#0f172a']} style={styles.banner}>
          <LinearGradient colors={COLORS.gradientTeal} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.loginId}>@{user?.loginid}</Text>
          <View style={styles.badgeRow}>
            <Badge
              label={user?.role === 'admin' ? '⚙ Admin' : '👤 User'}
              type={user?.role === 'admin' ? 'admin' : 'default'}
            />
            <Badge label="✓ Active" type="low" />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Contact Info */}
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Card>
            <InfoRow icon="mail-outline"        label="Email"  value={user?.email} />
            <InfoRow icon="call-outline"        label="Mobile" value={user?.mobile} />
            <InfoRow icon="at-circle-outline"   label="Login ID" value={user?.loginid} />
          </Card>

          {/* Address */}
          <Text style={styles.sectionTitle}>Address</Text>
          <Card>
            <InfoRow icon="location-outline"    label="Locality" value={user?.locality} />
            <InfoRow icon="business-outline"    label="City"     value={user?.city} />
            <InfoRow icon="flag-outline"        label="State"    value={user?.state} />
            <InfoRow icon="home-outline"        label="Address"  value={user?.address} />
          </Card>

          {/* Account */}
          <Text style={styles.sectionTitle}>Account</Text>
          <Card>
            <InfoRow icon="shield-checkmark-outline" label="Role"   value={user?.role} />
            <InfoRow icon="checkmark-circle-outline" label="Status" value="Activated" />
          </Card>

          {/* Logout */}
          <PrimaryButton
            title={loggingOut ? 'Signing out…' : 'Sign Out'}
            onPress={confirmLogout}
            loading={loggingOut}
            variant="danger"
            style={{ marginTop: 24 }}
            icon={<Ionicons name="log-out-outline" size={18} color="#fff" />}
          />

          <Text style={styles.disclaimer}>
            DementiaAI v1.0 · Predictions are for informational purposes only; seek professional medical advice.
          </Text>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 36 },
  banner: {
    paddingTop: 60, paddingBottom: 32,
    alignItems: 'center', gap: 6,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  avatarText: { color: COLORS.white, fontSize: 34, fontWeight: FONTS.weight.extrabold },
  userName:   { color: COLORS.white, fontSize: FONTS.size.xxl, fontWeight: FONTS.weight.bold },
  loginId:    { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  badgeRow:   { flexDirection: 'row', gap: 8, marginTop: 8 },

  content:      { padding: 16 },
  sectionTitle: {
    color: COLORS.textPrimary, fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold, marginTop: 20, marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoIcon: {
    width: 34, height: 34, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(45,212,191,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  infoValue: { color: COLORS.white, fontSize: FONTS.size.md, fontWeight: FONTS.weight.medium, marginTop: 1 },

  disclaimer: {
    color: COLORS.textDim, fontSize: FONTS.size.xs,
    textAlign: 'center', marginTop: 16, lineHeight: 18,
  },
});

export default ProfileScreen;
