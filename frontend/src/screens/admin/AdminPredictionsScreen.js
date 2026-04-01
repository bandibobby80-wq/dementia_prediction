// src/screens/admin/AdminPredictionsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { fetchAdminPredictions } from '../../services/apiService';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const AdminPredictionsScreen = () => {
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchAdminPredictions();
      if (res.success) setRecords(res.predictions);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const renderItem = ({ item }) => {
    const isHigh = item.risk_level === 'high';
    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: isHigh ? COLORS.danger : COLORS.success }]} />
          <View style={{ flex: 1 }}>
            <View style={styles.topRow}>
              <Text style={styles.userName}>{item.user_name}</Text>
              <Badge label={isHigh ? '⚠ High' : '✓ Low'} type={item.risk_level} />
            </View>
            <Text style={styles.loginid}>@{item.user}</Text>
            <View style={styles.metaRow}>
              {[
                ['Age', item.age],
                ['Gender', item.gender === 'M' ? 'Male' : 'Female'],
                ['MMSE', item.mmse],
                ['CDR', item.cdr],
              ].map(([label, val]) => (
                <View key={label} style={styles.metaChip}>
                  <Text style={styles.metaLabel}>{label}</Text>
                  <Text style={styles.metaVal}>{val}</Text>
                </View>
              ))}
            </View>
            <View style={styles.bottomRow}>
              <Text style={styles.result}>{item.result}</Text>
              {item.confidence && (
                <Text style={[styles.conf, { color: isHigh ? COLORS.danger : COLORS.success }]}>
                  {item.confidence}% conf.
                </Text>
              )}
              <Text style={styles.date}>{fmt(item.timestamp)}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <GradientBackground>
      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="analytics-outline" size={22} color={COLORS.teal} />
            </View>
            <View>
              <Text style={styles.headerTitle}>All Predictions</Text>
              <Text style={styles.headerSub}>{records.length} total record{records.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="flask-outline" size={48} color={COLORS.textDim} />
              <Text style={styles.emptyText}>No predictions recorded.</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={COLORS.teal} />
        }
        showsVerticalScrollIndicator={false}
      />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  list: { padding: 16, paddingTop: 54, paddingBottom: 30, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  headerIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(45,212,191,0.12)',
    borderWidth: 1, borderColor: COLORS.borderTeal,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: COLORS.white, fontSize: FONTS.size.xl, fontWeight: FONTS.weight.bold },
  headerSub:   { color: COLORS.textMuted, fontSize: FONTS.size.xs },

  card: { marginBottom: 8 },
  row:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot:  { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userName: { color: COLORS.white, fontSize: FONTS.size.md, fontWeight: FONTS.weight.semibold },
  loginid:  { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginBottom: 8 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metaChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 4,
  },
  metaLabel: { color: COLORS.textDim, fontSize: 9 },
  metaVal:   { color: COLORS.white, fontSize: FONTS.size.xs, fontWeight: FONTS.weight.semibold },

  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  result: { color: COLORS.textPrimary, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.medium },
  conf:   { fontSize: FONTS.size.xs, fontWeight: FONTS.weight.bold },
  date:   { color: COLORS.textDim, fontSize: FONTS.size.xs, flex: 1, textAlign: 'right' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.size.md },
});

export default AdminPredictionsScreen;
