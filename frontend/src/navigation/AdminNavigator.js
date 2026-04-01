// src/navigation/AdminNavigator.js
// ─────────────────────────────────────────────────────────
// Bottom-tab navigator for admin users
// ─────────────────────────────────────────────────────────
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AdminDashboardScreen   from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen       from '../screens/admin/AdminUsersScreen';
import AdminPredictionsScreen from '../screens/admin/AdminPredictionsScreen';
import AdminLogsScreen        from '../screens/admin/AdminLogsScreen';
import ProfileScreen          from '../screens/user/ProfileScreen';
import { COLORS, FONTS } from '../theme/colors';

const Tab = createBottomTabNavigator();

const tabBarStyle = {
  backgroundColor: '#110e1f',
  borderTopColor:  COLORS.border,
  borderTopWidth:  1,
  height:          Platform.OS === 'ios' ? 84 : 66,
  paddingBottom:   Platform.OS === 'ios' ? 24 : 8,
  paddingTop:      8,
};

const AdminNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor:   COLORS.teal,
      tabBarInactiveTintColor: COLORS.textDim,
      tabBarLabelStyle: { fontSize: FONTS.size.xs, fontWeight: FONTS.weight.medium },
      tabBarIcon: ({ focused, color }) => {
        const icons = {
          Overview:    focused ? 'grid'                 : 'grid-outline',
          Users:       focused ? 'people'               : 'people-outline',
          Predictions: focused ? 'analytics'            : 'analytics-outline',
          'Audit Log': focused ? 'document-text'        : 'document-text-outline',
          Account:     focused ? 'person-circle'        : 'person-circle-outline',
        };
        const name = icons[route.name] ?? 'ellipse-outline';
        return (
          <View style={{
            alignItems: 'center', justifyContent: 'center',
            ...(focused && {
              backgroundColor: 'rgba(45,212,191,0.12)',
              borderRadius: 12, width: 44, height: 28,
            }),
          }}>
            <Ionicons name={name} size={focused ? 22 : 20} color={color} />
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="Overview"    component={AdminDashboardScreen} />
    <Tab.Screen name="Users"       component={AdminUsersScreen} />
    <Tab.Screen name="Predictions" component={AdminPredictionsScreen} />
    <Tab.Screen name="Audit Log"   component={AdminLogsScreen} />
    <Tab.Screen name="Account"     component={ProfileScreen} />
  </Tab.Navigator>
);

export default AdminNavigator;
