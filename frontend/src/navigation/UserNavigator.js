// src/navigation/UserNavigator.js
// ─────────────────────────────────────────────────────────
// Bottom-tab navigator for regular (non-admin) users
// ─────────────────────────────────────────────────────────
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen  from '../screens/user/DashboardScreen';
import PredictionScreen from '../screens/user/PredictionScreen';
import HistoryScreen    from '../screens/user/HistoryScreen';
import ProfileScreen    from '../screens/user/ProfileScreen';
import { COLORS, FONTS } from '../theme/colors';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Wrap Dashboard in a stack so it can push Predict/History/Profile as sub-screens
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="Predict"       component={PredictionScreen} />
    <Stack.Screen name="History"       component={HistoryScreen} />
    <Stack.Screen name="Profile"       component={ProfileScreen} />
  </Stack.Navigator>
);

const tabBarStyle = {
  backgroundColor: '#131c2e',
  borderTopColor:  COLORS.border,
  borderTopWidth:  1,
  height:          Platform.OS === 'ios' ? 84 : 66,
  paddingBottom:   Platform.OS === 'ios' ? 24 : 8,
  paddingTop:      8,
};

const UserNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor:   COLORS.teal,
      tabBarInactiveTintColor: COLORS.textDim,
      tabBarLabelStyle: {
        fontSize:   FONTS.size.xs,
        fontWeight: FONTS.weight.medium,
        marginTop:  2,
      },
      tabBarIcon: ({ focused, color }) => {
        const icons = {
          Dashboard: focused ? 'home'          : 'home-outline',
          Predict:   focused ? 'pulse'         : 'pulse-outline',
          History:   focused ? 'time'          : 'time-outline',
          Profile:   focused ? 'person-circle' : 'person-circle-outline',
        };
        const name = icons[route.name] ?? 'ellipse-outline';
        return (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            ...(focused && {
              backgroundColor: 'rgba(45,212,191,0.12)',
              borderRadius: 12,
              width: 44,
              height: 28,
            }),
          }}>
            <Ionicons name={name} size={focused ? 22 : 20} color={color} />
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardStack}   options={{ title: 'Home' }} />
    <Tab.Screen name="Predict"   component={PredictionScreen} options={{ title: 'Predict' }} />
    <Tab.Screen name="History"   component={HistoryScreen}    options={{ title: 'History' }} />
    <Tab.Screen name="Profile"   component={ProfileScreen}    options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

export default UserNavigator;
