// App.js — root entry point
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import RootNavigator   from './src/navigation/RootNavigator';

// Keep the splash screen visible until auth state is resolved
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Hide splash when React tree is mounted
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#0f172a" translucent={false} />
      <RootNavigator />
      <Toast
        config={{
          success: ({ text1, text2 }) => (
            <View style={{ width: '90%', backgroundColor: '#1e293b', borderLeftWidth: 5, borderLeftColor: '#2dd4bf', borderRadius: 6, paddingVertical: 12, paddingHorizontal: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}>
              {text1 ? <Text style={{ color: '#f1f5f9', fontSize: 15, fontWeight: '700', marginBottom: 2 }}>{text1}</Text> : null}
              {text2 ? <Text style={{ color: '#94a3b8', fontSize: 13 }}>{text2}</Text> : null}
            </View>
          ),
          error: ({ text1, text2 }) => (
            <View style={{ width: '90%', backgroundColor: '#1e293b', borderLeftWidth: 5, borderLeftColor: '#ef4444', borderRadius: 6, paddingVertical: 12, paddingHorizontal: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}>
              {text1 ? <Text style={{ color: '#f1f5f9', fontSize: 15, fontWeight: '700', marginBottom: 2 }}>{text1}</Text> : null}
              {text2 ? <Text style={{ color: '#94a3b8', fontSize: 13 }}>{text2}</Text> : null}
            </View>
          ),
        }}
        position="top"
        topOffset={50}
        visibilityTime={3500}
      />
    </AuthProvider>
  );
}
