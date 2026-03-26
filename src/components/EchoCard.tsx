/**
 * EchoCard - Premium missed interaction card
 * Features animated glowing border with EA primary blue highlight
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MissedInteraction, QuickMessageOption } from '../types';
import { colors, borderRadius, spacing, typography, shadows } from '../utils/theme';
import { formatRelativeTime, truncateText } from '../utils/timeFormat';
import { Avatar } from './Avatar';
import { QuickMessagePill } from './QuickMessagePill';
import { quickMessageOptions } from '../data/mockData';

interface EchoCardProps {
  interaction: MissedInteraction;
  onQuickMessage: (eventId: string, messageText: string, interaction: MissedInteraction) => void;
  onDismiss: (eventId: string) => void;
  onCardPress?: (interaction: MissedInteraction) => void;
}

const CARD_WIDTH = 320;
const CARD_MIN_HEIGHT = 240;
const MAX_EA_ID_LENGTH = 16;

export const EchoCard: React.FC<EchoCardProps> = ({
  interaction,
  onQuickMessage,
  onDismiss,
  onCardPress,
}) => {
  const { eventId, eventType, player, gameContext, timestamp } = interaction;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  // Animated glowing border effect (disabled on web for performance)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [glowAnim]);

  // Interpolate glow opacity for subtle pulsing effect
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.eaPrimaryBlueDark, colors.eaPrimaryBlue],
  });

  /**
   * Handles quick message selection with haptic feedback and animations
   */
  const handleQuickMessagePress = (option: QuickMessageOption) => {
    console.log('Quick message pressed:', option.text);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Animate card out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onQuickMessage(eventId, option.text, interaction);
    });
  };

  const handleCardPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log('Card pressed:', player.eaId);
    onCardPress?.(interaction);
  };

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // Generate context message based on event type
  const contextMessage =
    eventType === 'missed_game_invite'
      ? `invited you to a lobby in ${gameContext.gameName}`
      : 'sent you a message';

  const truncatedEaId = truncateText(player.eaId, MAX_EA_ID_LENGTH);

  return (
    <View style={styles.cardOuter}>
      {/* Glow border */}
      <View
        pointerEvents="none"
        style={[
          styles.glowBorder,
          { borderColor: colors.eaPrimaryBlue },
        ]}
      />
      
      <TouchableOpacity 
        style={styles.card}
        onPress={handleCardPress}
        activeOpacity={0.7}
      >
        {/* Game background image */}
        <Image
          source={{ uri: gameContext.gameImage }}
          style={styles.backgroundImage}
          blurRadius={3}
        />
        <View style={styles.backgroundOverlay} />

        {/* Header: Avatar and EA ID */}
        <View style={styles.header}>
          <Avatar
            uri={player.avatarUrl}
            size={48}
            presenceStatus={player.presenceStatus}
          />
          <View style={styles.headerText}>
            <Text style={styles.eaIdText} numberOfLines={1}>
              {truncatedEaId}
            </Text>
            <Text style={styles.timestampText}>
              {formatRelativeTime(timestamp)}
            </Text>
          </View>
        </View>

        {/* Body: Context message */}
        <View style={styles.body}>
          <Text style={styles.contextText}>
            <Text style={styles.eaIdBold}>{truncatedEaId}</Text>
            {' '}{contextMessage}
          </Text>
          {interaction.messagePreview && (
            <Text style={styles.previewText} numberOfLines={2}>
              "{interaction.messagePreview}"
            </Text>
          )}
        </View>

        {/* Quick Message action row */}
        <View style={styles.quickMessageContainer}>
          <Text style={styles.quickReplyLabel}>Quick Reply</Text>
          <View style={styles.quickMessageRow}>
            {quickMessageOptions.slice(0, 3).map((option) => (
              <QuickMessagePill
                key={option.id}
                text={option.text}
                onPress={() => handleQuickMessagePress(option)}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    width: CARD_WIDTH,
    marginRight: spacing.lg,
    position: 'relative',
  },
  glowBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: borderRadius.lg + 2,
    borderWidth: 2,
    ...shadows.glowShadow,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: CARD_MIN_HEIGHT,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    opacity: 0.4,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  eaIdText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  timestampText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    marginTop: 4,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flex: 1,
  },
  contextText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.md,
    lineHeight: 22,
  },
  eaIdBold: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
  },
  previewText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.sm,
    fontStyle: 'italic',
    marginTop: spacing.md,
    lineHeight: 18,
  },
  quickMessageContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  quickReplyLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickMessageRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
