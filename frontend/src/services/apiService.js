// src/services/apiService.js
// ─────────────────────────────────────────────────────────
// Centralized Axios instance with token injection and
// error normalisation for the entire mobile app.
// ─────────────────────────────────────────────────────────
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL, ENDPOINTS } from '../config/api';

// ── Axios instance ────────────────────────────────────────
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true', // Bypasses the localtunnel warning screen magically
  },
});

// ── Request interceptor — inject auth token ───────────────
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — normalise errors ───────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(msg));
  }
);

// ═════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════

export const loginUser = async (loginid, password) => {
  const { data } = await client.post(ENDPOINTS.LOGIN, { loginid, password });
  return data;
};

export const registerUser = async (payload) => {
  const { data } = await client.post(ENDPOINTS.REGISTER, payload);
  return data;
};

export const logoutUser = async () => {
  const { data } = await client.post(ENDPOINTS.LOGOUT);
  return data;
};

export const fetchProfile = async () => {
  const { data } = await client.get(ENDPOINTS.PROFILE);
  return data;
};

// ═════════════════════════════════════════════════════════
// USER FEATURES
// ═════════════════════════════════════════════════════════

export const runPrediction = async (payload) => {
  const { data } = await client.post(ENDPOINTS.PREDICT, payload);
  return data;
};

export const fetchHistory = async () => {
  const { data } = await client.get(ENDPOINTS.HISTORY);
  return data;
};

export const fetchDashboard = async () => {
  const { data } = await client.get(ENDPOINTS.DASHBOARD);
  return data;
};

// ═════════════════════════════════════════════════════════
// ADMIN
// ═════════════════════════════════════════════════════════

export const fetchAdminDashboard = async () => {
  const { data } = await client.get(ENDPOINTS.ADMIN_DASHBOARD);
  return data;
};

export const fetchAdminUsers = async () => {
  const { data } = await client.get(ENDPOINTS.ADMIN_USERS);
  return data;
};

export const activateUser = async (uid) => {
  const { data } = await client.post(ENDPOINTS.adminActivate(uid));
  return data;
};

export const changeUserRole = async (uid) => {
  const { data } = await client.post(ENDPOINTS.adminChangeRole(uid));
  return data;
};

export const deleteUser = async (uid) => {
  const { data } = await client.delete(ENDPOINTS.adminDelete(uid));
  return data;
};

export const fetchAdminPredictions = async () => {
  const { data } = await client.get(ENDPOINTS.ADMIN_PREDICTIONS);
  return data;
};

export const fetchAdminLogs = async () => {
  const { data } = await client.get(ENDPOINTS.ADMIN_LOGS);
  return data;
};

export default client;
