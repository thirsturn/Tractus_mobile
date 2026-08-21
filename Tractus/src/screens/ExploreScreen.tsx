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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ThreadCard from '../components/ThreadCard';
import spaceService from '../services/space.service';
import threadService from '../services/thread.service';
import voteService from '../services/vote.service';
import type { ThreadResponse } from '../types';

interface ExploreScreenProps {
  onBack: () => void;
  onThreadSelect?: (id: number) => void;
  onUserSelect?: (username: string) => void;
}

export default function ExploreScreen({ onBack, onThreadSelect, onUserSelect }: ExploreScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [threads, setThreads] = useState<ThreadResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const spaces = await spaceService.getAllSpaces();
        const threadsBySpace = await Promise.all(
          spaces.map(space => threadService.getThreadsBySpace(space.id))
        );
        const allThreads = threadsBySpace.flat();

        const netVotes = await Promise.all(
          allThreads.map(async thread => {
            const votes = await voteService.getThreadVotes(thread.id);
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
        console.error('Failed to load trending threads:', err);
        setError('Failed to load trending threads.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const displayThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter(thread =>
      thread.title.toLowerCase().includes(query) ||
      (thread.content || '').toLowerCase().includes(query)
    );
  }, [threads, searchQuery]);

  const renderHeader = () => (
    <View style={styles.searchHub}>
      <Text style={styles.title}>Explore Tractus</Text>
      <Text style={styles.subtitle}>Search for discussions by title or content.</Text>
      <View style={styles.searchInputContainer}>
        <Feather name="search" size={18} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search threads..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.trendingTab}>
        <Feather name="zap" size={16} color="#ffffff" />
        <Text style={styles.trendingTabText}>Trending Threads</Text>
      </View>
      {isLoading && <Text style={styles.statusText}>Loading trending threads...</Text>}
      {error && <Text style={[styles.statusText, styles.errorText]}>{error}</Text>}
      {!isLoading && !error && displayThreads.length === 0 && (
        <Text style={styles.statusText}>No threads found.</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Explore</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={isLoading || error ? [] : displayThreads}
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
    paddingBottom: 20,
  },
  searchHub: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Urbanist',
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Urbanist',
    fontSize: 15,
    color: '#1a1a2e',
    paddingVertical: 12,
  },
  trendingTab: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2a067a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  trendingTabText: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusText: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#6b7280',
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
  },
});
