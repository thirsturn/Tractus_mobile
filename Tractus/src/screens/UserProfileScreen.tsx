import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ThreadResponse } from '../types';
import ThreadCard from '../components/ThreadCard';
import { CURRENT_USER } from '../constants/auth';

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
  const isOwnProfile = username === CURRENT_USER.username;
  
  const [bio, setBio] = useState('Passionate developer and community contributor.');
  const [location, setLocation] = useState('San Francisco, CA');
  const [website, setWebsite] = useState('https://tractus.dev');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const userPosts = MOCK_USER_POSTS.map(post => ({
    ...post,
    author: { ...post.author, username: username }
  }));

  const startEditing = () => {
    setEditBio(bio);
    setEditLocation(location);
    setEditWebsite(website);
    setEditCurrentPassword('');
    setEditPassword('');
    setError(null);
    setIsEditing(true);
  };

  const saveProfile = () => {
    setError(null);
    if (editPassword && !editCurrentPassword) {
      setError('Please enter your current password to set a new password.');
      return;
    }
    
    // In a real app we would call the backend here, validate password, etc.
    // For now we just mock a successful update
    setBio(editBio);
    setLocation(editLocation);
    setWebsite(editWebsite);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const renderHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.banner} />
      <View style={styles.headerContent}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>{username.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.nameRow}>
          <Text style={styles.username}>{username}</Text>
          {isOwnProfile && !isEditing && (
            <TouchableOpacity style={styles.editBtn} onPress={startEditing}>
              <Feather name="edit-3" size={14} color="#1a1a2e" />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
          {isOwnProfile && isEditing && (
            <View style={styles.editActionsRow}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                <Feather name="save" size={14} color="#ffffff" />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEditing}>
                <Feather name="x" size={14} color="#6b7280" />
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isEditing ? (
          <TextInput
            style={styles.bioInput}
            value={editBio}
            onChangeText={setEditBio}
            placeholder="Write a bio..."
            placeholderTextColor="#9ca3af"
            multiline
          />
        ) : (
          <Text style={styles.bio}>{bio}</Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.metaRow}>
          <Feather name="mail" size={14} color="#6b7280" />
          <Text style={styles.metaText}>{username}@tractus.dev</Text>
        </View>

        <View style={styles.metaRow}>
          <Feather name="map-pin" size={14} color="#6b7280" />
          {isEditing ? (
            <TextInput
              style={styles.inlineInput}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Location"
              placeholderTextColor="#9ca3af"
            />
          ) : (
            <Text style={styles.metaText}>{location}</Text>
          )}
        </View>

        <View style={styles.metaRow}>
          <Feather name="link" size={14} color="#6b7280" />
          {isEditing ? (
            <TextInput
              style={styles.inlineInput}
              value={editWebsite}
              onChangeText={setEditWebsite}
              placeholder="Website URL"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="url"
            />
          ) : (
            <Text style={[styles.metaText, styles.linkText]}>{website}</Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.passwordSection}>
            <View style={styles.metaRow}>
              <Feather name="lock" size={14} color="#6b7280" />
              <TextInput
                style={styles.inlineInput}
                value={editCurrentPassword}
                onChangeText={setEditCurrentPassword}
                placeholder="Current password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>
            <View style={styles.metaRow}>
              <Feather name="lock" size={14} color="#6b7280" />
              <TextInput
                style={styles.inlineInput}
                value={editPassword}
                onChangeText={setEditPassword}
                placeholder="New password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>
          </View>
        )}

        {!isEditing && (
          <View style={styles.metaRow}>
            <Feather name="calendar" size={14} color="#6b7280" />
            <Text style={styles.metaText}>Joined July 2026</Text>
          </View>
        )}

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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  username: {
    fontFamily: 'Urbanist',
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  editBtnText: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
    marginLeft: 4,
  },
  editActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fa477a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  saveBtnText: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 4,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  cancelBtnText: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 4,
  },
  bio: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  bioInput: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    color: '#1a1a2e',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: 'Urbanist',
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8,
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
  inlineInput: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    color: '#1a1a2e',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
    flex: 1,
  },
  passwordSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
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
