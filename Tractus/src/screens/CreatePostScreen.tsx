import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import threadService from '../services/thread.service';
import { useAuth } from '../context/AuthContext';
import TopNav from '../components/TopNav';

interface CreatePostScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function CreatePostScreen({ onBack, onSuccess }: CreatePostScreenProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await threadService.createThread({
        title,
        content,
        spaceId: 1, // default space
        userId: user!.id,
        imageUri: imageUri || undefined,
      });
      onSuccess();
    } catch (err: any) {
      console.error("Failed to create post", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNav />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} disabled={isSubmitting}>
            <Feather name="x" size={24} color="#2a067a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.form}>
          <TextInput
            style={styles.titleInput}
            placeholder="Give your post a catchy title"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            editable={!isSubmitting}
            multiline
          />

          <TextInput
            style={styles.contentInput}
            placeholder="What are your thoughts?"
            placeholderTextColor="#9ca3af"
            value={content}
            onChangeText={setContent}
            editable={!isSubmitting}
            multiline
            textAlignVertical="top"
          />

          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)} disabled={isSubmitting}>
                <Feather name="x" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage} disabled={isSubmitting}>
              <Feather name="image" size={20} color="#2a067a" />
              <Text style={styles.addImageText}>Attach an Image</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e3fbf6',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Urbanist',
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  submitBtn: {
    backgroundColor: '#fa477a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  submitBtnText: {
    fontFamily: 'Urbanist',
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    fontFamily: 'Urbanist',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  form: {
    padding: 20,
    flex: 1,
  },
  titleInput: {
    fontFamily: 'Urbanist',
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 20,
  },
  contentInput: {
    fontFamily: 'Urbanist',
    fontSize: 16,
    color: '#374151',
    minHeight: 150,
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  addImageText: {
    fontFamily: 'Urbanist',
    fontWeight: '600',
    color: '#2a067a',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    marginTop: 20,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
