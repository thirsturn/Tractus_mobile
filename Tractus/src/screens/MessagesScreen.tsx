import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import messageService from '../services/message.service';
import userService from '../services/user.service';
import type { MessageResponse, User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

interface MessagesScreenProps {
  onBack: () => void;
  initialPartnerUsername?: string;
  onUserSelect?: (username: string) => void;
}

export default function MessagesScreen({ onBack, initialPartnerUsername, onUserSelect }: MessagesScreenProps) {
  const { colors } = useTheme();
  const { user: authUser } = useAuth();

  const [conversations, setConversations] = useState<MessageResponse[]>([]);
  const [activePartner, setActivePartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Load conversations & user directory
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await messageService.getUserConversations();
        setConversations(convs);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };

    const loadUsers = async () => {
      try {
        const users = await userService.getAllUsers();
        setAllUsers(users.filter(u => u.username !== authUser?.username));
      } catch (err) {
        console.error('Failed to load user directory:', err);
      }
    };

    loadConversations();
    loadUsers();

    const interval = setInterval(loadConversations, 4000);
    return () => clearInterval(interval);
  }, [authUser]);

  // Handle initial partner from profile "Message" button click
  useEffect(() => {
    if (initialPartnerUsername) {
      userService.getUserByUsername(initialPartnerUsername)
        .then(userData => setActivePartner(userData))
        .catch(err => console.error('Failed to load partner:', err));
    }
  }, [initialPartnerUsername]);

  // Load chat messages for active partner
  useEffect(() => {
    if (!activePartner) return;

    const loadMessages = async () => {
      try {
        const chat = await messageService.getConversation(activePartner.username);
        setMessages(chat);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2500);
    return () => clearInterval(interval);
  }, [activePartner]);

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !activePartner || isSending) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');
    setIsSending(true);

    try {
      const sentMsg = await messageService.sendMessage(activePartner.username, textToSend);
      setMessages(prev => [...prev, sentMsg]);
      const convs = await messageService.getUserConversations();
      setConversations(convs);
    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessageText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.bio || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Nav Bar */}
      <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={activePartner ? () => setActivePartner(null) : onBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        {activePartner ? (
          <TouchableOpacity
            style={styles.navHeaderCenter}
            onPress={() => onUserSelect && onUserSelect(activePartner.username)}
          >
            <View style={[styles.miniAvatar, { backgroundColor: colors.primary }]}>
              {activePartner.profileImageUrl ? (
                <Image source={{ uri: getImageUrl(activePartner.profileImageUrl) }} style={styles.miniAvatarImg} />
              ) : (
                <Text style={styles.miniAvatarText}>{activePartner.username.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={[styles.navTitle, { color: colors.text }]}>@{activePartner.username}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.navTitle, { color: colors.text }]}>Messages</Text>
        )}

        <View style={{ width: 24 }} />
      </View>

      {/* IF NO ACTIVE PARTNER -> SHOW CONVERSATIONS LIST & DIRECTORY SEARCH */}
      {!activePartner ? (
        <View style={{ flex: 1 }}>
          {/* User Search Input */}
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={[styles.searchInputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search or start new chat..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {searchQuery.trim() ? (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.convItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
                  onPress={() => {
                    setActivePartner(item);
                    setSearchQuery('');
                  }}
                >
                  <View style={[styles.convAvatar, { backgroundColor: colors.primary }]}>
                    {item.profileImageUrl ? (
                      <Image source={{ uri: getImageUrl(item.profileImageUrl) }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={styles.convInfo}>
                    <Text style={[styles.convName, { color: colors.text }]}>@{item.username}</Text>
                    <Text style={[styles.convSnippet, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.bio || 'Tap to chat'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Feather name="message-square" size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No conversations yet. Search above to start chatting!
                  </Text>
                </View>
              )}
              renderItem={({ item }) => {
                const partner = item.sender.username === authUser?.username ? item.recipient : item.sender;
                return (
                  <TouchableOpacity
                    style={[styles.convItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
                    onPress={() => setActivePartner(partner)}
                  >
                    <View style={[styles.convAvatar, { backgroundColor: colors.primary }]}>
                      {partner.profileImageUrl ? (
                        <Image source={{ uri: getImageUrl(partner.profileImageUrl) }} style={styles.avatarImg} />
                      ) : (
                        <Text style={styles.avatarText}>{partner.username.charAt(0).toUpperCase()}</Text>
                      )}
                    </View>
                    <View style={styles.convInfo}>
                      <Text style={[styles.convName, { color: colors.text }]}>@{partner.username}</Text>
                      <Text style={[styles.convSnippet, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.sender.username === authUser?.username ? 'You: ' : ''}
                        {item.content}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      ) : (
        /* IF ACTIVE PARTNER -> CHAT MESSAGES ROOM */
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Feather name="send" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Send a message to start chatting with @{activePartner.username}!
                </Text>
              </View>
            )}
            renderItem={({ item }) => {
              const isOutgoing = item.sender.username === authUser?.username;
              return (
                <View style={[styles.bubbleWrapper, isOutgoing ? styles.outgoingWrapper : styles.incomingWrapper]}>
                  <View
                    style={[
                      styles.bubble,
                      isOutgoing
                        ? { backgroundColor: colors.primary, borderBottomRightRadius: 2 }
                        : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 2 }
                    ]}
                  >
                    <Text style={[styles.bubbleText, { color: isOutgoing ? '#ffffff' : colors.text }]}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* Bottom Chat Input Bar */}
          <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              placeholder={`Message @${activePartner.username}...`}
              placeholderTextColor={colors.textMuted}
              value={newMessageText}
              onChangeText={setNewMessageText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: colors.primary }, (!newMessageText.trim() || isSending) && { opacity: 0.5 }]}
              disabled={!newMessageText.trim() || isSending}
              onPress={handleSendMessage}
            >
              <Feather name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  navHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  miniAvatarImg: {
    width: '100%',
    height: '100%',
  },
  miniAvatarText: {
    fontFamily: 'Urbanist',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  navTitle: {
    fontFamily: 'Urbanist',
    fontSize: 17,
    fontWeight: '700',
  },
  searchBox: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Urbanist',
    fontSize: 14,
    paddingVertical: 8,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  convAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: 'Urbanist',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
  convInfo: {
    flex: 1,
    marginLeft: 12,
  },
  convName: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    fontWeight: '700',
  },
  convSnippet: {
    fontFamily: 'Urbanist',
    fontSize: 13,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontFamily: 'Urbanist',
    fontSize: 14,
    textAlign: 'center',
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  outgoingWrapper: {
    alignSelf: 'flex-end',
  },
  incomingWrapper: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleText: {
    fontFamily: 'Urbanist',
    fontSize: 15,
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 26,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    fontFamily: 'Urbanist',
    fontSize: 15,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 110,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
