import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Modal, FlatList, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface TopNavProps {
  onUserSelect?: (username: string) => void;
  onThreadSelect?: (id: number) => void;
  onExplorePress?: () => void;
}

// TODO: Fetch real notifications from backend
const INITIAL_NOTIFICATIONS: { id: number; type: string; user: string; action: string; time: string; read: boolean; threadId: number }[] = [];

export default function TopNav({ onUserSelect, onThreadSelect, onExplorePress }: TopNavProps) {
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationPress = (threadId: number) => {
    setIsNotificationsOpen(false);
    if (onThreadSelect) {
      onThreadSelect(threadId);
    }
  };

  const renderNotification = ({ item }: { item: typeof INITIAL_NOTIFICATIONS[0] }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.notificationItemUnread]}
      onPress={() => handleNotificationPress(item.threadId)}
    >
      <View style={styles.notificationIconContainer}>
        {item.type === 'upvote' && <Feather name="heart" size={16} color="#fa477a" />}
        {item.type === 'comment' && <Feather name="message-square" size={16} color="#3b82f6" />}
        {item.type === 'mention' && <Feather name="at-sign" size={16} color="#7fbd78" />}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          <Text style={styles.notificationUser}>{item.user} </Text>
          {item.action}
        </Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

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
        <TouchableOpacity style={styles.iconBtn} onPress={onExplorePress}>
          <Feather name="search" size={22} color="#1a1a2e" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsNotificationsOpen(true)}>
          <Feather name="bell" size={22} color="#1a1a2e" />
          {unreadCount > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileBtn} onPress={() => onUserSelect && user && onUserSelect(user.username)}>
          {user?.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} style={styles.profileImage} contentFit="cover" />
          ) : (
            <Text style={styles.profileText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Notifications Modal Overlay */}
      <Modal
        visible={isNotificationsOpen}
        animationType="slide"
        onRequestClose={() => setIsNotificationsOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.notificationsDropdown}>
            <View style={styles.notificationsHeader}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => setIsNotificationsOpen(false)} style={styles.closeBtn}>
                  <Feather name="x" size={24} color="#1a1a2e" />
                </TouchableOpacity>
                <Text style={styles.notificationsTitle}>Notifications</Text>
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity style={styles.markReadBtn} onPress={markAllAsRead}>
                  <Feather name="check" size={14} color="#fa477a" />
                  <Text style={styles.markReadText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderNotification}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>You're all caught up!</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    zIndex: 10,
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
    backgroundColor: '#fa477a',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a067a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#ffffff',
    fontFamily: 'Urbanist',
    fontWeight: '700',
    fontSize: 14,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  
  // Notification Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  notificationsDropdown: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    marginRight: 12,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notificationsTitle: {
    fontFamily: 'Urbanist',
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markReadText: {
    fontFamily: 'Urbanist',
    fontSize: 12,
    fontWeight: '600',
    color: '#fa477a',
    marginLeft: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notificationItemUnread: {
    backgroundColor: '#fff1f2', // very light pink bg for unread
  },
  notificationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  notificationUser: {
    fontWeight: '700',
    color: '#1a1a2e',
  },
  notificationTime: {
    fontFamily: 'Urbanist',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fa477a',
    marginLeft: 12,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#6b7280',
  },
});
