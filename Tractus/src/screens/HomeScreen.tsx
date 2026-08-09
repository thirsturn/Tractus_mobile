import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import ThreadCard from '../components/ThreadCard';
import TopNav from '../components/TopNav';
import type { ThreadResponse } from '../types';

const MOCK_HOME_THREADS: ThreadResponse[] = [
  { id: 201, title: 'Welcome to Tractus! Introduce yourself here 👋', spaceId: 1, author: { id: 10, username: 'CommunityManager', email: 'cm@test.com' } },
  { id: 202, title: 'What are you working on this weekend?', spaceId: 1, author: { id: 11, username: 'WeekendWarrior', email: 'ww@test.com' } },
  { id: 203, title: 'Tips for transitioning from frontend to full-stack?', spaceId: 1, author: { id: 12, username: 'ReactDev123', email: 'react@test.com' } },
  { id: 204, title: 'Has anyone tried the new Vite build tools?', spaceId: 1, author: { id: 13, username: 'SpeedCoder', email: 'speed@test.com' } }
];

interface HomeScreenProps {
  onThreadSelect?: (id: number) => void;
}

export default function HomeScreen({ onThreadSelect }: HomeScreenProps) {
  const [threads, setThreads] = useState<ThreadResponse[]>(MOCK_HOME_THREADS);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImagePreview(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const handleCreatePost = () => {
    if (!newTitle.trim()) return;
    const newThread: ThreadResponse = {
      id: Date.now(),
      title: newTitle.trim(),
      spaceId: 1,
      author: {
        id: 99,
        username: 'AlexDev',
        email: 'alex@tractus.app'
      }
    };
    setThreads([newThread, ...threads]);
    setNewTitle('');
    setNewContent('');
    setImagePreview(null);
    setIsCreateModalVisible(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Home Feed</Text>
        <Text style={styles.headerSubtitle}>Join the discussion</Text>
      </View>
      <TouchableOpacity style={styles.createBtn} onPress={() => setIsCreateModalVisible(true)}>
        <Feather name="plus" size={18} color="#ffffff" style={styles.createBtnIconText} />
        <Text style={styles.createBtnText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNav />
      <View style={styles.container}>
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ThreadCard 
              thread={item} 
              onPress={() => onThreadSelect && onThreadSelect(item.id)} 
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Create Post Modal */}
      <Modal visible={isCreateModalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Post</Text>
              <TouchableOpacity 
                disabled={!newTitle.trim()} 
                onPress={handleCreatePost}
              >
                <Text style={[styles.modalPostText, !newTitle.trim() && styles.modalPostDisabled]}>Post</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput
                style={styles.inputTitle}
                placeholder="Thread Title"
                placeholderTextColor="#9ca3af"
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <TextInput
                style={styles.inputContent}
                placeholder="What's on your mind? (Optional)"
                placeholderTextColor="#9ca3af"
                multiline
                value={newContent}
                onChangeText={setNewContent}
                autoFocus
              />
              
              <View style={styles.imageSection}>
                {!imagePreview ? (
                  <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                    <Feather name="image" size={18} color="#fa477a" style={{ marginRight: 8 }} />
                    <Text style={styles.addImageText}>Attach an Image</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imagePreview }} style={styles.imagePreview} contentFit="cover" />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}>
                      <Feather name="x" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e3fbf6', // Match web app background
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
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
    color: '#2a067a', // Deep purple
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
    backgroundColor: '#fa477a', // Vibrant pink
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
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalCancelText: {
    fontFamily: 'Urbanist',
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalTitle: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  modalPostText: {
    fontFamily: 'Urbanist',
    fontSize: 16,
    fontWeight: '700',
    color: '#fa477a',
  },
  modalPostDisabled: {
    color: '#fca5a5',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  inputTitle: {
    fontFamily: 'Urbanist',
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 20,
  },
  inputContent: {
    flex: 1,
    fontFamily: 'Urbanist',
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
    lineHeight: 24,
    marginBottom: 20,
  },
  imageSection: {
    marginTop: 10,
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(250, 71, 122, 0.08)',
    alignSelf: 'flex-start',
  },
  addImageText: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    fontWeight: '700',
    color: '#fa477a',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
