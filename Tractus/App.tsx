import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ThreadDetailsScreen from './src/screens/ThreadDetailsScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    'Urbanist': require('./assets/urbanist.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Wait for fonts to load before rendering anything
  }

  if (isLoading) {
    return <LoadingScreen onFinishLoading={() => setIsLoading(false)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {isLoggedIn ? (
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
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}
