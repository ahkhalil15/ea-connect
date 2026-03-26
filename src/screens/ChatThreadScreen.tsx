/**
 * ChatThreadScreen — Full conversation view with EA Showdowns integration.
 *
 * Fixed: FlatList scrolling, input overlap, visual polish (Issue 4 & 5).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import {
  ChatThreadScreenNavigationProp,
  ChatThreadScreenRouteProp,
} from '../types/navigation';
import { ShowdownBounty, MONO_FONT } from '../types/showdown';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { Avatar } from '../components';
import { ShowdownWidget } from '../components/ShowdownWidget';
import { ShowdownCreationSheet } from '../components/ShowdownCreationSheet';
import { quickMessageOptions } from '../data/mockData';

// ── Chat timeline union type ──
interface TextChatItem {
  id: string;
  type: 'text';
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
}

interface ShowdownChatItem {
  id: string;
  type: 'showdown_bounty';
  bounty: ShowdownBounty;
  timestamp: Date;
}

type ChatItem = TextChatItem | ShowdownChatItem;

const formatTime = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const getPresenceText = (status: string): string => {
  switch (status) {
    case 'online': return 'Online';
    case 'in_game': return 'In Game';
    case 'away': return 'Away';
    default: return 'Offline';
  }
};

const getPresenceColor = (status: string): string => {
  switch (status) {
    case 'online': return colors.statusOnline;
    case 'in_game': return colors.statusInGame;
    case 'away': return colors.statusAway;
    default: return colors.statusOffline;
  }
};

const WIN_REACTIONS_WINNER = [
  "GET REKT 👑🔥",
  "Too easy. Rematch?",
  "That's what I thought 😤",
  "Crown belongs to me 🏆",
];
const WIN_REACTIONS_LOSER = [
  "...I want a rematch right now",
  "You got lucky. Again?",
  "That doesn't count 😤",
  "Next time you're done for",
];

const INPUT_BAR_HEIGHT = 70;

export const ChatThreadScreen: React.FC = () => {
  const navigation = useNavigation<ChatThreadScreenNavigationProp>();
  const route = useRoute<ChatThreadScreenRouteProp>();
  const { player, gameContext, quickMessage, autoJoinLobby } = route.params;

  const [items, setItems] = useState<ChatItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showCreationSheet, setShowCreationSheet] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const pendingReplyRef = useRef(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    const initial: ChatItem[] = [];

    initial.push({
      id: 'init_1', type: 'text',
      text: gameContext ? `Hey! Ready for ${gameContext.gameName}?` : "What's up?",
      sender: 'them', timestamp: new Date(Date.now() - 8 * 60 * 1000),
    });

    if (quickMessage) {
      initial.push({
        id: 'init_2', type: 'text', text: quickMessage,
        sender: 'me', timestamp: new Date(Date.now() - 7 * 60 * 1000),
      });
      setShowQuickReplies(false);
    }

    initial.push({
      id: 'init_3', type: 'text',
      text: "Bet you can't outscore me this week 😤",
      sender: 'them', timestamp: new Date(Date.now() - 5 * 60 * 1000),
    });
    initial.push({
      id: 'init_4', type: 'text',
      text: "You're on. Let's make it official",
      sender: 'me', timestamp: new Date(Date.now() - 4 * 60 * 1000),
    });

    initial.push({
      id: 'showdown_preloaded', type: 'showdown_bounty',
      bounty: {
        bountyId: 'SD_PRELOADED_001',
        chatId: `chat_${player.eaId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        challengeContext: {
          gameName: 'EA SPORTS FC 26', gameLogoColor: '#0076FF',
          metric: 'Goals Scored', targetScore: 10,
        },
        status: 'active',
        participants: [
          { eaId: 'You', avatarUrl: 'https://i.pravatar.cc/80?u=me_player', currentScore: 3, targetScore: 10, isWinner: false, isLocalUser: true },
          { eaId: player.eaId, avatarUrl: player.avatarUrl, currentScore: 6, targetScore: 10, isWinner: false, isLocalUser: false },
        ],
      },
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
    });

    initial.push({
      id: 'init_5', type: 'text',
      text: "You're going down 🔥",
      sender: 'them', timestamp: new Date(Date.now() - 2 * 60 * 1000),
    });

    setItems(initial);

    if (autoJoinLobby && gameContext) {
      setTimeout(() => Toast.show({ type: 'success', text1: 'Joining Lobby...', text2: `Connecting to ${gameContext.gameName}`, position: 'bottom' }), 500);
    }
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const last = items[items.length - 1];
    if (last.type !== 'text' || last.sender !== 'me') return;
    if (pendingReplyRef.current) { pendingReplyRef.current = false; return; }

    const t = setTimeout(() => {
      const replies = ['Sounds good! 🎮', "Let's do it!", 'On my way!', 'Give me 5 minutes', 'Perfect timing!', 'See you there!'];
      setItems((prev) => [...prev, {
        id: `reply_${Date.now()}`, type: 'text',
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'them', timestamp: new Date(),
      }]);
    }, 1500);
    return () => clearTimeout(t);
  }, [items]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || inputText.trim();
    if (!msg) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems((prev) => [...prev, { id: `msg_${Date.now()}`, type: 'text', text: msg, sender: 'me', timestamp: new Date() }]);
    setInputText('');
    setShowQuickReplies(false);
  }, [inputText]);

  const handleQuickReply = useCallback(async (text: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSend(text);
  }, [handleSend]);

  const handleBack = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const handleJoinGame = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Toast.show({ type: 'success', text1: 'Joining Game...', text2: `Launching ${gameContext?.gameName}`, position: 'bottom' });
  }, [gameContext]);

  const handleShowdownWin = useCallback((winnerEaId: string) => {
    const isMe = winnerEaId === 'You';
    const myR = isMe ? WIN_REACTIONS_WINNER : WIN_REACTIONS_LOSER;
    const theirR = isMe ? WIN_REACTIONS_LOSER : WIN_REACTIONS_WINNER;

    Toast.show({ type: 'success', text1: `🏆 ${winnerEaId} claimed the crown!`, text2: 'The Showdown is over. Rematch?', position: 'top' });

    pendingReplyRef.current = true;
    setTimeout(() => {
      setItems((prev) => [...prev, { id: `win_me_${Date.now()}`, type: 'text', text: myR[Math.floor(Math.random() * myR.length)], sender: 'me', timestamp: new Date() }]);
    }, 1200);
    setTimeout(() => {
      setItems((prev) => [...prev, { id: `win_them_${Date.now()}`, type: 'text', text: theirR[Math.floor(Math.random() * theirR.length)], sender: 'them', timestamp: new Date() }]);
    }, 2800);
  }, []);

  const handleCreateShowdown = useCallback((bounty: ShowdownBounty) => {
    pendingReplyRef.current = true;
    setItems((prev) => [
      ...prev,
      { id: `challenge_${Date.now()}`, type: 'text', text: `⚡ Showdown dropped: First to ${bounty.challengeContext.targetScore} ${bounty.challengeContext.metric}`, sender: 'me', timestamp: new Date() },
      { id: `showdown_${bounty.bountyId}`, type: 'showdown_bounty', bounty, timestamp: new Date() },
    ]);
    setShowQuickReplies(false);

    setTimeout(() => {
      const r = ["Oh you're serious? Let's go 🔥", "Accepted. Prepare to lose 💀", "Challenge accepted 😈", "Easy money. Bring it 👑"];
      setItems((prev) => [...prev, { id: `accept_${Date.now()}`, type: 'text', text: r[Math.floor(Math.random() * r.length)], sender: 'them', timestamp: new Date() }]);
    }, 2000);

    Toast.show({ type: 'success', text1: 'Showdown Dropped!', text2: `${player.eaId} has been challenged`, position: 'bottom' });
  }, [player.eaId]);

  const handleRematch = useCallback((completedBounty: ShowdownBounty) => {
    // Build a fresh bounty that mirrors the completed one but resets all scores
    const newBountyId = Date.now().toString();
    const newBounty: ShowdownBounty = {
      bountyId: newBountyId,
      chatId: completedBounty.chatId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      challengeContext: { ...completedBounty.challengeContext },
      status: 'active',
      // Reset every participant to 0 score, no winner
      participants: completedBounty.participants.map((p) => ({
        ...p,
        currentScore: 0,
        isWinner: false,
      })),
    };

    // Append the new bounty card to the chat timeline
    pendingReplyRef.current = true;
    setItems((prev) => [
      ...prev,
      {
        id: `rematch_${newBountyId}`,
        type: 'showdown_bounty',
        bounty: newBounty,
        timestamp: new Date(),
        isRematch: true,
      } as ShowdownChatItem & { isRematch: boolean },
    ]);

    // Scroll to reveal the new card
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);

    Toast.show({
      type: 'success',
      text1: 'Rematch Dropped!',
      text2: `New ${completedBounty.challengeContext.gameName} Showdown created`,
      position: 'bottom',
    });

    // Opponent auto-accepts the rematch
    setTimeout(() => {
      const r = ["Rematch? Bring it 🔥", "I'm ready this time 💀", "Let's run it back 👑"];
      setItems((prev) => [...prev, {
        id: `rematch_reply_${Date.now()}`, type: 'text',
        text: r[Math.floor(Math.random() * r.length)],
        sender: 'them', timestamp: new Date(),
      }]);
    }, 1500);
  }, []);

  const openCreationSheet = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCreationSheet(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: ChatItem }) => {
    if (item.type === 'showdown_bounty') {
      const isRematch = 'isRematch' in item && (item as ShowdownChatItem & { isRematch?: boolean }).isRematch === true;
      return (
        <View style={styles.itemWrapper}>
          <ShowdownWidget
            bounty={item.bounty}
            isRematch={isRematch}
            onWin={handleShowdownWin}
            onRematch={handleRematch}
          />
        </View>
      );
    }

    const t = item as TextChatItem;
    const isMe = t.sender === 'me';
    return (
      <View style={styles.itemWrapper}>
        <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {t.text}
          </Text>
        </View>
        <Text style={[styles.timestamp, isMe ? styles.timestampRight : styles.timestampLeft]}>
          {formatTime(t.timestamp)}
        </Text>
      </View>
    );
  }, [handleShowdownWin, handleRematch]);

  const ListFooter = useCallback(() => <View style={{ height: 100 }} />, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerCenter} activeOpacity={0.7}>
              <Avatar uri={player.avatarUrl} size={40} presenceStatus={player.presenceStatus} />
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle} numberOfLines={1}>{player.eaId}</Text>
                <View style={styles.presenceRow}>
                  <View style={[styles.presenceDot, { backgroundColor: getPresenceColor(player.presenceStatus) }]} />
                  <Text style={styles.headerSubtitle}>
                    {getPresenceText(player.presenceStatus)}
                    {gameContext && player.presenceStatus === 'in_game' && ` · ${gameContext.gameName}`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreIcon}>•••</Text>
            </TouchableOpacity>
          </View>

          {/* Game Banner */}
          {gameContext && player.presenceStatus === 'in_game' && (
            <View style={styles.gameBanner}>
              <View style={styles.gameBannerLeft}>
                <View style={styles.gameBannerDot} />
                <Text style={styles.gameBannerText}>Playing {gameContext.gameName}</Text>
              </View>
              <TouchableOpacity style={styles.joinButton} onPress={handleJoinGame}>
                <Text style={styles.joinButtonText}>Join Game</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Messages + Showdowns */}
          <FlatList
            ref={flatListRef}
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={ListFooter}
            inverted={false}
          />

          {/* Quick Replies */}
          {showQuickReplies && (
            <View style={styles.quickRepliesContainer}>
              <Text style={styles.quickRepliesLabel}>Quick replies</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRepliesScroll}>
                {quickMessageOptions.map((option) => (
                  <TouchableOpacity key={option.id} style={styles.quickReplyPill} onPress={() => handleQuickReply(option.text)}>
                    <Text style={styles.quickReplyText}>{option.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.showdownPlusButton} onPress={openCreationSheet} activeOpacity={0.7}>
              <Text style={styles.showdownPlusText}>⚡</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#55556A"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : undefined]}
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
            >
              <Text style={[styles.sendButtonText, inputText.trim() ? styles.sendButtonTextActive : undefined]}>
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      <ShowdownCreationSheet
        visible={showCreationSheet}
        onClose={() => setShowCreationSheet(false)}
        onCreateShowdown={handleCreateShowdown}
        playerEaId="You"
        opponentEaId={player.eaId}
        opponentAvatarUrl={player.avatarUrl}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  content: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#111118',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,118,255,0.15)',
  },
  backButton: { padding: 8, marginRight: 4 },
  backIcon: { color: '#0076FF', fontSize: 32, fontWeight: '700', marginTop: -4 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerInfo: { marginLeft: 12, flex: 1 },
  headerTitle: { color: '#E8E8F0', fontSize: 16, fontWeight: '700' },
  presenceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  presenceDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  headerSubtitle: { color: '#8888A0', fontSize: 12 },
  moreButton: { padding: 8 },
  moreIcon: { color: '#8888A0', fontSize: 16, letterSpacing: 2 },

  // Game banner
  gameBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111118', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  gameBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  gameBannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.statusInGame, marginRight: 8 },
  gameBannerText: { color: '#8888A0', fontSize: 12 },
  joinButton: { backgroundColor: '#0076FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50 },
  joinButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  // Messages list
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: INPUT_BAR_HEIGHT,
    flexGrow: 1,
  },
  itemWrapper: {
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0076FF',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A24',
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 14, lineHeight: 20 },
  myMessageText: { color: '#FFFFFF' },
  theirMessageText: { color: '#E8E8F0' },
  timestamp: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    color: '#55556A',
    marginTop: 4,
  },
  timestampRight: { alignSelf: 'flex-end' },
  timestampLeft: { alignSelf: 'flex-start' },

  // Quick replies
  quickRepliesContainer: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10, paddingBottom: 6,
  },
  quickRepliesLabel: { color: '#55556A', fontSize: 10, paddingHorizontal: 16, marginBottom: 6 },
  quickRepliesScroll: { paddingHorizontal: 16 },
  quickReplyPill: {
    backgroundColor: '#1A1A24', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 50, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  quickReplyText: { color: '#E8E8F0', fontSize: 12, fontWeight: '500' },

  // Input
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0A0A0F',
  },
  showdownPlusButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,118,255,0.12)', borderWidth: 1, borderColor: 'rgba(0,118,255,0.35)',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  showdownPlusText: { fontSize: 18 },
  input: {
    flex: 1, backgroundColor: '#1A1A24', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10,
    color: '#E8E8F0', fontSize: 14, marginRight: 8,
  },
  sendButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: '#1A1A24' },
  sendButtonActive: { backgroundColor: '#0076FF' },
  sendButtonText: { color: '#55556A', fontSize: 14, fontWeight: '600' },
  sendButtonTextActive: { color: '#FFFFFF' },
});
