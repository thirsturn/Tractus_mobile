import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import React, { useState } from 'react';
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onFinishLoading={() => setIsLoading(false)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <LoginScreen />
      <StatusBar style="auto" />
    </View>
  );
}
