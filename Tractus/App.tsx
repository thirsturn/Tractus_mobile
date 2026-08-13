import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ThreadDetailsScreen from './src/screens/ThreadDetailsScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {isAuthenticated ? (
        isCreatingPost ? (
          <CreatePostScreen 
            onBack={() => setIsCreatingPost(false)} 
            onSuccess={() => setIsCreatingPost(false)} 
          />
        ) : selectedUsername ? (
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
            onCreatePost={() => setIsCreatingPost(true)} 
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
