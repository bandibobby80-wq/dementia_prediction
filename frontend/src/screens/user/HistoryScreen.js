// src/screens/user/HistoryScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { fetchHistory } from '../../services/apiService';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const HistoryScreen = () => {
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded,   setExpanded]   = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetchHistory();
      if (res.success) setRecords(res.history);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const renderItem = ({ item }) => {
    const isHigh = item.risk_level === 'high';
    const isOpen = expanded === item.id;

    return (
      <TouchableOpacity onPress={() => toggle(item.id)} activeOpacity={0.85}>
        <Card style={[styles.card, isHigh && styles.cardHigh]}>
          {/* Row 1 — Summary */}
          <View style={styles.cardHeader}>
            <View style={[styles.resultDot, { backgroundColor: isHigh ? COLORS.danger : COLORS.success }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardResult}>{item.result}</Text>
              <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
            </View>
            <View style={styles.rightCol}>
              <Badge label={isHigh ? '⚠ High' : '✓ Low'} type={item.risk_level} />
              {item.confidence && (
                <Text style={[styles.conf, { color: isHigh ? COLORS.danger : COLORS.success }]}>
                  {item.confidence}%
                </Text>
              )}
            </View>
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={16} color={COLORS.textMuted} style={{ marginLeft: 8 }}
            />
          </View>

          {/* Expandable Detail */}
          {isOpen && (
            <View style={styles.detail}>
              <View style={styles.detailGrid}>
                {[
                  ['Age',    item.age,    'person-outline'],
                  ['Gender', item.gender === 'M' ? 'Male' : 'Female', 'body-outline'],
                  ['MMSE',   item.mmse,   'fitness-outline'],
                  ['CDR',    item.cdr,    'medical-outline'],
                  ['EDUC',   item.educ,   'school-outline'],
                  ['SES',    item.ses,    'stats-chart-outline'],
                  ['eTIV',   item.etiv,   'scan-outline'],
                  ['nWBV',   item.nwbv,   'ellipse-outline'],
                  ['ASF',    item.asf,    'resize-outline'],
                  ['Visit',  item.visit,  'calendar-outline'],
                ].map(([label, val, icon]) => (
                  <View key={label} style={styles.detailCell}>
                    <Ionicons name={icon} size={11} color={COLORS.teal} />
                    <Text style={styles.detailLabel}>{label}</Text>
                    <Text style={styles.detailVal}>{typeof val === 'number' ? val : val}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const ListEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="time-outline" size={56} color={COLORS.textDim} />
      <Text style={styles.emptyTitle}>No predictions yet</Text>
      <Text style={styles.emptySub}>Run your first prediction to see history here.</Text>
    </View>
  );

  return (
    <GradientBackground>
      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={loading ? null : <ListEmpty />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="time-outline" size={22} color={COLORS.teal} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Prediction History</Text>
              <Text style={styles.headerSub}>{records.length} record{records.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadHistory(); }}
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

  card:     { marginBottom: 10 },
  cardHigh: { borderColor: 'rgba(239,68,68,0.3)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultDot: { width: 10, height: 10, borderRadius: 5 },
  cardResult: { color: COLORS.white, fontSize: FONTS.size.md, fontWeight: FONTS.weight.semibold },
  cardDate:   { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 1 },
  rightCol:   { alignItems: 'flex-end', gap: 4 },
  conf:       { fontSize: FONTS.size.sm, fontWeight: FONTS.weight.bold },

  detail: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailCell: {
    width: '22%', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.sm, padding: 8, gap: 2,
  },
  detailLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: FONTS.weight.semibold },
  detailVal:   { color: COLORS.white, fontSize: FONTS.size.xs, fontWeight: FONTS.weight.bold },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold },
  emptySub:   { color: COLORS.textMuted, fontSize: FONTS.size.sm, textAlign: 'center', lineHeight: 20 },
});

export default HistoryScreen;
