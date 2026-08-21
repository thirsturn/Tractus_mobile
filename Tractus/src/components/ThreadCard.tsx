import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import type { ThreadResponse } from '../types';
import { LOCAL_IP } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface ThreadCardProps {
  thread: ThreadResponse;
  onPress?: () => void;
  onUserSelect?: (username: string) => void;
}

export default function ThreadCard({ thread, onPress, onUserSelect }: ThreadCardProps) {
  const { colors } = useTheme();
  const upvotes = Math.floor(Math.random() * 50); // To be replaced with real vote data
  const commentsCount = thread.commentCount || 0;

  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card, 
          borderColor: colors.border 
        }
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => onUserSelect && onUserSelect(thread.author.username)}
          >
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarText}>
                {thread.author.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.authorName, { color: colors.text }]}>{thread.author.username}</Text>
          </TouchableOpacity>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>• Just now</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{thread.title}</Text>

        {thread.content && (
          <Text style={[styles.previewText, { color: colors.textMuted }]} numberOfLines={3}>
            {thread.content}
          </Text>
        )}

        {thread.imageUrl && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: thread.imageUrl.replace('http://localhost', `http://${LOCAL_IP}`) }}
              style={styles.threadImage} 
              contentFit="cover" 
            />
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.inputBg }]}>
            <Feather name="message-square" size={16} color={colors.textMuted} />
            <Text style={[styles.actionText, { color: colors.textMuted }]}>{commentsCount} Comments</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  votingContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  voteBtn: {
    padding: 4,
    borderRadius: 4,
  },
  voteCount: {
    fontFamily: 'Urbanist',
    fontWeight: '700',
    fontSize: 14,
    color: '#1a1a2e',
    marginVertical: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7fbd78', // Soft green from web
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  authorName: {
    fontFamily: 'Urbanist',
    fontWeight: '600',
    fontSize: 13,
    color: '#1a1a2e',
    marginRight: 6,
  },
  metaText: {
    fontFamily: 'Urbanist',
    color: '#6b7280',
    fontSize: 12,
  },
  title: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
    lineHeight: 24,
  },
  previewText: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  threadImage: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6', // Light gray background for button
  },
  actionText: {
    fontFamily: 'Urbanist',
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});
