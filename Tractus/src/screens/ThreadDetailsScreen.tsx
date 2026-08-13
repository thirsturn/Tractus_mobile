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

import { useAuth } from '../context/AuthContext';
import threadService from '../services/thread.service';
import commentService from '../services/comment.service';
import voteService from '../services/vote.service';
import type { ThreadResponse, CommentResponse, VoteResponse } from '../types';

export default function ThreadDetailsScreen({ threadId, onBack }: ThreadDetailsScreenProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [thread, setThread] = useState<ThreadResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [threadVotes, setThreadVotes] = useState<VoteResponse[]>([]);
  const inputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [threadData, commentsData, votesData] = await Promise.all([
          threadService.getThreadById(threadId),
          commentService.getCommentsByThread(threadId),
          voteService.getThreadVotes(threadId)
        ]);
        setThread(threadData);
        setComments(commentsData);
        setThreadVotes(votesData);
      } catch (err) {
        console.error("Failed to fetch thread details", err);
      }
    };
    fetchData();
  }, [threadId]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment = await commentService.createComment({
        content: commentText.trim(),
        userId: user!.id,
        threadId,
      });
      setComments([...comments, newComment]);
      setCommentText('');
      inputRef.current?.blur();
    } catch (err) {
      console.error("Failed to create comment", err);
    }
  };

  const handleReply = (author: string) => {
    setCommentText(`@${author} `);
    inputRef.current?.focus();
  };

  const handleThreadUpvote = async () => {
    try {
      await voteService.castThreadVote({
        userId: user!.id,
        targetId: threadId,
        voteType: 'UP'
      });
      // Refresh votes
      const votes = await voteService.getThreadVotes(threadId);
      setThreadVotes(votes);
    } catch (err) {
      console.error("Failed to upvote", err);
    }
  };

  const handleThreadDownvote = async () => {
    try {
      await voteService.castThreadVote({
        userId: user!.id,
        targetId: threadId,
        voteType: 'DOWN'
      });
      const votes = await voteService.getThreadVotes(threadId);
      setThreadVotes(votes);
    } catch (err) {
      console.error("Failed to downvote", err);
    }
  };

  if (!thread) return <SafeAreaView style={styles.safeArea}><Text style={{padding: 20}}>Loading...</Text></SafeAreaView>;

  const upvotes = threadVotes.filter(v => v.voteType === 'UP').length;
  const downvotes = threadVotes.filter(v => v.voteType === 'DOWN').length;
  const userVote = threadVotes.find(v => v.userId === user?.id)?.voteType;

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
              <Text style={styles.authorAvatarText}>{thread.author.username.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.authorName}>{thread.author.username}</Text>
              <Text style={styles.timePosted}>Just now</Text>
            </View>
          </View>

          <Text style={styles.postTitle}>{thread.title}</Text>
          <View style={styles.postBody}>
            {thread.content && thread.content.split('\n').map((paragraph, idx) => (
              <Text key={idx} style={styles.paragraph}>{paragraph}</Text>
            ))}
            
            {thread.imageUrl && (
              <Image 
                source={{ uri: thread.imageUrl.replace('http://localhost', 'http://192.168.1.100') }} 
                style={{ width: '100%', height: 250, borderRadius: 12, marginTop: 12 }} 
                contentFit="cover" 
              />
            )}
          </View>

          {/* Statistics Bar */}
          <View style={styles.postStatsBar}>
            <View style={styles.statGroup}>
              <TouchableOpacity 
                style={[styles.statBtn, userVote === 'UP' && styles.statBtnActive]}
                onPress={handleThreadUpvote}
              >
                <Feather name="arrow-up" size={18} color={userVote === 'UP' ? "#fa477a" : "#6b7280"} />
              </TouchableOpacity>
              <Text style={styles.statCount}>{upvotes - downvotes}</Text>
              <TouchableOpacity 
                style={[styles.statBtn, userVote === 'DOWN' && styles.statBtnActive]}
                onPress={handleThreadDownvote}
              >
                <Feather name="arrow-down" size={18} color={userVote === 'DOWN' ? "#fa477a" : "#6b7280"} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.actionBtn}>
              <Feather name="message-square" size={18} color="#6b7280" />
              <Text style={styles.actionText}>{comments.length} Comments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Discussion</Text>
          
          {/* Comment Input */}
          <View style={styles.commentInputArea}>
            {user?.profileImageUrl ? (
              <Image 
                source={{ uri: user.profileImageUrl }} 
                style={styles.smallAvatar} 
                contentFit="cover" 
              />
            ) : (
              <View style={[styles.authorAvatar, styles.smallAvatar, {backgroundColor: '#fa477a'}]}>
                <Text style={styles.authorAvatarText}>{user?.username?.charAt(0).toUpperCase()}</Text>
              </View>
            )}
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
                {comment.author.profileImageUrl ? (
                  <Image 
                    source={{ uri: comment.author.profileImageUrl }} 
                    style={styles.smallAvatar} 
                    contentFit="cover" 
                  />
                ) : (
                  <View style={[styles.authorAvatar, styles.smallAvatar, comment.author.id === user?.id && {backgroundColor: '#fa477a'}]}>
                    <Text style={styles.authorAvatarText}>{comment.author.username.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.commentContentArea}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.author.username}</Text>
                    <Text style={styles.commentTime}>Just now</Text>
                  </View>
                  <Text style={styles.commentBody}>{comment.content}</Text>
                  <View style={styles.commentActions}>
                    <TouchableOpacity 
                      style={styles.commentActionBtn}
                      onPress={() => {}} // Hook up comment voting later
                    >
                      <Feather 
                        name="arrow-up" 
                        size={14} 
                        color={'#6b7280'} 
                      />
                      <Text style={[styles.commentActionText]}>
                        0 Upvotes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.commentActionBtn}
                      onPress={() => handleReply(comment.author.username)}
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
