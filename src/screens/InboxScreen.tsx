/**
 * InboxScreen - Main inbox view with EA Echo carousel
 * 
 * Intent Mapping:
 * - Lobby invite card tap → LobbyPreview screen (see game, players, join/decline)
 * - Message card tap → ChatThread screen (continue conversation)
 * - Quick reply on invite → Send message + navigate to ChatThread
 * - Quick reply on message → Send message + navigate to ChatThread
 * - Inbox message tap → ChatThread screen (open conversation)
 * 
 * Every UI element answers:
 * - Why did I get this? (contextual info on cards)
 * - What can I do? (quick replies, tap to open)
 * - What happens next? (clear navigation destinations)
 */

import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { MissedInteraction } from '../types';
import { InboxScreenNavigationProp } from '../types/navigation';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { EchoCarousel, InboxMessageItem } from '../components';
import { useInboxState } from '../hooks/useInboxState';
import { generateLobbyPlayers } from '../data/mockData';

export const InboxScreen: React.FC = () => {
  const navigation = useNavigation<InboxScreenNavigationProp>();
  const { 
    missedInteractions, 
    inboxMessages, 
    sendQuickMessage,
    markMessageAsRead,
    unreadCount,
  } = useInboxState();

  /**
   * Handle card tap - routes based on event type
   * - missed_game_invite → LobbyPreview
   * - missed_message → ChatThread
   */
  const handleCardPress = useCallback(async (interaction: MissedInteraction) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    console.log('Telemetry Event: Echo card tapped', { 
      eventId: interaction.eventId,
      eventType: interaction.eventType,
      player: interaction.player.eaId,
    });

    if (interaction.eventType === 'missed_game_invite') {
      // Navigate to Lobby Preview for game invites
      navigation.navigate('LobbyPreview', {
        hostPlayer: interaction.player,
        gameContext: interaction.gameContext,
        lobbyPlayers: generateLobbyPlayers(interaction.player),
        lobbyStatus: 'waiting',
        eventId: interaction.eventId,
      });
    } else {
      // Navigate to Chat Thread for messages
      navigation.navigate('ChatThread', {
        player: interaction.player,
        gameContext: interaction.gameContext,
        sentViaEcho: true,
      });
    }
  }, [navigation]);

  /**
   * Handle quick reply - sends message and navigates
   * Quick replies are ACTION TRIGGERS, not decoration
   * 
   * For game invites: "Yeah! I'm down" → Send message + go to chat (with auto-join option)
   * For messages: Any reply → Send message + go to chat
   */
  const handleQuickMessage = useCallback(async (
    eventId: string, 
    messageText: string, 
    interaction: MissedInteraction
  ) => {
    // Update state (removes from carousel)
    sendQuickMessage(eventId, messageText);

    // Haptic feedback for action confirmation
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    console.log('Telemetry Event: Quick reply sent via EA Echo', {
      eventId,
      eventType: interaction.eventType,
      messageText,
      player: interaction.player.eaId,
    });

    // Determine if this is a "join" intent
    const isJoinIntent = messageText.toLowerCase().includes("i'm down") || 
                         messageText.toLowerCase().includes("let's go") ||
                         messageText.toLowerCase().includes("on my way");

    // Navigate to ChatThread with the quick message
    navigation.navigate('ChatThread', {
      player: interaction.player,
      gameContext: interaction.gameContext,
      quickMessage: messageText,
      sentViaEcho: true,
      autoJoinLobby: interaction.eventType === 'missed_game_invite' && isJoinIntent,
    });
  }, [sendQuickMessage, navigation]);

  /**
   * Handle inbox message tap - opens conversation
   * Auto-marks as read when opened
   */
  const handleMessagePress = useCallback(async (messageId: string, player: any, gameContext?: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Mark as read
    markMessageAsRead(messageId);
    
    console.log('Telemetry Event: Inbox message opened', {
      messageId,
      player: player.eaId,
    });

    // Navigate to ChatThread
    navigation.navigate('ChatThread', {
      player,
      gameContext,
    });
  }, [navigation, markMessageAsRead]);

  const handleDismiss = useCallback((eventId: string) => {
    console.log('Telemetry Event: Interaction dismissed', { eventId });
  }, []);

  const renderInboxItem = ({ item }: { item: typeof inboxMessages[0] }) => (
    <InboxMessageItem
      message={item}
      onPress={() => handleMessagePress(item.id, item.player, item.gameContext)}
    />
  );

  const ListHeader = useCallback(() => (
    <View>
      {/* EA Echo Carousel - While You Were Away */}
      <EchoCarousel
        interactions={missedInteractions}
        onQuickMessage={handleQuickMessage}
        onDismiss={handleDismiss}
        onCardPress={handleCardPress}
      />

      {/* Messages Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Messages</Text>
        <View style={styles.sectionRight}>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
            </View>
          )}
          <Text style={styles.sectionCount}>{inboxMessages.length}</Text>
        </View>
      </View>
    </View>
  ), [missedInteractions, handleQuickMessage, handleDismiss, handleCardPress, unreadCount, inboxMessages.length]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
      
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        {unreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Main Content */}
      <FlatList
        data={inboxMessages}
        renderItem={renderInboxItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.heading,
    fontWeight: typography.fontWeights.bold,
  },
  headerBadge: {
    backgroundColor: colors.eaPrimaryBlue,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    backgroundColor: colors.eaPrimaryBlue,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  unreadBadgeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  sectionCount: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.sm,
  },
});
