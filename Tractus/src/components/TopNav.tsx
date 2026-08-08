import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';

export default function TopNav() {
  return (
    <View style={styles.container}>
      {/* Brand / Logo */}
      <TouchableOpacity style={styles.brandContainer}>
        <Image
          source={require('../../assets/Tractus.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </TouchableOpacity>

      {/* Actions (Notifications & Profile) */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="bell" size={22} color="#1a1a2e" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileBtn}>
          <Text style={styles.profileText}>U</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    // Add top padding to lower the navbar, accounting for the status bar on Android
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  brandContainer: {
    justifyContent: 'center',
  },
  logo: {
    width: 90,
    height: 30,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginRight: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fa477a', // Vibrant pink for badge
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a067a', // Deep purple
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#ffffff',
    fontFamily: 'Urbanist',
    fontWeight: '700',
    fontSize: 14,
  },
});
