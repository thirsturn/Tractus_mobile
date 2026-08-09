import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ThreadResponse } from '../types';
import ThreadCard from '../components/ThreadCard';

interface UserProfileScreenProps {
  username: string;
  onBack: () => void;
  onThreadSelect?: (id: number) => void;
  onUserSelect?: (username: string) => void;
}

const MOCK_USER_POSTS: ThreadResponse[] = [
  { id: 301, title: 'My experience building a full-stack app with Spring Boot and React', spaceId: 1, author: { id: 1, username: 'user', email: 'user@test.com' } },
  { id: 302, title: 'Best VS Code extensions for Java developers in 2026', spaceId: 2, author: { id: 1, username: 'user', email: 'user@test.com' } },
  { id: 303, title: 'How I improved my API response times by 300%', spaceId: 1, author: { id: 1, username: 'user', email: 'user@test.com' } },
];

export default function UserProfileScreen({ username, onBack, onThreadSelect, onUserSelect }: UserProfileScreenProps) {
  const userPosts = MOCK_USER_POSTS.map(post => ({
    ...post,
    author: { ...post.author, username: username }
  }));

  const renderHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.banner} />
      <View style={styles.headerContent}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>{username.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.bio}>Passionate developer and community contributor.</Text>
        
        <View style={styles.metaRow}>
          <Feather name="mail" size={14} color="#6b7280" />
          <Text style={styles.metaText}>{username}@tractus.dev</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={14} color="#6b7280" />
          <Text style={styles.metaText}>San Francisco, CA</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="link" size={14} color="#6b7280" />
          <Text style={[styles.metaText, styles.linkText]}>https://tractus.dev</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="calendar" size={14} color="#6b7280" />
          <Text style={styles.metaText}>Joined July 2026</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{userPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>89</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionTitleContainer}>
        <Feather name="message-square" size={20} color="#1a1a2e" />
        <Text style={styles.sectionTitle}>Recent Posts</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <ThreadCard 
              thread={item} 
              onPress={() => onThreadSelect && onThreadSelect(item.id)}
              onUserSelect={onUserSelect}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  listContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  banner: {
    height: 100,
    backgroundColor: '#2a067a', // Deep purple
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarWrapper: {
    marginTop: -40,
    marginBottom: 12,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7fbd78',
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextLarge: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  username: {
    fontFamily: 'Urbanist',
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  bio: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
  linkText: {
    color: '#fa477a',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statBlock: {
    marginRight: 24,
  },
  statNumber: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  statLabel: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginLeft: 8,
  },
});
