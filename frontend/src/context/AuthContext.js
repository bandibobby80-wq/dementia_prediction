// src/context/AuthContext.js
// ─────────────────────────────────────────────────────────
// Global auth state — token + user stored in SecureStore
// ─────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, logoutUser } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);  // bootstrap loading

  // Restore session on app start
  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        const storedUser  = await SecureStore.getItemAsync('auth_user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (_) {
        // ignore — treat as logged out
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (loginid, password) => {
    const data = await loginUser(loginid, password);
    if (data.success) {
      await SecureStore.setItemAsync('auth_token', data.token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try { await logoutUser(); } catch (_) {}
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.loginid === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
