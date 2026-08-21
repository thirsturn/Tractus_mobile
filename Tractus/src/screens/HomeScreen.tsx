import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ThreadCard from '../components/ThreadCard';
import TopNav from '../components/TopNav';
import type { ThreadResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import threadService from '../services/thread.service';

interface HomeScreenProps {
  onThreadSelect?: (id: number) => void;
  onUserSelect?: (username: string) => void;
  onCreatePost?: () => void;
  onExplorePress?: () => void;
  onMessagesPress?: () => void;
}

export default function HomeScreen({ onThreadSelect, onUserSelect, onCreatePost, onExplorePress, onMessagesPress }: HomeScreenProps) {
  const [threads, setThreads] = useState<ThreadResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();

  const fetchThreads = async () => {
    try {
      const data = await threadService.getThreadsBySpace(1);
      setThreads(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    }
  };

  React.useEffect(() => {
    fetchThreads();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchThreads();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Home Feed</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Join the discussion</Text>
      </View>
      <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]} onPress={onCreatePost}>
        <Feather name="plus" size={18} color="#ffffff" style={styles.createBtnIconText} />
        <Text style={styles.createBtnText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <TopNav onUserSelect={onUserSelect} onThreadSelect={onThreadSelect} onExplorePress={onExplorePress} onMessagesPress={onMessagesPress} />
      <View style={styles.container}>
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ThreadCard 
              thread={item} 
              onPress={() => onThreadSelect && onThreadSelect(item.id)}
              onUserSelect={onUserSelect}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0e9ef',
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontFamily: 'Urbanist',
    fontSize: 28,
    fontWeight: '800',
    color: '#2a067a',
  },
  headerSubtitle: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fa477a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#fa477a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnIconText: {
    marginRight: 6,
  },
  createBtnText: {
    fontFamily: 'Urbanist',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  }
});
