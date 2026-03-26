/**
 * InboxScreen — Chat inbox (Chat tab).
 *
 * Shows the list of conversation threads. Tapping a message opens
 * the ChatThread screen where Showdown bounties live inline.
 */

import React, { useCallback, useState } from 'react';
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
import { InboxScreenNavigationProp } from '../types/navigation';
import { InboxMessage } from '../types';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { InboxMessageItem } from '../components';
import { inboxMessages as initialInboxData } from '../data/mockData';

export const InboxScreen: React.FC = () => {
  const navigation = useNavigation<InboxScreenNavigationProp>();
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(initialInboxData);

  const unreadCount = inboxMessages.reduce((sum, msg) => sum + msg.unreadCount, 0);

  const handleMessagePress = useCallback(async (messageId: string, player: any, gameContext?: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setInboxMessages((current) =>
      current.map((msg) =>
        msg.id === messageId ? { ...msg, unreadCount: 0 } : msg
      )
    );

    navigation.navigate('ChatThread', {
      player,
      gameContext,
    });
  }, [navigation]);

  const renderInboxItem = ({ item }: { item: InboxMessage }) => (
    <InboxMessageItem
      message={item}
      onPress={() => handleMessagePress(item.id, item.player, item.gameContext)}
    />
  );

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

      {/* Message List */}
      <FlatList
        data={inboxMessages}
        renderItem={renderInboxItem}
        keyExtractor={(item) => item.id}
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
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
