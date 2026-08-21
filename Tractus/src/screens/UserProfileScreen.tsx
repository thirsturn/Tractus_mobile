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
import type { ThreadResponse, User } from '../types';
import ThreadCard from '../components/ThreadCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import userService from '../services/user.service';
import threadService from '../services/thread.service';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

export interface UserProfileScreenProps {
  username: string;
  onBack: () => void;
  onThreadSelect?: (id: number) => void;
  onUserSelect?: (username: string) => void;
}

export default function UserProfileScreen({ username, onBack, onThreadSelect, onUserSelect }: UserProfileScreenProps) {
  const { user: authUser, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const isOwnProfile = username === authUser?.username;
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFollowPending, setIsFollowPending] = useState(false);
  
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [userPosts, setUserPosts] = useState<ThreadResponse[]>([]);

  React.useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const data = await userService.getUserByUsername(username);
      setProfileUser(data);
      setBio(data.bio || '');
      setLocation(data.location || '');
      setWebsite(data.website || '');
    } catch (err) {
      console.error("Failed to load profile:", err);
      // Fallback to initial state
    }

    try {
      const posts = await threadService.getThreadsByUser(username);
      setUserPosts(posts);
    } catch (err) {
      console.error("Failed to load user posts:", err);
    }
  };

  const startEditing = () => {
    setEditBio(bio);
    setEditLocation(location);
    setEditWebsite(website);
    setEditCurrentPassword('');
    setEditPassword('');
    setError(null);
    setIsEditing(true);
  };

  const saveProfile = async () => {
    setError(null);
    if (!profileUser) return;
    
    if (editPassword && !editCurrentPassword) {
      setError('Please enter your current password to set a new password.');
      return;
    }
    
    setIsSaving(true);
    try {
      const updatedUser = await userService.updateUser(profileUser.id, {
        bio: editBio,
        location: editLocation,
        website: editWebsite,
        currentPassword: editCurrentPassword,
        password: editPassword,
      });
      setProfileUser(updatedUser);
      setBio(updatedUser.bio || '');
      setLocation(updatedUser.location || '');
      setWebsite(updatedUser.website || '');
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("Failed to update profile. Check current password.");
    } finally {
      setIsSaving(false);
    }
  };

  const pickAvatar = async () => {
    if (!profileUser) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setIsUploadingAvatar(true);
      try {
        const updatedUser = await userService.uploadAvatar(profileUser.id, result.assets[0].uri);
        setProfileUser(updatedUser);
      } catch (err) {
        console.error("Failed to upload avatar", err);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleFollowToggle = async () => {
    if (!profileUser || isFollowPending) return;
    setIsFollowPending(true);
    try {
      if (profileUser.following) {
        await userService.unfollowUser(username);
        setProfileUser({ ...profileUser, following: false, followerCount: Math.max(0, (profileUser.followerCount ?? 1) - 1) });
      } else {
        await userService.followUser(username);
        setProfileUser({ ...profileUser, following: true, followerCount: (profileUser.followerCount ?? 0) + 1 });
      }
    } catch (err) {
      console.error('Failed to update follow status', err);
    } finally {
      setIsFollowPending(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
      <View style={[styles.banner, { backgroundColor: colors.primary }]} />
      <View style={[styles.headerContent, { borderBottomColor: colors.border }]}>
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.accent, borderColor: colors.surface }]}>
            {profileUser?.profileImageUrl ? (
              <Image source={{ uri: profileUser.profileImageUrl }} style={{ width: '100%', height: '100%', borderRadius: 40 }} contentFit="cover" />
            ) : (
              <Text style={styles.avatarTextLarge}>{username.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          {isOwnProfile && isEditing && (
            <TouchableOpacity 
              style={[styles.avatarUploadBtn, { backgroundColor: colors.secondary, borderColor: colors.surface }, isUploadingAvatar && { opacity: 0.5 }]} 
              onPress={pickAvatar}
              disabled={isUploadingAvatar}
            >
              <Feather name="camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.nameRow}>
          <Text style={[styles.username, { color: colors.text }]}>{username}</Text>
          {isOwnProfile && !isEditing && (
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.inputBg }]} onPress={toggleTheme}>
                <Feather name={isDark ? "sun" : "moon"} size={14} color={isDark ? "#f59e0b" : colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.inputBg }]} onPress={startEditing}>
                <Feather name="edit-3" size={14} color={colors.text} />
                <Text style={[styles.editBtnText, { color: colors.text }]}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Feather name="log-out" size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
          {isOwnProfile && isEditing && (
            <View style={styles.editActionsRow}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.secondary }]} onPress={saveProfile} disabled={isSaving}>
                <Feather name="save" size={14} color="#ffffff" />
                <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.inputBg }]} onPress={cancelEditing}>
                <Feather name="x" size={14} color={colors.textMuted} />
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          {!isOwnProfile && authUser && (
            <TouchableOpacity
              style={[styles.followBtn, { backgroundColor: colors.secondary }, profileUser?.following && [styles.followingBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]]}
              onPress={handleFollowToggle}
              disabled={isFollowPending}
            >
              <Feather name={profileUser?.following ? 'user-check' : 'user-plus'} size={14} color={profileUser?.following ? colors.text : '#ffffff'} />
              <Text style={[styles.followBtnText, profileUser?.following && { color: colors.text }]}>
                {profileUser?.following ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <TextInput
            style={[styles.bioInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            value={editBio}
            onChangeText={setEditBio}
            placeholder="Write a bio..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
        ) : (
          <Text style={[styles.bio, { color: colors.textMuted }]}>{bio}</Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.metaRow}>
          <Feather name="mail" size={14} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{username}@tractus.dev</Text>
        </View>

        <View style={styles.metaRow}>
          <Feather name="map-pin" size={14} color={colors.textMuted} />
          {isEditing ? (
            <TextInput
              style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="Location"
              placeholderTextColor={colors.textMuted}
            />
          ) : (
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{location}</Text>
          )}
        </View>

        <View style={styles.metaRow}>
          <Feather name="link" size={14} color={colors.textMuted} />
          {isEditing ? (
            <TextInput
              style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
              value={editWebsite}
              onChangeText={setEditWebsite}
              placeholder="Website URL"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="url"
            />
          ) : (
            <Text style={[styles.metaText, styles.linkText, { color: colors.secondary }]}>{website}</Text>
          )}
        </View>

        {isEditing && (
          <View style={[styles.passwordSection, { borderTopColor: colors.border }]}>
            <View style={styles.metaRow}>
              <Feather name="lock" size={14} color={colors.textMuted} />
              <TextInput
                style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                value={editCurrentPassword}
                onChangeText={setEditCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>
            <View style={styles.metaRow}>
              <Feather name="lock" size={14} color={colors.textMuted} />
              <TextInput
                style={[styles.inlineInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                value={editPassword}
                onChangeText={setEditPassword}
                placeholder="New password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>
        )}

        {!isEditing && (
          <View style={styles.metaRow}>
            <Feather name="calendar" size={14} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>Joined July 2026</Text>
          </View>
        )}

        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          <View style={styles.statBlock}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{userPosts.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{profileUser?.followerCount ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Followers</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{profileUser?.followingCount ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Following</Text>
          </View>
        </View>
      </View>

      <View style={[styles.sectionTitleContainer, { backgroundColor: colors.inputBg, borderBottomColor: colors.border }]}>
        <Feather name="message-square" size={20} color={colors.text} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Posts</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>Profile</Text>
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
  avatarUploadBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fa477a',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    width: '100%',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
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
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fa477a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  followBtnText: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 4,
  },
  followingBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  followingBtnText: {
    color: '#1a1a2e',
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
