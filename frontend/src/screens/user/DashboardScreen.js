// src/screens/user/DashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { fetchDashboard } from '../../services/apiService';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetchDashboard();
      if (res.success) setStats(res.stats);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <GradientBackground>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <LinearGradient
          colors={['#134e4a', '#0f172a']}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name} 👋</Text>
              <Text style={styles.heroSub}>Your dementia prediction dashboard</Text>
            </View>
            <TouchableOpacity
              style={styles.predictBtn}
              onPress={() => navigation.navigate('Predict')}
            >
              <LinearGradient colors={COLORS.gradientTeal} style={styles.predictBtnInner}>
                <Ionicons name="analytics-outline" size={16} color="#fff" />
                <Text style={styles.predictBtnText}>Run Prediction</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {[
              { icon: 'pulse-outline',     label: 'Predict',  color: COLORS.teal,    screen: 'Predict' },
              { icon: 'time-outline',      label: 'History',  color: COLORS.info,    screen: 'History' },
              { icon: 'person-outline',    label: 'Profile',  color: COLORS.warning, screen: 'Profile' },
            ].map(({ icon, label, color, screen }) => (
              <TouchableOpacity
                key={label}
                style={[styles.actionCard, { borderColor: `${color}33` }]}
                onPress={() => navigation.navigate(screen)}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
                  <Ionicons name={icon} size={24} color={color} />
                </View>
                <Text style={styles.actionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats */}
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          {loading ? (
            <Card style={styles.loadingCard}>
              <Text style={{ color: COLORS.textMuted, textAlign: 'center' }}>Loading stats…</Text>
            </Card>
          ) : (
            <View style={styles.statsRow}>
              <StatCard
                label="Total Predictions"
                value={stats?.total_predictions ?? 0}
                icon={<Ionicons name="flask-outline" size={22} color={COLORS.teal} />}
                color={COLORS.teal}
              />
              <StatCard
                label="High Risk"
                value={stats?.high_risk_count ?? 0}
                icon={<Ionicons name="warning-outline" size={22} color={COLORS.danger} />}
                color={COLORS.danger}
              />
              <StatCard
                label="Low Risk"
                value={stats?.low_risk_count ?? 0}
                icon={<Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />}
                color={COLORS.success}
              />
            </View>
          )}

          {/* Last Prediction */}
          {stats?.last_prediction && (
            <>
              <Text style={styles.sectionTitle}>Last Prediction</Text>
              <Card glow={stats.last_prediction.risk_level === 'high'}>
                <View style={styles.lastPredRow}>
                  <View style={[
                    styles.resultIcon,
                    { backgroundColor: stats.last_prediction.risk_level === 'high'
                        ? COLORS.dangerDim : COLORS.successDim,
                    },
                  ]}>
                    <Ionicons
                      name={stats.last_prediction.risk_level === 'high' ? 'warning' : 'checkmark-circle'}
                      size={28}
                      color={stats.last_prediction.risk_level === 'high' ? COLORS.danger : COLORS.success}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lastResult}>{stats.last_prediction.result}</Text>
                    <Text style={styles.lastDate}>{formatDate(stats.last_prediction.timestamp)}</Text>
                    <Badge
                      label={`${stats.last_prediction.risk_level === 'high' ? '⚠ High' : '✓ Low'} Risk`}
                      type={stats.last_prediction.risk_level}
                    />
                  </View>
                  {stats.last_prediction.confidence && (
                    <View style={styles.confidenceBox}>
                      <Text style={styles.confidenceVal}>{stats.last_prediction.confidence}%</Text>
                      <Text style={styles.confidenceLabel}>confidence</Text>
                    </View>
                  )}
                </View>
              </Card>
            </>
          )}

          {/* Dementia Info Cards */}
          <Text style={styles.sectionTitle}>About Dementia</Text>
          {INFO_CARDS.map(({ icon, title, body }) => (
            <Card key={title} style={{ marginBottom: 10 }}>
              <View style={styles.infoCardRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name={icon} size={20} color={COLORS.teal} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>{title}</Text>
                  <Text style={styles.infoBody}>{body}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const INFO_CARDS = [
  { icon: 'help-circle-outline', title: 'What is Dementia?',
    body: 'A group of brain disorders causing progressive cognitive decline, interfering with daily activities.' },
  { icon: 'pulse-outline', title: 'Common Symptoms',
    body: 'Memory loss, confusion, communication difficulty, personality changes, and impaired reasoning.' },
  { icon: 'analytics-outline', title: 'Key Features Used',
    body: 'MMSE cognitive score, CDR dementia rating, nWBV brain volume, and eTIV intracranial volume.' },
];

const styles = StyleSheet.create({
  hero: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting:   { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  userName:   { color: COLORS.white, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.bold, marginTop: 2 },
  heroSub:    { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 4 },
  predictBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  predictBtnInner: { paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', gap: 6, alignItems: 'center' },
  predictBtnText: { color: COLORS.white, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold },

  content: { padding: 16, paddingBottom: 30 },
  sectionTitle: {
    color: COLORS.textPrimary, fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold, marginTop: 20, marginBottom: 10,
  },

  actionsRow: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1, padding: 14, alignItems: 'center', gap: 8,
  },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: COLORS.textPrimary, fontSize: FONTS.size.xs, fontWeight: FONTS.weight.semibold },

  statsRow: { flexDirection: 'row', gap: 0, marginHorizontal: -4 },

  loadingCard: { alignItems: 'center', paddingVertical: 20 },

  lastPredRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  resultIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  lastResult: { color: COLORS.white, fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold },
  lastDate:   { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginBottom: 6 },
  confidenceBox: { alignItems: 'center' },
  confidenceVal: { color: COLORS.teal, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.extrabold },
  confidenceLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs },

  infoCardRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIcon: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(45,212,191,0.12)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  infoTitle: { color: COLORS.white, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold, marginBottom: 3 },
  infoBody:  { color: COLORS.textMuted, fontSize: FONTS.size.xs, lineHeight: 18 },
});

export default DashboardScreen;
