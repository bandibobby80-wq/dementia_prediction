// src/navigation/AuthNavigator.js
// ─────────────────────────────────────────────────────────
// Stack navigator for unauthenticated users
// ─────────────────────────────────────────────────────────
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IndexScreen    from '../screens/auth/IndexScreen';
import LoginScreen    from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator 
    initialRouteName="Index" 
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Index"    component={IndexScreen} />
    <Stack.Screen name="Login"    component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
