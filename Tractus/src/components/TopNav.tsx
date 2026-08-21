import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Modal, FlatList, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageUrl';

interface TopNavProps {
  onUserSelect?: (username: string) => void;
  onThreadSelect?: (id: number) => void;
  onExplorePress?: () => void;
}

// TODO: Fetch real notifications from backend
const INITIAL_NOTIFICATIONS: { id: number; type: string; user: string; action: string; time: string; read: boolean; threadId: number }[] = [];

export default function TopNav({ onUserSelect, onThreadSelect, onExplorePress }: TopNavProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
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
      style={[
        styles.notificationItem, 
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
        !item.read && { backgroundColor: colors.subtleBg }
      ]}
      onPress={() => handleNotificationPress(item.threadId)}
    >
      <View style={[styles.notificationIconContainer, { backgroundColor: colors.inputBg }]}>
        {item.type === 'upvote' && <Feather name="heart" size={16} color={colors.secondary} />}
        {item.type === 'comment' && <Feather name="message-square" size={16} color={colors.primary} />}
        {item.type === 'mention' && <Feather name="at-sign" size={16} color={colors.accent} />}
      </View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationText, { color: colors.textMuted }]}>
          <Text style={[styles.notificationUser, { color: colors.text }]}>{item.user} </Text>
          {item.action}
        </Text>
        <Text style={[styles.notificationTime, { color: colors.textMuted }]}>{item.time}</Text>
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

      {/* Actions (Theme, Search, Notifications & Profile) */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
          <Feather name={isDark ? "sun" : "moon"} size={22} color={isDark ? "#f59e0b" : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onExplorePress}>
          <Feather name="search" size={22} color={colors.text} />
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
    marginRight: 8,
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
