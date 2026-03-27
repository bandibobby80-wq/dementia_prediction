# Dementia Prediction Mobile App (Expo)

This folder contains the mobile application built with **Expo (React Native)**. It connects directly to your live Django backend on Render to provide real-time AI predictions.

## 🚀 How to Run the App

### 1. Prerequisites
- Install **Node.js** on your computer.
- Download the **Expo Go** app on your physical smartphone (iOS or Android).

### 2. Start the Development Server
Navigate to the `mobile_app` folder in your terminal and run:
```bash
cd mobile_app
npm start
```

### 3. Open on Your Phone
- A QR code will appear in your terminal.
- **Android**: Open the **Expo Go** app and tap "Scan QR Code".
- **iOS**: Open your **Camera app** and scan the QR code.
- Your app will wirelessly load onto your phone!

## 🛠️ How it Works
1. **Frontend**: Built with React Native and styled with a modern dark theme.
2. **Backend**: Points to `https://personalized-dementia-prediction.onrender.com/api/predict/`.
3. **AI Logic**: When you submit the form on the app, it sends a JSON request to your Render server, which runs your Random Forest model and returns the diagnosis instantly.
