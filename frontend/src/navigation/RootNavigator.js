// src/navigation/RootNavigator.js
// ─────────────────────────────────────────────────────────
// Root — decides whether to show Auth, User, or Admin flow
// ─────────────────────────────────────────────────────────
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth }      from '../context/AuthContext';
import AuthNavigator    from './AuthNavigator';
import UserNavigator    from './UserNavigator';
import AdminNavigator   from './AdminNavigator';
import LoadingOverlay   from '../components/LoadingOverlay';

// Dark navigation theme matching the app palette
const DarkTheme = {
  dark: true,
  colors: {
    primary:    '#2dd4bf',
    background: '#0f172a',
    card:       '#131c2e',
    text:       '#f1f5f9',
    border:     'rgba(255,255,255,0.08)',
    notification:'#ef4444',
  },
};

const RootNavigator = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingOverlay message="Starting DementiaAI…" />;

  return (
    <NavigationContainer theme={DarkTheme}>
      {!user ? (
        <AuthNavigator />
      ) : isAdmin ? (
        <AdminNavigator />
      ) : (
        <UserNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
