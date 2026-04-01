// src/config/api.js
// ─────────────────────────────────────────────────────────
// Centralised API configuration
// ─────────────────────────────────────────────────────────

export const BASE_URL = 'https://dementia-prediction.onrender.com';
// export const BASE_URL = 'https://chatty-kings-love.loca.lt'; // local testing bypass

export const ENDPOINTS = {
  // Auth
  LOGIN:    `${BASE_URL}/mobile/api/login/`,
  REGISTER: `${BASE_URL}/api/register/`,
  LOGOUT:   `${BASE_URL}/api/logout/`,
  PROFILE:  `${BASE_URL}/api/profile/`,

  // User
  PREDICT:   `${BASE_URL}/api/predict/`,
  HISTORY:   `${BASE_URL}/api/history/`,
  DASHBOARD: `${BASE_URL}/api/dashboard/`,

  // Admin
  ADMIN_DASHBOARD:    `${BASE_URL}/api/admin/dashboard/`,
  ADMIN_USERS:        `${BASE_URL}/api/admin/users/`,
  ADMIN_PREDICTIONS:  `${BASE_URL}/api/admin/predictions/`,
  ADMIN_LOGS:         `${BASE_URL}/api/admin/activity-logs/`,
  adminActivate:   (uid) => `${BASE_URL}/api/admin/users/${uid}/activate/`,
  adminChangeRole: (uid) => `${BASE_URL}/api/admin/users/${uid}/role/`,
  adminDelete:     (uid) => `${BASE_URL}/api/admin/users/${uid}/`,
};

export default BASE_URL;
