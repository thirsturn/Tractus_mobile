import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ThreadCard from '../components/ThreadCard';
import spaceService from '../services/space.service';
import threadService from '../services/thread.service';
import userService from '../services/user.service';
import voteService from '../services/vote.service';
import type { ThreadResponse, User, SpaceResponse } from '../types';
import { useTheme } from '../context/ThemeContext';
import { getImageUrl } from '../utils/imageUrl';

interface ExploreScreenProps {
  onBack: () => void;
  onThreadSelect?: (id: number) => void;
  onUserSelect?: (username: string) => void;
}

type SearchCategory = 'threads' | 'users' | 'topics';

export default function ExploreScreen({ onBack, onThreadSelect, onUserSelect }: ExploreScreenProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchCategory>('threads');

  const [threads, setThreads] = useState<ThreadResponse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [spaces, setSpaces] = useState<SpaceResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExploreData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedSpaces, fetchedUsers] = await Promise.all([
          spaceService.getAllSpaces(),
          userService.getAllUsers().catch(() => [] as User[]),
        ]);
        setSpaces(fetchedSpaces);
        setUsers(fetchedUsers);

        const threadsBySpace = await Promise.all(
          fetchedSpaces.map(space => threadService.getThreadsBySpace(space.id))
        );
        const allThreads = threadsBySpace.flat();

        const netVotes = await Promise.all(
          allThreads.map(async thread => {
            const votes = await voteService.getThreadVotes(thread.id).catch(() => []);
            const up = votes.filter(v => v.voteType === 'UP').length;
            const down = votes.filter(v => v.voteType === 'DOWN').length;
            return up - down;
          })
        );

        const sorted = allThreads
          .map((thread, idx) => ({ thread, votes: netVotes[idx] }))
          .sort((a, b) => b.votes - a.votes)
          .map(entry => entry.thread);

        setThreads(sorted);
      } catch (err) {
        console.error('Failed to load explore items:', err);
        setError('Failed to load explore content.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExploreData();
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const filteredThreads = useMemo(() => {
    if (!query) return threads;
    return threads.filter(thread =>
      thread.title.toLowerCase().includes(query) ||
      (thread.content || '').toLowerCase().includes(query)
    );
  }, [threads, query]);

  const filteredUsers = useMemo(() => {
    if (!query) return users;
    return users.filter(u =>
      u.username.toLowerCase().includes(query) ||
      (u.bio || '').toLowerCase().includes(query) ||
      (u.firstName || '').toLowerCase().includes(query) ||
      (u.lastName || '').toLowerCase().includes(query)
    );
  }, [users, query]);

  const filteredTopics = useMemo(() => {
    if (!query) return spaces;
    return spaces.filter(space =>
      space.name.toLowerCase().includes(query) ||
      (space.description || '').toLowerCase().includes(query)
    );
  }, [spaces, query]);

  const topicThreadCountMap = useMemo(() => {
    const map: Record<number, number> = {};
    threads.forEach(t => {
      if (t.spaceId) {
        map[t.spaceId] = (map[t.spaceId] || 0) + 1;
      }
    });
    return map;
  }, [threads]);

  const renderHeader = () => (
    <View style={[styles.searchHub, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Explore Tractus</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Search for discussions, user accounts, or topics.
      </Text>
      
      <View style={[styles.searchInputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search threads, users, or topics..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            { borderColor: colors.border, backgroundColor: colors.background },
            activeTab === 'threads' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setActiveTab('threads')}
        >
          <Feather name={query ? "message-square" : "zap"} size={14} color={activeTab === 'threads' ? "#ffffff" : colors.textMuted} />
          <Text style={[styles.tabBtnText, { color: colors.textMuted }, activeTab === 'threads' && { color: "#ffffff" }]}>
            {query ? 'Discussions' : 'Trending'} ({filteredThreads.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            { borderColor: colors.border, backgroundColor: colors.background },
            activeTab === 'users' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setActiveTab('users')}
        >
          <Feather name="users" size={14} color={activeTab === 'users' ? "#ffffff" : colors.textMuted} />
          <Text style={[styles.tabBtnText, { color: colors.textMuted }, activeTab === 'users' && { color: "#ffffff" }]}>
            Accounts ({filteredUsers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            { borderColor: colors.border, backgroundColor: colors.background },
            activeTab === 'topics' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setActiveTab('topics')}
        >
          <Feather name="hash" size={14} color={activeTab === 'topics' ? "#ffffff" : colors.textMuted} />
          <Text style={[styles.tabBtnText, { color: colors.textMuted }, activeTab === 'topics' && { color: "#ffffff" }]}>
            Topics ({filteredTopics.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && <Text style={[styles.statusText, { color: colors.textMuted }]}>Loading explore content...</Text>}
      {error && <Text style={[styles.statusText, styles.errorText]}>{error}</Text>}

      {!isLoading && !error && activeTab === 'threads' && filteredThreads.length === 0 && (
        <Text style={[styles.statusText, { color: colors.textMuted }]}>No discussions found.</Text>
      )}

      {!isLoading && !error && activeTab === 'users' && filteredUsers.length === 0 && (
        <Text style={[styles.statusText, { color: colors.textMuted }]}>No user accounts found.</Text>
      )}

      {!isLoading && !error && activeTab === 'topics' && filteredTopics.length === 0 && (
        <Text style={[styles.statusText, { color: colors.textMuted }]}>No topics found.</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>Explore</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* RENDER CATEGORY LIST CONTENT */}
      {activeTab === 'threads' && (
        <FlatList
          data={isLoading || error ? [] : filteredThreads}
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
      )}

      {activeTab === 'users' && (
        <FlatList
          data={isLoading || error ? [] : filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => onUserSelect && onUserSelect(item.username)}
            >
              <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                {item.profileImageUrl ? (
                  <Image source={{ uri: getImageUrl(item.profileImageUrl) }} style={styles.userAvatarImg} />
                ) : (
                  <Text style={styles.userAvatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>@{item.username}</Text>
                <Text style={[styles.userBio, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.bio || 'No bio available'}
                </Text>
              </View>
              <View style={[styles.viewBtn, { borderColor: colors.primary }]}>
                <Text style={[styles.viewBtnText, { color: colors.primary }]}>View</Text>
              </View>
            </TouchableOpacity>
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === 'topics' && (
        <FlatList
          data={isLoading || error ? [] : filteredTopics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.topicCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                setSearchQuery(item.name);
                setActiveTab('threads');
              }}
            >
              <View style={styles.topicIcon}>
                <Text style={styles.topicIconText}>#</Text>
              </View>
              <View style={styles.topicInfo}>
                <Text style={[styles.topicName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.topicDesc, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.description || 'General discussion space'}
                </Text>
              </View>
              <View style={[styles.topicBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.topicBadgeText, { color: colors.textMuted }]}>
                  {topicThreadCountMap[item.id] || 0} posts
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 12,
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
    paddingBottom: 40,
  },
  searchHub: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Urbanist',
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 14,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#1a1a2e',
    paddingVertical: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabBtnText: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    fontWeight: '600',
  },
  statusText: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#6b7280',
    marginTop: 14,
  },
  errorText: {
    color: '#ef4444',
  },
  // User Cards
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userAvatarImg: {
    width: '100%',
    height: '100%',
  },
  userAvatarText: {
    fontFamily: 'Urbanist',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  userName: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    fontWeight: '700',
  },
  userBio: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    marginTop: 2,
  },
  viewBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  viewBtnText: {
    fontFamily: 'Urbanist',
    fontSize: 12,
    fontWeight: '700',
  },
  // Topic Cards
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  topicIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicIconText: {
    fontFamily: 'Urbanist',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
  },
  topicInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  topicName: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    fontWeight: '700',
  },
  topicDesc: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    marginTop: 2,
  },
  topicBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicBadgeText: {
    fontFamily: 'Urbanist',
    fontSize: 12,
    fontWeight: '600',
  },
});
