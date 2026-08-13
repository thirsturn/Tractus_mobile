import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ThreadDetailsScreen from './src/screens/ThreadDetailsScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {isAuthenticated ? (
        isCreatingPost ? (
          <CreatePostScreen 
            onBack={() => setIsCreatingPost(false)} 
            onSuccess={() => setIsCreatingPost(false)} 
          />
        ) : selectedThreadId ? (
          <ThreadDetailsScreen 
            threadId={selectedThreadId} 
            onBack={() => setSelectedThreadId(null)} 
          />
        ) : (
          <HomeScreen 
            onThreadSelect={setSelectedThreadId} 
            onCreatePost={() => setIsCreatingPost(true)} 
          />
        )
      ) : (
        <LoginScreen onLogin={() => {}} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    'Urbanist': require('./assets/urbanist.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading) {
    return <LoadingScreen onFinishLoading={() => setIsLoading(false)} />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
