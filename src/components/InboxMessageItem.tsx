/**
 * InboxMessageItem - Tappable inbox row
 * Opens ChatThread when pressed
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { InboxMessage } from '../types';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { formatRelativeTime, truncateText } from '../utils/timeFormat';
import { Avatar } from './Avatar';

interface InboxMessageItemProps {
  message: InboxMessage;
  onPress?: () => void;
}

export const InboxMessageItem: React.FC<InboxMessageItemProps> = ({
  message,
  onPress,
}) => {
  const { player, lastMessage, timestamp, unreadCount, gameContext } = message;
  const hasUnread = unreadCount > 0;

  const handlePress = () => {
    console.log('Inbox item pressed:', player.eaId);
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Avatar
        uri={player.avatarUrl}
        size={50}
        presenceStatus={player.presenceStatus}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.eaId, hasUnread && styles.eaIdUnread]} numberOfLines={1}>
            {truncateText(player.eaId, 18)}
          </Text>
          <Text style={styles.timestamp}>{formatRelativeTime(timestamp)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.messageText, hasUnread && styles.messageUnread]} numberOfLines={1}>
            {truncateText(lastMessage, 40)}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        {gameContext && (
          <Text style={styles.gameTag}>{gameContext.gameName}</Text>
        )}
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    // @ts-ignore
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eaId: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  eaIdUnread: {
    fontWeight: typography.fontWeights.bold,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    flex: 1,
  },
  messageUnread: {
    color: colors.textPrimary,
  },
  gameTag: {
    color: colors.eaPrimaryBlue,
    fontSize: typography.fontSizes.xs,
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: colors.eaPrimaryBlue,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  unreadCount: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 24,
    marginLeft: spacing.sm,
  },
});
