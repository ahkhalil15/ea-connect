/**
 * EchoCarousel - Horizontal scrollable cards
 * "While You Were Away" section at top of Inbox
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MissedInteraction } from '../types';
import { colors, spacing, typography } from '../utils/theme';
import { EchoCard } from './EchoCard';

interface EchoCarouselProps {
  interactions: MissedInteraction[];
  onQuickMessage: (eventId: string, messageText: string, interaction: MissedInteraction) => void;
  onDismiss: (eventId: string) => void;
  onCardPress?: (interaction: MissedInteraction) => void;
}

export const EchoCarousel: React.FC<EchoCarouselProps> = ({
  interactions,
  onQuickMessage,
  onDismiss,
  onCardPress,
}) => {
  if (interactions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.indicatorDot} />
          <Text style={styles.headerTitle}>While You Were Away</Text>
        </View>
        <Text style={styles.headerCount}>
          {interactions.length} notifications
        </Text>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {interactions.map((interaction) => (
          <EchoCard
            key={interaction.eventId}
            interaction={interaction}
            onQuickMessage={onQuickMessage}
            onDismiss={onDismiss}
            onCardPress={onCardPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundPrimary,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.eaPrimaryBlue,
    marginRight: spacing.sm,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  headerCount: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
});
