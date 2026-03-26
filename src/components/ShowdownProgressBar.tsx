/**
 * ShowdownProgressBar — Animated progress bar for each Showdown participant.
 *
 * Renders avatar, eaId label, animated fill bar, and score fraction.
 * Supports state-driven overrides for bar color, score color, and avatar ring
 * to reflect losing (red), draw (gold), and win (gold + crown) states.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { ShowdownParticipant, MONO_FONT } from '../types/showdown';

interface ShowdownProgressBarProps {
  participant: ShowdownParticipant;
  accentColor: string;
  isCompleted: boolean;
  /** Override the fill color (e.g. red for losing, gold for draw) */
  overrideBarColor?: string;
  /** Override the score label color */
  overrideScoreColor?: string;
  /** Show a gold ring on the avatar (draw state) */
  showDrawRing?: boolean;
}

export const ShowdownProgressBar: React.FC<ShowdownProgressBarProps> = ({
  participant,
  accentColor,
  isCompleted,
  overrideBarColor,
  overrideScoreColor,
  showDrawRing,
}) => {
  const fillWidth = useRef(new Animated.Value(0)).current;
  const crownScale = useRef(new Animated.Value(0)).current;
  const crownTranslateY = useRef(new Animated.Value(-20)).current;
  const avatarRingOpacity = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(1)).current;
  const barPulseOpacity = useRef(new Animated.Value(0)).current;
  const barPulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const ratio = Math.min(participant.currentScore / participant.targetScore, 1);

  useEffect(() => {
    Animated.timing(fillWidth, {
      toValue: ratio,
      duration: 900,
      useNativeDriver: false,
    }).start();

    Animated.sequence([
      Animated.timing(scoreScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scoreScale, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    if (ratio >= 0.8 && !participant.isWinner) {
      barPulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(barPulseOpacity, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(barPulseOpacity, {
            toValue: 0.15,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      barPulseRef.current.start();
    } else if (barPulseRef.current) {
      barPulseRef.current.stop();
      barPulseOpacity.setValue(0);
    }

    return () => {
      barPulseRef.current?.stop();
    };
  }, [ratio, participant.isWinner]);

  useEffect(() => {
    if (!participant.isWinner) return;

    barPulseRef.current?.stop();
    barPulseOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(crownScale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(crownTranslateY, {
        toValue: 0,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(avatarRingOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [participant.isWinner]);

  // Show draw ring when requested
  useEffect(() => {
    if (showDrawRing) {
      Animated.timing(avatarRingOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else if (!participant.isWinner) {
      avatarRingOpacity.setValue(0);
    }
  }, [showDrawRing, participant.isWinner]);

  const interpolatedWidth = fillWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const barColor = participant.isWinner
    ? '#FFB800'
    : overrideBarColor ?? accentColor;

  const scoreColor = participant.isWinner
    ? '#FFB800'
    : overrideScoreColor ?? '#E8E8F0';

  const eaIdColor = participant.isWinner
    ? '#FFB800'
    : overrideScoreColor
      ? overrideScoreColor
      : '#8888A0';

  const showRing = participant.isWinner || showDrawRing;
  const ringColor = participant.isWinner
    ? 'rgba(255, 184, 0, 0.5)'
    : 'rgba(255, 184, 0, 0.6)';

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: participant.avatarUrl }}
          style={[
            styles.avatar,
            participant.isWinner && styles.avatarWinner,
            showDrawRing && !participant.isWinner && styles.avatarDraw,
          ]}
        />
        {participant.isWinner && (
          <Animated.Text
            style={[
              styles.crown,
              {
                transform: [
                  { scale: crownScale },
                  { translateY: crownTranslateY },
                ],
              },
            ]}
          >
            👑
          </Animated.Text>
        )}
        {showRing && (
          <Animated.View
            style={[
              styles.avatarGlowRing,
              { opacity: avatarRingOpacity, borderColor: ringColor },
            ]}
          />
        )}
      </View>

      <View style={styles.barSection}>
        <Text
          style={[styles.eaId, { color: eaIdColor }]}
          numberOfLines={1}
        >
          {participant.eaId}
        </Text>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              { width: interpolatedWidth, backgroundColor: barColor },
            ]}
          />
          {ratio >= 0.8 && (
            <Animated.View
              style={[
                styles.fillPulse,
                {
                  opacity: barPulseOpacity,
                  backgroundColor: participant.isWinner
                    ? 'rgba(255, 184, 0, 0.5)'
                    : `${barColor}88`,
                },
              ]}
            />
          )}
        </View>
      </View>

      <Animated.Text
        style={[
          styles.score,
          { color: scoreColor },
          { transform: [{ scale: scoreScale }] },
        ]}
      >
        {participant.currentScore}
        <Text style={styles.scoreDivider}>/</Text>
        {participant.targetScore}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrapper: {
    position: 'relative',
    width: 44,
    height: 44,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarWinner: {
    borderColor: '#FFB800',
  },
  avatarDraw: {
    borderColor: 'rgba(255, 184, 0, 0.6)',
  },
  crown: {
    position: 'absolute',
    top: -6,
    right: -2,
    fontSize: 16,
  },
  avatarGlowRing: {
    position: 'absolute',
    top: -1,
    left: 1,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
  },
  barSection: {
    flex: 1,
    marginRight: 12,
  },
  eaId: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 6,
  },
  track: {
    height: 8,
    backgroundColor: '#1A1A24',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  fillPulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
  },
  score: {
    fontFamily: MONO_FONT,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  scoreDivider: {
    color: '#55556A',
    fontWeight: '400',
  },
});
