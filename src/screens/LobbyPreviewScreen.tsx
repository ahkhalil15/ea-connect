/**
 * LobbyPreviewScreen - Destination for game invite card taps
 * 
 * Shows:
 * - Game info with cover art
 * - Players currently in lobby
 * - Lobby status (waiting/in match/starting)
 * - CTAs: Join Lobby, Message Player
 * 
 * Intent: "Someone invited me - should I join?"
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { LobbyPreviewScreenNavigationProp, LobbyPreviewScreenRouteProp } from '../types/navigation';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { Avatar } from '../components';

const getStatusConfig = (status: 'waiting' | 'in_match' | 'starting') => {
  switch (status) {
    case 'waiting':
      return { text: 'Waiting for players', color: colors.statusOnline, canJoin: true };
    case 'starting':
      return { text: 'Match starting soon', color: colors.statusAway, canJoin: true };
    case 'in_match':
      return { text: 'Currently in match', color: colors.statusInGame, canJoin: false };
  }
};

export const LobbyPreviewScreen: React.FC = () => {
  const navigation = useNavigation<LobbyPreviewScreenNavigationProp>();
  const route = useRoute<LobbyPreviewScreenRouteProp>();
  const { hostPlayer, gameContext, lobbyPlayers, lobbyStatus } = route.params;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const statusConfig = getStatusConfig(lobbyStatus);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleJoinLobby = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    console.log('Telemetry Event: Join Lobby clicked', {
      game: gameContext.gameName,
      host: hostPlayer.eaId,
      playerCount: lobbyPlayers.length,
    });

    Toast.show({
      type: 'success',
      text1: 'Joining Lobby...',
      text2: `Connecting to ${gameContext.gameName}`,
      position: 'bottom',
      visibilityTime: 2000,
    });

    // Simulate joining - in production this would launch the game
    setTimeout(() => {
      Toast.show({
        type: 'success',
        text1: 'Connected!',
        text2: 'Launching game...',
        position: 'bottom',
      });
    }, 1500);
  };

  const handleMessagePlayer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    console.log('Telemetry Event: Message from Lobby clicked', {
      player: hostPlayer.eaId,
    });

    navigation.navigate('ChatThread', {
      player: hostPlayer,
      gameContext,
      sentViaEcho: true,
    });
  };

  const handleDecline = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    console.log('Telemetry Event: Lobby invite declined', {
      game: gameContext.gameName,
      host: hostPlayer.eaId,
    });

    Toast.show({
      type: 'success',
      text1: 'Invite Declined',
      text2: `${hostPlayer.eaId} will be notified`,
      position: 'bottom',
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lobby Invite</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Game Card */}
          <View style={styles.gameCard}>
            <Image
              source={{ uri: gameContext.gameImage }}
              style={styles.gameImage}
            />
            <View style={styles.gameOverlay} />
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{gameContext.gameName}</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                <Text style={styles.statusText}>{statusConfig.text}</Text>
              </View>
            </View>
          </View>

          {/* Invited By Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INVITED BY</Text>
            <View style={styles.hostCard}>
              <Avatar
                uri={hostPlayer.avatarUrl}
                size={56}
                presenceStatus={hostPlayer.presenceStatus}
              />
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{hostPlayer.eaId}</Text>
                <Text style={styles.hostStatus}>
                  {hostPlayer.presenceStatus === 'in_game' ? 'In Game' : 'Online'} • Waiting for you
                </Text>
              </View>
            </View>
          </View>

          {/* Players in Lobby */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              PLAYERS IN LOBBY ({lobbyPlayers.length})
            </Text>
            <View style={styles.playersGrid}>
              {lobbyPlayers.map((lobbyPlayer, index) => (
                <View key={index} style={styles.playerCard}>
                  <Avatar
                    uri={lobbyPlayer.player.avatarUrl}
                    size={44}
                    presenceStatus={lobbyPlayer.player.presenceStatus}
                  />
                  <Text style={styles.playerName} numberOfLines={1}>
                    {lobbyPlayer.player.eaId}
                  </Text>
                  <View style={styles.playerBadge}>
                    <Text style={styles.playerBadgeText}>
                      {lobbyPlayer.isHost ? 'Host' : lobbyPlayer.isReady ? 'Ready' : 'Waiting'}
                    </Text>
                  </View>
                </View>
              ))}
              
              {/* Empty slot for you */}
              <View style={[styles.playerCard, styles.emptySlot]}>
                <View style={styles.emptyAvatar}>
                  <Text style={styles.emptyAvatarText}>+</Text>
                </View>
                <Text style={styles.emptySlotText}>Your Spot</Text>
              </View>
            </View>
          </View>

          {/* What happens next */}
          <View style={styles.infoSection}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Joining will launch {gameContext.gameName} and connect you to this lobby automatically.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.declineButton}
          onPress={handleDecline}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.messageButton}
          onPress={handleMessagePlayer}
        >
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.joinButton,
            !statusConfig.canJoin && styles.joinButtonDisabled,
          ]}
          onPress={handleJoinLobby}
          disabled={!statusConfig.canJoin}
        >
          <Text style={[
            styles.joinButtonText,
            !statusConfig.canJoin && styles.joinButtonTextDisabled,
          ]}>
            {statusConfig.canJoin ? 'Join Lobby' : 'In Match'}
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  backButton: {
    padding: spacing.sm,
    width: 44,
  },
  backIcon: {
    color: colors.eaPrimaryBlue,
    fontSize: 32,
    fontWeight: typography.fontWeights.bold,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  gameCard: {
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  gameImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gameOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  gameInfo: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  gameName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  hostInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  hostName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  hostStatus: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    marginTop: 4,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  playerCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    margin: spacing.sm,
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  playerBadge: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  playerBadgeText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.xs,
  },
  emptySlot: {
    borderWidth: 2,
    borderColor: colors.eaPrimaryBlue,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  emptyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.eaPrimaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyAvatarText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: typography.fontWeights.bold,
  },
  emptySlotText: {
    color: colors.eaPrimaryBlue,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    marginTop: spacing.sm,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.backgroundPrimary,
    gap: spacing.md,
  },
  declineButton: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  declineButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  messageButton: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.backgroundCard,
  },
  messageButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  joinButton: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.eaPrimaryBlue,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: colors.backgroundCard,
  },
  joinButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  joinButtonTextDisabled: {
    color: colors.textMuted,
  },
});
