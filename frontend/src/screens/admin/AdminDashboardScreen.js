// src/screens/admin/AdminDashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import { fetchAdminDashboard } from '../../services/apiService';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const AdminDashboardScreen = () => {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchAdminDashboard();
      if (res.success) setData(res);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const actionColor = (action) => {
    const map = {
      login: COLORS.success, logout: COLORS.textMuted,
      predict: COLORS.teal, train: COLORS.warning,
      register: COLORS.info,
    };
    return map[action] ?? COLORS.textMuted;
  };

  return (
    <GradientBackground>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.teal} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={['#1e1b4b', '#0f172a']} style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.teal} />
          </View>
          <View>
            <Text style={styles.heroTitle}>Admin Dashboard</Text>
            <Text style={styles.heroSub}>System overview & management</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Grid */}
          <Text style={styles.sectionTitle}>System Statistics</Text>
          {loading ? (
            <Card><Text style={{ color: COLORS.textMuted, textAlign: 'center' }}>Loading…</Text></Card>
          ) : (
            <>
              <View style={styles.statsRow}>
                <StatCard label="Total Users" value={data?.stats?.total_users ?? 0}
                  icon={<Ionicons name="people-outline" size={20} color={COLORS.teal} />}
                  color={COLORS.teal} />
                <StatCard label="Active" value={data?.stats?.activated_users ?? 0}
                  icon={<Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />}
                  color={COLORS.success} />
              </View>
              <View style={styles.statsRow}>
                <StatCard label="Pending" value={data?.stats?.pending_users ?? 0}
                  icon={<Ionicons name="time-outline" size={20} color={COLORS.warning} />}
                  color={COLORS.warning} />
                <StatCard label="Predictions" value={data?.stats?.total_predictions ?? 0}
                  icon={<Ionicons name="analytics-outline" size={20} color={COLORS.info} />}
                  color={COLORS.info} />
              </View>
            </>
          )}

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {(data?.recent_logs ?? []).length === 0 ? (
            <Card>
              <Text style={{ color: COLORS.textMuted, textAlign: 'center' }}>No activity yet.</Text>
            </Card>
          ) : (
            (data?.recent_logs ?? []).map((log) => (
              <Card key={log.id} style={styles.logCard}>
                <View style={styles.logRow}>
                  <View style={[styles.logDot, { backgroundColor: actionColor(log.action) }]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.logTop}>
                      <Text style={styles.logUser}>{log.username}</Text>
                      <View style={[styles.actionTag, { borderColor: `${actionColor(log.action)}44` }]}>
                        <Text style={[styles.actionTagText, { color: actionColor(log.action) }]}>
                          {log.action}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.logDesc} numberOfLines={2}>{log.description}</Text>
                    <Text style={styles.logDate}>{fmtDate(log.timestamp)}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  hero: {
    paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  heroIcon: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(45,212,191,0.12)',
    borderWidth: 1, borderColor: COLORS.borderTeal,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { color: COLORS.white, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.bold },
  heroSub:   { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 2 },
  content:   { padding: 16, paddingBottom: 30 },
  sectionTitle: {
    color: COLORS.textPrimary, fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold, marginTop: 16, marginBottom: 10,
  },
  statsRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 0 },
  logCard:  { marginBottom: 8 },
  logRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  logDot:   { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  logTop:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  logUser:  { color: COLORS.white, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.semibold },
  actionTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full, borderWidth: 1 },
  actionTagText: { fontSize: FONTS.size.xs, fontWeight: FONTS.weight.semibold },
  logDesc:  { color: COLORS.textMuted, fontSize: FONTS.size.xs, lineHeight: 17 },
  logDate:  { color: COLORS.textDim, fontSize: 10, marginTop: 3 },
});

export default AdminDashboardScreen;
