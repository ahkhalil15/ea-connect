/**
 * ShowdownCreationSheet — Bottom sheet for creating a new Showdown Bounty.
 *
 * Three-step progressive disclosure flow:
 *   Step 1: Pick your game (FC 26, Battlefield 6, Apex Legends)
 *   Step 2: Pick your stat (metric selection based on game)
 *   Step 3: Set the target (preset pills: 5, 10, 15, 20, 25)
 *
 * Each step reveals the next section with a spring animation.
 * "DROP THE BOUNTY" button appears once all selections are made.
 * The entire sheet slides up from the bottom with a spring + backdrop fade.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  ShowdownBounty,
  ShowdownMetric,
  GameOption,
  GAME_OPTIONS,
  TARGET_PRESETS,
  MONO_FONT,
} from '../types/showdown';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShowdownCreationSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreateShowdown: (bounty: ShowdownBounty) => void;
  playerEaId: string;
  opponentEaId: string;
  opponentAvatarUrl: string;
}

export const ShowdownCreationSheet: React.FC<ShowdownCreationSheetProps> = ({
  visible,
  onClose,
  onCreateShowdown,
  playerEaId,
  opponentEaId,
  opponentAvatarUrl,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<ShowdownMetric | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const metricReveal = useRef(new Animated.Value(0)).current;
  const targetReveal = useRef(new Animated.Value(0)).current;
  const buttonReveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset all selections and animation values
      setSelectedGame(null);
      setSelectedMetric(null);
      setSelectedTarget(null);
      metricReveal.setValue(0);
      targetReveal.setValue(0);
      buttonReveal.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleGameSelect = useCallback(
    async (game: GameOption) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedGame(game);
      setSelectedMetric(null);
      setSelectedTarget(null);
      targetReveal.setValue(0);
      buttonReveal.setValue(0);

      Animated.spring(metricReveal, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    },
    [],
  );

  const handleMetricSelect = useCallback(
    async (metric: ShowdownMetric) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedMetric(metric);
      setSelectedTarget(null);
      buttonReveal.setValue(0);

      Animated.spring(targetReveal, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    },
    [],
  );

  const handleTargetSelect = useCallback(
    async (target: number) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedTarget(target);

      Animated.spring(buttonReveal, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    },
    [],
  );

  const handleCreate = useCallback(async () => {
    if (!selectedGame || !selectedMetric || !selectedTarget) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const bounty: ShowdownBounty = {
      bountyId: `SD_${Date.now()}`,
      chatId: `chat_${opponentEaId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      challengeContext: {
        gameName: selectedGame.title,
        gameLogoColor: selectedGame.color,
        metric: selectedMetric,
        targetScore: selectedTarget,
      },
      status: 'active',
      participants: [
        {
          eaId: playerEaId,
          avatarUrl: `https://i.pravatar.cc/80?u=${playerEaId}`,
          currentScore: 0,
          targetScore: selectedTarget,
          isWinner: false,
          isLocalUser: true,
        },
        {
          eaId: opponentEaId,
          avatarUrl: opponentAvatarUrl,
          currentScore: 0,
          targetScore: selectedTarget,
          isWinner: false,
          isLocalUser: false,
        },
      ],
    };

    onCreateShowdown(bounty);
    onClose();
  }, [
    selectedGame,
    selectedMetric,
    selectedTarget,
    playerEaId,
    opponentEaId,
    opponentAvatarUrl,
    onCreateShowdown,
    onClose,
  ]);

  const canCreate = selectedGame && selectedMetric && selectedTarget;

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>CREATE SHOWDOWN</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepDot, selectedGame && styles.stepDotActive]} />
          <View style={[styles.stepDot, selectedMetric && styles.stepDotActive]} />
        </View>

        {/* Opponent label */}
        <View style={styles.vsRow}>
          <Text style={styles.vsLabel}>CHALLENGING</Text>
          <Text style={styles.vsName}>{opponentEaId}</Text>
        </View>

        {/* ── STEP 1: Game Selection ── */}
        <Text style={styles.stepLabel}>PICK YOUR GAME</Text>
        <View style={styles.gameGrid}>
          {GAME_OPTIONS.map((game) => {
            const isSelected = selectedGame?.title === game.title;
            return (
              <TouchableOpacity
                key={game.title}
                style={[
                  styles.gameCard,
                  isSelected && {
                    borderColor: game.color,
                    ...Platform.select({
                      ios: {
                        shadowColor: game.color,
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 0 },
                      },
                      android: { elevation: 6 },
                    }),
                  },
                ]}
                onPress={() => handleGameSelect(game)}
                activeOpacity={0.7}
              >
                <Text style={styles.gameIcon}>{game.icon}</Text>
                <Text
                  style={[
                    styles.gameTitle,
                    isSelected && { color: game.color },
                  ]}
                  numberOfLines={2}
                >
                  {game.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── STEP 2: Metric Selection ── */}
        {selectedGame && (
          <Animated.View
            style={[
              styles.stepSection,
              {
                opacity: metricReveal,
                transform: [
                  {
                    translateY: metricReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.stepLabel}>PICK YOUR STAT</Text>
            <View style={styles.metricRow}>
              {selectedGame.metrics.map((metric) => {
                const isSelected = selectedMetric === metric;
                return (
                  <TouchableOpacity
                    key={metric}
                    style={[
                      styles.metricPill,
                      isSelected && {
                        backgroundColor: selectedGame.color,
                        borderColor: selectedGame.color,
                      },
                    ]}
                    onPress={() => handleMetricSelect(metric)}
                  >
                    <Text
                      style={[
                        styles.metricText,
                        isSelected && styles.metricTextActive,
                      ]}
                    >
                      {metric}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ── STEP 3: Target Selection ── */}
        {selectedMetric && (
          <Animated.View
            style={[
              styles.stepSection,
              {
                opacity: targetReveal,
                transform: [
                  {
                    translateY: targetReveal.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.stepLabel}>SET THE TARGET</Text>
            <View style={styles.targetRow}>
              {TARGET_PRESETS.map((target) => {
                const isSelected = selectedTarget === target;
                return (
                  <TouchableOpacity
                    key={target}
                    style={[
                      styles.targetPill,
                      isSelected && {
                        backgroundColor: selectedGame!.color,
                        borderColor: selectedGame!.color,
                      },
                    ]}
                    onPress={() => handleTargetSelect(target)}
                  >
                    <Text
                      style={[
                        styles.targetText,
                        isSelected && styles.targetTextActive,
                      ]}
                    >
                      {target}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ── CREATE BUTTON ── */}
        {canCreate && (
          <Animated.View
            style={{
              opacity: buttonReveal,
              transform: [
                {
                  scale: buttonReveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={[
                styles.createBtn,
                { backgroundColor: selectedGame!.color },
              ]}
              onPress={handleCreate}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>DROP THE BOUNTY ⚡</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111118',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopWidth: 1,
    borderColor: 'rgba(0, 118, 255, 0.3)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#55556A',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  sheetTitle: {
    fontFamily: MONO_FONT,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#0076FF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#8888A0',
    fontSize: 14,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A1A24',
  },
  stepDotActive: {
    backgroundColor: '#0076FF',
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0, 118, 255, 0.06)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 118, 255, 0.15)',
  },
  vsLabel: {
    fontFamily: MONO_FONT,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#55556A',
  },
  vsName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8E8F0',
  },
  stepLabel: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#55556A',
    marginBottom: 12,
  },
  gameGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  gameCard: {
    flex: 1,
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gameIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8888A0',
    textAlign: 'center',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  stepSection: {
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricText: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '600',
    color: '#8888A0',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  metricTextActive: {
    color: '#FFFFFF',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  targetPill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1A1A24',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  targetText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8888A0',
  },
  targetTextActive: {
    color: '#FFFFFF',
  },
  createBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
});
