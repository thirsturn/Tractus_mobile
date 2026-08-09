import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ThreadDetailsScreen from './src/screens/ThreadDetailsScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  if (isAppLoading) {
    return <LoadingScreen onFinishLoading={() => setIsAppLoading(false)} />;
  }

  // Show a brief spinner while checking stored auth session
  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e3fbf6' }}>
        <ActivityIndicator size="large" color="#2a067a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {isAuthenticated ? (
        selectedUsername ? (
          <UserProfileScreen 
            username={selectedUsername} 
            onBack={() => setSelectedUsername(null)}
            onThreadSelect={setSelectedThreadId}
            onUserSelect={setSelectedUsername}
          />
        ) : selectedThreadId ? (
          <ThreadDetailsScreen 
            threadId={selectedThreadId} 
            onBack={() => setSelectedThreadId(null)} 
            onUserSelect={setSelectedUsername}
            onThreadSelect={setSelectedThreadId}
          />
        ) : (
          <HomeScreen 
            onThreadSelect={setSelectedThreadId} 
            onUserSelect={setSelectedUsername}
          />
        )
      ) : (
        <LoginScreen />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Urbanist': require('./assets/urbanist.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
