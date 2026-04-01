// src/screens/admin/AdminLogsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import Card from '../../components/Card';
import { fetchAdminLogs } from '../../services/apiService';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const ACTION_ICONS = {
  login:        { icon: 'log-in-outline',      color: COLORS.success },
  logout:       { icon: 'log-out-outline',     color: COLORS.textMuted },
  predict:      { icon: 'analytics-outline',   color: COLORS.teal },
  train:        { icon: 'construct-outline',   color: COLORS.warning },
  register:     { icon: 'person-add-outline',  color: COLORS.info },
  view_dataset: { icon: 'grid-outline',        color: COLORS.textMuted },
};

const AdminLogsScreen = () => {
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchAdminLogs();
      if (res.success) setLogs(res.logs);
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
    const { icon, color } = ACTION_ICONS[item.action] ?? { icon: 'ellipse-outline', color: COLORS.textMuted };
    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.topRow}>
              <Text style={styles.username}>{item.username}</Text>
              <View style={[styles.actionTag, { borderColor: `${color}44` }]}>
                <Text style={[styles.actionTagText, { color }]}>{item.action}</Text>
              </View>
            </View>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.meta}>
              <Ionicons name="time-outline" size={10} color={COLORS.textDim} />
              <Text style={styles.date}>{fmt(item.timestamp)}</Text>
              {item.ip_address && (
                <>
                  <Ionicons name="globe-outline" size={10} color={COLORS.textDim} />
                  <Text style={styles.ip}>{item.ip_address}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <GradientBackground>
      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="list-outline" size={22} color={COLORS.teal} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Activity Log</Text>
              <Text style={styles.headerSub}>{logs.length} entri{logs.length !== 1 ? 'es' : 'y'}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="list-outline" size={48} color={COLORS.textDim} />
              <Text style={styles.emptyText}>No activity logged yet.</Text>
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
  row:  { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconBox: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  username: { color: COLORS.white, fontSize: FONTS.size.sm, fontWeight: FONTS.weight.semibold },
  actionTag: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  actionTagText: { fontSize: 10, fontWeight: FONTS.weight.bold },
  desc: { color: COLORS.textMuted, fontSize: FONTS.size.xs, lineHeight: 17, marginBottom: 5 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  date: { color: COLORS.textDim, fontSize: 10 },
  ip:   { color: COLORS.textDim, fontSize: 10 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.size.md },
});

export default AdminLogsScreen;
