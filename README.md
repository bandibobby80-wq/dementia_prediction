# DementiaAI — Personalized Dementia Prediction

A full-stack project combining a **Django REST backend** (deployed on Render) with a **React Native (Expo SDK 54)** mobile application.

---

## 📁 Project Structure

```
latest_project/
├── backend/                   # API layer reference & config
│   ├── config.py              # Python API endpoint config
│   └── README.md              # Full API endpoint docs
│
├── frontend/                  # React Native (Expo) mobile app
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js         # API base URL + all endpoints
│   │   ├── services/
│   │   │   └── apiService.js  # Axios instance + all API calls
│   │   ├── context/
│   │   │   └── AuthContext.js # Global auth state (SecureStore)
│   │   ├── theme/
│   │   │   └── colors.js      # Design tokens (colors, fonts, radius)
│   │   ├── components/        # Reusable UI components
│   │   │   ├── GradientBackground.js
│   │   │   ├── StyledInput.js
│   │   │   ├── PrimaryButton.js
│   │   │   ├── Card.js
│   │   │   ├── StatCard.js
│   │   │   ├── Badge.js
│   │   │   └── LoadingOverlay.js
│   │   ├── navigation/        # React Navigation
│   │   │   ├── RootNavigator.js   # Auth → User/Admin router
│   │   │   ├── AuthNavigator.js   # Login + Register stack
│   │   │   ├── UserNavigator.js   # Bottom tabs (user)
│   │   │   └── AdminNavigator.js  # Bottom tabs (admin)
│   │   └── screens/
│   │       ├── auth/
│   │       │   ├── LoginScreen.js
│   │       │   └── RegisterScreen.js
│   │       ├── user/
│   │       │   ├── DashboardScreen.js
│   │       │   ├── PredictionScreen.js
│   │       │   ├── HistoryScreen.js
│   │       │   └── ProfileScreen.js
│   │       └── admin/
│   │           ├── AdminDashboardScreen.js
│   │           ├── AdminUsersScreen.js
│   │           ├── AdminPredictionsScreen.js
│   │           └── AdminLogsScreen.js
│   ├── App.js
│   ├── index.js
│   ├── app.json
│   ├── package.json
│   └── babel.config.js
│
├── users/                     # Django users app (backend)
│   ├── models.py              # includes MobileAuthToken model
│   ├── api_views.py           # ← NEW: all REST API views
│   └── views.py               # existing Django web views
│
└── personalised_dementia_prediction/
    └── urls.py                # ← updated with /api/* routes
```

---

## 🚀 Installation & Running

### 1. Backend — Apply new migration (local dev only)
The deployed Render backend auto-runs migrations. For local:
```bash
cd latest_project
python manage.py migrate
python manage.py runserver
```

### 2. Mobile App — Install & Start
```bash
cd latest_project/frontend
npm install
npx expo start
```

Then scan the QR code with **Expo Go** (Android/iOS) or press:
- `a` — Open Android emulator
- `i` — Open iOS simulator
- `w` — Open in browser

---

## 📱 Mobile App Features

### User Flow
| Screen | Features |
|--------|----------|
| **Login** | Token auth, remember session via SecureStore |
| **Register** | Full validation (password strength, mobile format, email) |
| **Dashboard** | Stats cards, last prediction, quick actions, info cards |
| **Prediction** | 11-field clinical form, sample fill, animated confidence bar |
| **History** | Expandable rows with full input details, pull-to-refresh |
| **Profile** | User info, address, role badges, sign-out confirmation |

### Admin Flow
| Screen | Features |
|--------|----------|
| **Overview** | Total users, active/pending counts, predictions, recent logs |
| **Users** | Activate pending accounts, delete users, status badges |
| **Predictions** | All predictions across all users with clinical meta chips |
| **Audit Log** | Color-coded activity log with action type, IP, timestamp |
| **Account** | Same profile screen as regular users |

---

## 🔑 Admin Login
```
Login ID: admin
Password: admin
```

---

## 🌐 API Base URL
```
https://personalized-dementia-prediction.onrender.com
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 5.2, Python, scikit-learn (RF + LR models) |
| API | Vanilla Django JSON views — no DRF dependency |
| Auth (Mobile) | Token-based (`MobileAuthToken` model) |
| Auth (Web) | Django sessions (unchanged) |
| Mobile | React Native + Expo SDK 54 |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| HTTP | Axios with request interceptors |
| Storage | expo-secure-store (token persistence) |
| UI | Custom dark-teal design system, expo-linear-gradient |
| Icons | @expo/vector-icons (Ionicons) |
| Notifications | react-native-toast-message |

---

## ⚠️ Notes
- The ML prediction uses a **Random Forest** model trained on the OASIS dataset.
- Predictions are for **informational purposes only**; always consult a medical professional.
- New user accounts require **admin activation** before login is permitted.
- The `admin` / `admin` shortcut uses a static token and bypasses the DB lookup.
