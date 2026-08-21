import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Modal, FlatList, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageUrl';
import notificationService from '../services/notification.service';
import type { NotificationResponse } from '../types';

interface TopNavProps {
  onUserSelect?: (username: string) => void;
  onThreadSelect?: (id: number) => void;
  onExplorePress?: () => void;
  onMessagesPress?: () => void;
}

export default function TopNav({ onUserSelect, onThreadSelect, onExplorePress, onMessagesPress }: TopNavProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getUserNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationPress = async (item: NotificationResponse) => {
    if (!item.read) {
      try {
        await notificationService.markAsRead(item.id);
        setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
    setIsNotificationsOpen(false);

    if (item.targetThreadId && onThreadSelect) {
      onThreadSelect(item.targetThreadId);
    } else if (item.type === 'MESSAGE' && onMessagesPress) {
      onMessagesPress();
    } else if (item.type === 'FOLLOW' && onUserSelect) {
      onUserSelect(item.actor.username);
    }
  };

  const renderNotification = ({ item }: { item: NotificationResponse }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
        !item.read && { backgroundColor: colors.subtleBg }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.notificationIconContainer, { backgroundColor: colors.inputBg }]}>
        {item.type === 'UPVOTE' && <Feather name="heart" size={16} color={colors.secondary} />}
        {item.type === 'COMMENT' && <Feather name="message-square" size={16} color={colors.primary} />}
        {item.type === 'FOLLOW' && <Feather name="user-plus" size={16} color={colors.accent} />}
        {item.type === 'MESSAGE' && <Feather name="mail" size={16} color={colors.primary} />}
      </View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationText, { color: colors.text }]}>
          {item.message}
        </Text>
        <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
          {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
        </Text>
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.secondary }]} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {/* Brand / Logo */}
      <TouchableOpacity style={styles.brandContainer}>
        <Image
          source={require('../../assets/Tractus.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </TouchableOpacity>

      {/* Actions (Theme, Search, Messages, Notifications & Profile) */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
          <Feather name={isDark ? "sun" : "moon"} size={22} color={isDark ? "#f59e0b" : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onExplorePress}>
          <Feather name="search" size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onMessagesPress}>
          <Feather name="message-square" size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsNotificationsOpen(true)}>
          <Feather name="bell" size={22} color={colors.text} />
          {unreadCount > 0 && <View style={[styles.notificationBadge, { backgroundColor: colors.secondary, borderColor: colors.surface }]} />}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.profileBtn, { backgroundColor: colors.primary }]} onPress={() => onUserSelect && user && onUserSelect(user.username)}>
          {user?.profileImageUrl ? (
            <Image source={{ uri: getImageUrl(user.profileImageUrl) }} style={styles.profileImage} contentFit="cover" />
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
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.surface }]}>
          <View style={[styles.notificationsDropdown, { backgroundColor: colors.surface }]}>
            <View style={[styles.notificationsHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => setIsNotificationsOpen(false)} style={styles.closeBtn}>
                  <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.notificationsTitle, { color: colors.text }]}>Notifications</Text>
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity style={styles.markReadBtn} onPress={markAllAsRead}>
                  <Feather name="check" size={14} color={colors.secondary} />
                  <Text style={[styles.markReadText, { color: colors.secondary }]}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderNotification}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>You're all caught up!</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  brandContainer: {
    justifyContent: 'center',
  },
  logo: {
    width: 84,
    height: 28,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconBtn: {
    padding: 6,
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
    backgroundColor: '#fff1f2',
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
