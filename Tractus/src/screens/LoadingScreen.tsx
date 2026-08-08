import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';

export default function LoadingScreen({ onFinishLoading }: { onFinishLoading?: () => void }) {
  useEffect(() => {
    // Simulate a loading process
    if (onFinishLoading) {
      const timer = setTimeout(() => {
        onFinishLoading();
      }, 3000); // 3 seconds loading time
      return () => clearTimeout(timer);
    }
  }, [onFinishLoading]);

  return (
    <View style={styles.container}>
      {/* Assuming icon.png exists in the assets folder */}
      <Image
        source={require('../../assets/Tractus.svg')}
        style={styles.logo}
        contentFit="contain"
      />
      
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background as requested
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40, // Space between logo and loading indicator
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
});
