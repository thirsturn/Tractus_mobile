import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import TopNav from '../components/TopNav';

interface ThreadDetailsScreenProps {
  threadId: number;
  onBack: () => void;
}

// Highly Realistic Mock Data from web app
const MOCK_THREAD_DETAIL = {
  id: 1,
  title: 'What is the most underrated programming language in 2026?',
  content: 'I have been looking into languages outside of the usual JS/Python ecosystem and I keep hearing about Nim and Zig. What are your thoughts? Are there any languages that are currently flying under the radar but offer massive productivity boosts for web backend development?\n\nI feel like everyone just defaults to Go or Rust these days if they need performance, but maybe there is a better middle ground.',
  author: {
    username: 'TechGuru',
    initial: 'T'
  },
  time: '2 hours ago',
  stats: {
    upvotes: 245,
    comments: 42,
    reposts: 12
  }
};

interface ThreadComment {
  id: number;
  author: string;
  initial: string;
  time: string;
  content: string;
  upvotes: number;
  hasUpvoted: boolean;
  profileImageUrl?: string;
}

const INITIAL_MOCK_COMMENTS: ThreadComment[] = [
  { id: 101, author: 'CodeNinja', initial: 'C', time: '1 hr ago', content: 'Honestly, I think Elixir is still criminally underrated. The BEAM ecosystem makes building fault-tolerant real-time systems so trivial compared to Node or Go.', upvotes: 24, hasUpvoted: false },
  { id: 102, author: 'DataWizard', initial: 'D', time: '45 mins ago', content: 'Zig is fantastic if you are doing systems programming, but for web backends? It might be overkill. Stick to Go unless you really need that manual memory management.', upvotes: 18, hasUpvoted: false },
  { id: 103, author: 'DesignPro', initial: 'D', time: '20 mins ago', content: 'What about Kotlin? It is huge in mobile but I feel like backend devs sleep on it. Ktor is incredibly nice to use.', upvotes: 5, hasUpvoted: false }
];

const CURRENT_USER = {
  username: 'AlexDev',
  initial: 'A',
  profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', // Realistic mock avatar
};

export default function ThreadDetailsScreen({ threadId, onBack }: ThreadDetailsScreenProps) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<ThreadComment[]>(INITIAL_MOCK_COMMENTS);
  const inputRef = useRef<TextInput>(null);
  
  // In a real app we'd fetch the thread based on threadId. Using mock for now.
  const thread = MOCK_THREAD_DETAIL;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: CURRENT_USER.username,
      initial: CURRENT_USER.initial,
      profileImageUrl: CURRENT_USER.profileImageUrl,
      time: 'Just now',
      content: commentText.trim(),
      upvotes: 0,
      hasUpvoted: false,
    };
    setComments([...comments, newComment]);
    setCommentText('');
    inputRef.current?.blur();
  };

  const handleReply = (author: string) => {
    setCommentText(`@${author} `);
    inputRef.current?.focus();
  };

  const handleUpvote = (id: number) => {
    setComments(comments.map(c => {
      if (c.id === id) {
        return {
          ...c,
          hasUpvoted: !c.hasUpvoted,
          upvotes: c.hasUpvoted ? c.upvotes - 1 : c.upvotes + 1
        };
      }
      return c;
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNav />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Navigation Bar */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#2a067a" />
          <Text style={styles.backBtnText}>Back to Feed</Text>
        </TouchableOpacity>

        {/* Main Thread Content */}
        <View style={styles.mainPost}>
          <View style={styles.postHeader}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>{thread.author.initial}</Text>
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.authorName}>{thread.author.username}</Text>
              <Text style={styles.timePosted}>{thread.time}</Text>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
              <Feather name="more-horizontal" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.postTitle}>{thread.title}</Text>
          <View style={styles.postBody}>
            {thread.content.split('\n').map((paragraph, idx) => (
              <Text key={idx} style={styles.paragraph}>{paragraph}</Text>
            ))}
          </View>

          {/* Statistics Bar */}
          <View style={styles.postStatsBar}>
            <View style={styles.statGroup}>
              <TouchableOpacity style={[styles.statBtn, styles.statBtnActive]}>
                <Feather name="arrow-up" size={18} color="#fa477a" />
              </TouchableOpacity>
              <Text style={styles.statCount}>{thread.stats.upvotes}</Text>
              <TouchableOpacity style={styles.statBtn}>
                <Feather name="arrow-down" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="message-square" size={18} color="#6b7280" />
              <Text style={styles.actionText}>{thread.stats.comments + (comments.length - INITIAL_MOCK_COMMENTS.length)} Comments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="repeat" size={18} color="#6b7280" />
              <Text style={styles.actionText}>{thread.stats.reposts} Reposts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="share-2" size={18} color="#6b7280" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Discussion</Text>
          
          {/* Comment Input */}
          <View style={styles.commentInputArea}>
            <Image 
              source={{ uri: CURRENT_USER.profileImageUrl }} 
              style={styles.smallAvatar} 
              contentFit="cover" 
            />
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Add a comment..."
                placeholderTextColor="#9ca3af"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment} disabled={!commentText.trim()}>
                <Feather name="send" size={18} color={commentText.trim() ? '#ffffff' : '#9ca3af'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comment List */}
          <View style={styles.commentsList}>
            {comments.map(comment => (
              <View key={comment.id} style={styles.comment}>
                {comment.profileImageUrl ? (
                  <Image 
                    source={{ uri: comment.profileImageUrl }} 
                    style={styles.smallAvatar} 
                    contentFit="cover" 
                  />
                ) : (
                  <View style={[styles.authorAvatar, styles.smallAvatar, comment.author === CURRENT_USER.username && {backgroundColor: '#fa477a'}]}>
                    <Text style={styles.authorAvatarText}>{comment.initial}</Text>
                  </View>
                )}
                <View style={styles.commentContentArea}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>
                  <Text style={styles.commentBody}>{comment.content}</Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity 
                      style={styles.commentActionBtn}
                      onPress={() => handleUpvote(comment.id)}
                    >
                      <Feather 
                        name="arrow-up" 
                        size={14} 
                        color={comment.hasUpvoted ? '#fa477a' : '#6b7280'} 
                      />
                      <Text style={[
                        styles.commentActionText, 
                        comment.hasUpvoted && {color: '#fa477a', fontWeight: '700'}
                      ]}>
                        {comment.upvotes} Upvotes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.commentActionBtn}
                      onPress={() => handleReply(comment.author)}
                    >
                      <Feather name="message-square" size={14} color="#6b7280" />
                      <Text style={styles.commentActionText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtnText: {
    fontFamily: 'Urbanist',
    fontSize: 16,
    fontWeight: '700',
    color: '#2a067a',
    marginLeft: 8,
  },
  mainPost: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7fbd78',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  authorAvatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  postMeta: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontFamily: 'Urbanist',
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  timePosted: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  moreBtn: {
    padding: 8,
  },
  postTitle: {
    fontFamily: 'Urbanist',
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 16,
    lineHeight: 32,
  },
  postBody: {
    marginBottom: 24,
  },
  paragraph: {
    fontFamily: 'Urbanist',
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  postStatsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  statBtnActive: {
    backgroundColor: 'rgba(250, 71, 122, 0.1)',
  },
  statCount: {
    fontFamily: 'Urbanist',
    fontWeight: '700',
    fontSize: 15,
    marginHorizontal: 8,
    color: '#1a1a2e',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  actionText: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  commentsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  commentsTitle: {
    fontFamily: 'Urbanist',
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  commentInputArea: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    marginLeft: 12,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Urbanist',
    fontSize: 15,
    color: '#1a1a2e',
    minHeight: 40,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a067a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    marginTop: 8,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentContentArea: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  commentTime: {
    fontFamily: 'Urbanist',
    fontSize: 12,
    color: '#6b7280',
  },
  commentBody: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
});
