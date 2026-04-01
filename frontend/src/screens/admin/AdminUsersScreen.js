// src/screens/admin/AdminUsersScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import GradientBackground from '../../components/GradientBackground';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { fetchAdminUsers, activateUser, deleteUser, changeUserRole } from '../../services/apiService';
import { COLORS, FONTS, RADIUS } from '../../theme/colors';

const AdminUsersScreen = () => {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting,     setActing]     = useState(null); // uid being acted upon

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetchAdminUsers();
      if (res.success) setUsers(res.users);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleActivate = (uid, name) => {
    Alert.alert('Activate User', `Activate "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Activate', onPress: async () => {
          setActing(uid);
          try {
            await activateUser(uid);
            Toast.show({ type: 'success', text1: 'Activated', text2: `${name} is now active.` });
            loadUsers();
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: err.message });
          } finally { setActing(null); }
        },
      },
    ]);
  };

  const handleDelete = (uid, name) => {
    Alert.alert('Delete User', `Permanently delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setActing(uid);
          try {
            await deleteUser(uid);
            Toast.show({ type: 'success', text1: 'Deleted', text2: `${name} removed.` });
            loadUsers();
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: err.message });
          } finally { setActing(null); }
        },
      },
    ]);
  };

  const handleChangeRole = (uid, name, currentRole) => {
    const action = currentRole === 'admin' ? 'Demote to User' : 'Promote to Admin';
    const msg    = currentRole === 'admin'
      ? `Remove admin privileges from "${name}"?`
      : `Grant admin privileges to "${name}"?`;
    Alert.alert(action, msg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action, onPress: async () => {
          setActing(uid);
          try {
            const res = await changeUserRole(uid);
            Toast.show({ type: 'success', text1: 'Role Updated', text2: res.message });
            loadUsers();
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: err.message });
          } finally { setActing(null); }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isPending = item.status !== 'activated';
    const isActing = acting === item.id;

    return (
      <Card style={styles.card}>
        {/* User Info */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: item.role === 'admin' ? 'rgba(56,189,248,0.15)' : 'rgba(45,212,191,0.12)' }]}>
            <Text style={[styles.avatarText, { color: item.role === 'admin' ? COLORS.info : COLORS.teal }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.loginid}>@{item.loginid}</Text>
          </View>
          <View style={styles.badges}>
            <Badge label={item.role === 'admin' ? '⚙ Admin' : '👤 User'} type={item.role === 'admin' ? 'admin' : 'default'} />
            <Badge label={isPending ? '⏳ Pending' : '✓ Active'} type={isPending ? 'pending' : 'low'} />
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.detail}><Ionicons name="mail-outline" size={11} color={COLORS.textDim} /> {item.email}</Text>
          <Text style={styles.detail}><Ionicons name="call-outline" size={11} color={COLORS.textDim} /> {item.mobile}</Text>
          <Text style={styles.detail}><Ionicons name="location-outline" size={11} color={COLORS.textDim} /> {item.city}, {item.state}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {isPending && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.activateBtn]}
              onPress={() => handleActivate(item.id, item.name)}
              disabled={isActing}
            >
              <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.success} />
              <Text style={[styles.actionBtnText, { color: COLORS.success }]}>Activate</Text>
            </TouchableOpacity>
          )}
          {/* Promote / Demote role button */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              item.role === 'admin' ? styles.demoteBtn : styles.promoteBtn,
            ]}
            onPress={() => handleChangeRole(item.id, item.name, item.role)}
            disabled={isActing}
          >
            <Ionicons
              name={item.role === 'admin' ? 'shield-outline' : 'shield-checkmark-outline'}
              size={14}
              color={item.role === 'admin' ? COLORS.warning : COLORS.info}
            />
            <Text style={[
              styles.actionBtnText,
              { color: item.role === 'admin' ? COLORS.warning : COLORS.info },
            ]}>
              {item.role === 'admin' ? 'Demote' : 'Make Admin'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item.id, item.name)}
            disabled={isActing}
          >
            <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
            <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <GradientBackground>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="people-outline" size={22} color={COLORS.teal} />
            </View>
            <View>
              <Text style={styles.headerTitle}>User Management</Text>
              <Text style={styles.headerSub}>{users.length} registered user{users.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={COLORS.textDim} />
              <Text style={styles.emptyText}>No users registered.</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadUsers(); }}
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

  card: { marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FONTS.size.lg, fontWeight: FONTS.weight.bold },
  name:     { color: COLORS.white, fontSize: FONTS.size.md, fontWeight: FONTS.weight.semibold },
  loginid:  { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 1 },
  badges:   { gap: 4, alignItems: 'flex-end' },

  details: {
    gap: 4, paddingTop: 10, paddingBottom: 10,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  detail: { color: COLORS.textMuted, fontSize: FONTS.size.xs, lineHeight: 18 },

  actions: { flexDirection: 'row', gap: 8, paddingTop: 10 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: RADIUS.sm, borderWidth: 1,
  },
  activateBtn: { borderColor: 'rgba(34,197,94,0.3)',   backgroundColor: 'rgba(34,197,94,0.08)' },
  promoteBtn:  { borderColor: 'rgba(56,189,248,0.3)',  backgroundColor: 'rgba(56,189,248,0.08)' },
  demoteBtn:   { borderColor: 'rgba(245,158,11,0.3)',  backgroundColor: 'rgba(245,158,11,0.08)' },
  deleteBtn:   { borderColor: 'rgba(239,68,68,0.3)',   backgroundColor: 'rgba(239,68,68,0.08)' },
  actionBtnText: { fontSize: FONTS.size.xs, fontWeight: FONTS.weight.semibold },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.size.md },
});

export default AdminUsersScreen;
