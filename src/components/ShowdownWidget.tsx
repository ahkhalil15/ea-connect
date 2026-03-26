/**
 * ShowdownWidget — The live-telemetry Showdown Bounty card.
 *
 * State machine (priority order):
 *   1. completed → gold gradient, crown, WINNER badge, particles
 *   2. draw      → gold border, DEADLOCK badge, tied-at label
 *   3. losing    → red border, YOU'RE BEHIND banner, red bar for local user
 *   4. active    → neon blue border, LIVE badge, default blue bars
 *
 * All conditional rendering is driven by getWidgetState().
 * Simulate button follows a deterministic demo arc:
 *   Press 1 → opponent scores (LOSING), Press 2 → you catch up (DRAW), Press 3+ → random (→ WIN)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  ShowdownBounty,
  ShowdownParticipant,
  ShowdownStatus,
  CompletionOutcome,
  MONO_FONT,
} from '../types/showdown';
import { ShowdownProgressBar } from './ShowdownProgressBar';

// ── Widget state system ──

export type WidgetState = 'completed' | 'draw' | 'losing' | 'active';

/** Determine the current visual state of the widget during active play. */
export function getWidgetState(
  participants: ShowdownParticipant[],
  status: ShowdownStatus,
): WidgetState {
  if (status === 'completed') return 'completed';
  if (status !== 'active') return 'active';

  const scores = participants.map((p) => p.currentScore);
  const allEqual = scores.every((s) => s === scores[0]);
  if (allEqual && scores[0] > 0) return 'draw';

  const local = participants.find((p) => p.isLocalUser);
  const maxOpponent = Math.max(
    ...participants.filter((p) => !p.isLocalUser).map((p) => p.currentScore),
  );
  if ((local?.currentScore ?? 0) < maxOpponent) return 'losing';

  return 'active';
}

/** Determine the completion outcome from the local user's perspective. */
export function getCompletionOutcome(
  participants: ShowdownParticipant[],
  targetScore: number,
): CompletionOutcome {
  const local = participants.find((p) => p.isLocalUser);
  const opponents = participants.filter((p) => !p.isLocalUser);
  const localWon = (local?.currentScore ?? 0) >= targetScore;
  const opponentWon = opponents.some((p) => p.currentScore >= targetScore);

  // Both reached target simultaneously → draw
  if (localWon && opponentWon) return 'draw';
  // Only local user reached target → win
  if (localWon) return 'win';
  // Opponent reached target → loss
  return 'loss';
}

// ── Constants ──

const PARTICLE_COUNT = 24;
const PARTICLE_COLORS = ['#FFB800', '#FF9500', '#FFDD00', '#FFFFFF', '#FFA726'];

const CARD_STYLES_BY_STATE: Record<
  WidgetState,
  { borderColor: string; shadowColor: string; shadowOpacity: number; shadowRadius: number }
> = {
  active: { borderColor: 'rgba(0,118,255,0.4)', shadowColor: '#0076FF', shadowOpacity: 0.3, shadowRadius: 16 },
  losing: { borderColor: 'rgba(255,59,92,0.4)', shadowColor: '#FF3B5C', shadowOpacity: 0.25, shadowRadius: 14 },
  draw: { borderColor: 'rgba(255,184,0,0.5)', shadowColor: '#FFB800', shadowOpacity: 0.3, shadowRadius: 18 },
  completed: { borderColor: 'rgba(255,184,0,0.6)', shadowColor: '#FFB800', shadowOpacity: 0.35, shadowRadius: 20 },
};

// ── Component ──

interface ShowdownWidgetProps {
  bounty: ShowdownBounty;
  isRematch?: boolean;
  onBountyUpdate?: (updatedBounty: ShowdownBounty) => void;
  onWin?: (winnerEaId: string) => void;
  onRematch?: (completedBounty: ShowdownBounty) => void;
}

export const ShowdownWidget: React.FC<ShowdownWidgetProps> = ({
  bounty: initialBounty,
  isRematch = false,
  onBountyUpdate,
  onWin,
  onRematch,
}) => {
  const [participants, setParticipants] = useState<ShowdownParticipant[]>(
    initialBounty.participants.map((p) => ({ ...p })),
  );
  const [status, setStatus] = useState(initialBounty.status);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastUpdatedIdx, setLastUpdatedIdx] = useState<number | null>(null);
  const [scoreIncrement, setScoreIncrement] = useState(0);
  const [wonAt, setWonAt] = useState<Date | null>(null);
  const [rematchSent, setRematchSent] = useState(false);

  // Deterministic demo arc counter
  const pressCount = useRef(0);

  // Animation values
  const livePulse = useRef(new Animated.Value(1)).current;
  const winOverlayOpacity = useRef(new Animated.Value(0)).current;
  const cardShake = useRef(new Animated.Value(0)).current;
  const simButtonScale = useRef(new Animated.Value(1)).current;
  const incrementFloat = useRef(new Animated.Value(0)).current;
  const incrementOpacity = useRef(new Animated.Value(0)).current;
  const winBannerScale = useRef(new Animated.Value(0)).current;
  const borderGlowAnim = useRef(new Animated.Value(0.4)).current;
  const deadlockPulse = useRef(new Animated.Value(0.7)).current;
  const losingGlowPulse = useRef(new Animated.Value(0.6)).current;

  const livePulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const glowPulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const deadlockPulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const losingPulseRef = useRef<Animated.CompositeAnimation | null>(null);

  // Particle system
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    })),
  ).current;

  // Derived state
  const widgetState = getWidgetState(participants, status);

  // ── Animation loops ──

  useEffect(() => {
    // Clean up all loops first
    livePulseRef.current?.stop();
    glowPulseRef.current?.stop();
    deadlockPulseRef.current?.stop();
    losingPulseRef.current?.stop();

    if (widgetState === 'active' || widgetState === 'losing') {
      livePulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(livePulse, { toValue: 0.2, duration: 800, useNativeDriver: true }),
          Animated.timing(livePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      livePulseRef.current.start();

      glowPulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(borderGlowAnim, { toValue: 0.75, duration: 2000, useNativeDriver: true }),
          Animated.timing(borderGlowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
        ]),
      );
      glowPulseRef.current.start();
    }

    if (widgetState === 'losing') {
      losingPulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(losingGlowPulse, { toValue: 1.0, duration: 750, useNativeDriver: true }),
          Animated.timing(losingGlowPulse, { toValue: 0.6, duration: 750, useNativeDriver: true }),
        ]),
      );
      losingPulseRef.current.start();
    }

    if (widgetState === 'draw') {
      deadlockPulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(deadlockPulse, { toValue: 1.0, duration: 500, useNativeDriver: true }),
          Animated.timing(deadlockPulse, { toValue: 0.7, duration: 500, useNativeDriver: true }),
        ]),
      );
      deadlockPulseRef.current.start();
    }

    return () => {
      livePulseRef.current?.stop();
      glowPulseRef.current?.stop();
      deadlockPulseRef.current?.stop();
      losingPulseRef.current?.stop();
    };
  }, [widgetState]);

  // ── Completion animation (win, loss, or draw) ──

  const triggerCompletionAnimation = useCallback(async (outcome: CompletionOutcome) => {
    livePulseRef.current?.stop();
    glowPulseRef.current?.stop();
    deadlockPulseRef.current?.stop();
    losingPulseRef.current?.stop();

    if (outcome === 'win') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 200);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 400);
    } else if (outcome === 'loss') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Animated.timing(winOverlayOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.spring(winBannerScale, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }).start();

    Animated.sequence([
      Animated.timing(cardShake, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(cardShake, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(cardShake, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(cardShake, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(cardShake, { toValue: 3, duration: 50, useNativeDriver: true }),
      Animated.timing(cardShake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    // Gold particles for win/draw; skip for loss
    if (outcome !== 'loss') {
      particles.forEach((p, i) => {
        const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
        const distance = 60 + Math.random() * 100;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance - 30;
        const delay = Math.random() * 200;

        p.translateX.setValue(0);
        p.translateY.setValue(0);
        p.opacity.setValue(0);
        p.scale.setValue(0);

        Animated.parallel([
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(p.translateX, { toValue: targetX, duration: 800 + Math.random() * 400, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(p.translateY, { toValue: targetY, duration: 800 + Math.random() * 400, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(p.opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0, duration: 700 + Math.random() * 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.spring(p.scale, { toValue: 1 + Math.random() * 0.5, tension: 200, friction: 5, useNativeDriver: true }),
          ]),
        ]).start();
      });
    }
  }, []);

  // ── Win condition check ──

  const checkWinCondition = useCallback(
    (updatedParticipants: ShowdownParticipant[]) => {
      const anyoneFinished = updatedParticipants.some((p) => p.currentScore >= p.targetScore);
      if (!anyoneFinished) return;

      // Mark every participant who reached target as a winner
      const finalParticipants = updatedParticipants.map((p) => ({
        ...p,
        isWinner: p.currentScore >= p.targetScore,
      }));

      const target = initialBounty.challengeContext.targetScore;
      const outcome = getCompletionOutcome(finalParticipants, target);

      setParticipants(finalParticipants);
      setStatus('completed');
      setWonAt(new Date());
      pressCount.current = 0;
      triggerCompletionAnimation(outcome);

      const firstWinner = finalParticipants.find((p) => p.isWinner);
      onBountyUpdate?.({ ...initialBounty, status: 'completed', participants: finalParticipants });
      if (firstWinner) onWin?.(firstWinner.eaId);
    },
    [initialBounty, onBountyUpdate, onWin, triggerCompletionAnimation],
  );

  // ── Simulate EADP telemetry (deterministic demo arc) ──
  // Uses functional updater (prev =>) so scores are NEVER read from a stale closure.
  // Scores are strictly monotonically increasing — Math.min(prev + inc, target), never assign.

  const handleSimulate = useCallback(async () => {
    if (isSimulating || status !== 'active') return;

    setIsSimulating(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(simButtonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(simButtonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    pressCount.current += 1;
    const count = pressCount.current;

    setTimeout(() => {
      // Variables assigned inside the updater, consumed for side-effects after
      let updatedIdx = 0;
      let inc = 0;
      let computedNext: ShowdownParticipant[] | null = null;

      // Functional updater guarantees prev is the latest state, never stale
      setParticipants((prev) => {
        if (count === 1) {
          // Press 1: Opponent scores → LOSING state deepens
          updatedIdx = 1;
          inc = 2;
        } else if (count === 2) {
          // Press 2: Local user advances — always adds at least 1, never decreases
          updatedIdx = 0;
          const maxOpp = Math.max(...prev.slice(1).map((p) => p.currentScore));
          inc = Math.max(maxOpp - prev[0].currentScore, 1);
        } else {
          // Press 3+: Random participant gets +1 or +2
          updatedIdx = Math.floor(Math.random() * prev.length);
          inc = Math.floor(Math.random() * 2) + 1;
        }

        // newScore = Math.min(currentScore + increment, targetScore). Always adds, never subtracts.
        const next = prev.map((p, idx) =>
          idx !== updatedIdx
            ? { ...p }
            : { ...p, currentScore: Math.min(p.currentScore + inc, p.targetScore) },
        );

        // Runtime assertion — scores must never decrease
        next.forEach((p, i) => {
          if (p.currentScore < prev[i].currentScore) {
            console.error('SCORE DECREASED — this should never happen', prev[i], p);
          }
        });

        computedNext = next;
        return next;
      });

      // Side effects — updater ran synchronously so computedNext is populated
      setLastUpdatedIdx(updatedIdx);
      setScoreIncrement(inc);

      incrementFloat.setValue(0);
      incrementOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(incrementFloat, { toValue: -30, duration: 800, useNativeDriver: true }),
        Animated.timing(incrementOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start(() => setLastUpdatedIdx(null));

      Animated.sequence([
        Animated.timing(cardShake, { toValue: 3, duration: 40, useNativeDriver: true }),
        Animated.timing(cardShake, { toValue: -3, duration: 40, useNativeDriver: true }),
        Animated.timing(cardShake, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (computedNext) {
        checkWinCondition(computedNext);
      }
      setIsSimulating(false);
    }, 600);
  }, [isSimulating, status, checkWinCondition]);

  // ── Rematch: signal parent to create a new bounty (completed card stays immutable) ──

  const handleRematch = useCallback(() => {
    if (rematchSent) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRematchSent(true);
    onRematch?.({ ...initialBounty, status: 'completed', participants });
  }, [rematchSent, initialBounty, participants, onRematch]);

  /** Human-readable "X mins ago" from a Date */
  const timeAgoStr = useCallback((date: Date | null): string => {
    if (!date) return '';
    const diff = Math.max(0, Date.now() - date.getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  }, []);

  // ── Derived rendering values ──

  const isCompleted = widgetState === 'completed';
  const { challengeContext } = initialBounty;

  // Compute completion outcome only when completed
  const completionOutcome: CompletionOutcome | null = isCompleted
    ? getCompletionOutcome(participants, challengeContext.targetScore)
    : null;

  // Override card border/shadow for loss state
  const cardStateStyle = isCompleted && completionOutcome === 'loss'
    ? { borderColor: 'rgba(255,59,92,0.4)', shadowColor: '#FF3B5C', shadowOpacity: 0.25, shadowRadius: 14 }
    : CARD_STYLES_BY_STATE[widgetState];

  const glowBorderColor =
    widgetState === 'losing' ? '#FF3B5C' :
    widgetState === 'draw' ? '#FFB800' :
    '#0076FF';

  // Gradient colors driven by completion outcome
  const overlayGradientColors: [string, string] =
    completionOutcome === 'loss' ? ['#1A0A0A', '#111118'] :
    completionOutcome === 'draw' ? ['#1A1400', '#111118'] :
    ['#1A1200', '#111118'];

  return (
    <Animated.View
      style={[
        styles.card,
        {
          borderColor: cardStateStyle.borderColor,
          transform: [{ translateX: cardShake }],
          ...Platform.select({
            ios: {
              shadowColor: cardStateStyle.shadowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: cardStateStyle.shadowOpacity,
              shadowRadius: cardStateStyle.shadowRadius,
            },
            android: { elevation: 8 },
          }),
        },
      ]}
    >
      {/* Pulsing border glow overlay (non-completed states) */}
      {!isCompleted && (
        <Animated.View
          style={[
            styles.glowOverlay,
            { opacity: borderGlowAnim, borderColor: glowBorderColor },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Gradient overlay (gold for win/draw, red-tinted for loss) */}
      {isCompleted && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: winOverlayOpacity, borderRadius: 12, overflow: 'hidden' }]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={overlayGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      {/* Particle explosion layer (win/draw only, not loss) */}
      {isCompleted && completionOutcome !== 'loss' && (
        <View style={styles.particleLayer} pointerEvents="none">
          {particles.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                  width: 4 + (i % 3) * 2,
                  height: 4 + (i % 3) * 2,
                  borderRadius: i % 2 === 0 ? 10 : 2,
                  transform: [
                    { translateX: p.translateX },
                    { translateY: p.translateY },
                    { scale: p.scale },
                  ],
                  opacity: p.opacity,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* ── REMATCH TAG (shown on cards spawned from a rematch) ── */}
      {isRematch && (
        <Text style={styles.rematchTag}>⚡ REMATCH · {challengeContext.gameName}</Text>
      )}

      {/* ── HEADER ROW ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.gameColorDot, { backgroundColor: challengeContext.gameLogoColor }]} />
          <Text style={styles.gameName}>{challengeContext.gameName}</Text>
        </View>

        {/* Badge: driven by widgetState + completionOutcome */}
        {widgetState === 'completed' && completionOutcome === 'win' ? (
          <Animated.View style={[styles.winnerBadge, { transform: [{ scale: winBannerScale }] }]}>
            <Text style={styles.winnerBadgeText}>👑 WINNER</Text>
          </Animated.View>
        ) : widgetState === 'completed' && completionOutcome === 'loss' ? (
          <Animated.View style={[styles.defeatedBadge, { transform: [{ scale: winBannerScale }] }]}>
            <Text style={styles.defeatedBadgeText}>💀 DEFEATED</Text>
          </Animated.View>
        ) : widgetState === 'completed' && completionOutcome === 'draw' ? (
          <Animated.View style={[styles.drawCompleteBadge, { transform: [{ scale: winBannerScale }] }]}>
            <Text style={styles.drawCompleteBadgeText}>⚡ DRAW</Text>
          </Animated.View>
        ) : widgetState === 'draw' ? (
          <Animated.View style={[styles.deadlockBadge, { opacity: deadlockPulse }]}>
            <Text style={styles.deadlockBadgeText}>⚡ DEADLOCK</Text>
          </Animated.View>
        ) : (
          <View style={[styles.liveBadge, widgetState === 'losing' && styles.liveBadgeLosing]}>
            <Animated.View
              style={[
                styles.liveDot,
                { opacity: livePulse },
                widgetState === 'losing' && styles.liveDotLosing,
              ]}
            />
            <Text style={[styles.liveText, widgetState === 'losing' && styles.liveTextLosing]}>
              LIVE
            </Text>
          </View>
        )}
      </View>

      {/* ── CHALLENGE TITLE ── */}
      <Text style={[
        styles.challengeTitle,
        isCompleted && completionOutcome === 'win' && styles.titleWin,
        isCompleted && completionOutcome === 'loss' && styles.titleLoss,
        isCompleted && completionOutcome === 'draw' && styles.titleWin,
      ]}>
        First to {challengeContext.targetScore} {challengeContext.metric}
      </Text>

      {/* ── LOSING BANNER ── */}
      {widgetState === 'losing' && (
        <View style={styles.losingBanner}>
          <Text style={styles.losingBannerText}>🔥 You're behind — go play.</Text>
        </View>
      )}

      {/* ── DIVIDER ── */}
      <View style={[styles.divider, isCompleted && styles.dividerWin, widgetState === 'draw' && styles.dividerDraw]} />

      {/* ── PROGRESS BARS ── */}
      <View style={styles.progressSection}>
        {participants.map((participant, index) => {
          let overrideBarColor: string | undefined;
          let overrideScoreColor: string | undefined;
          let showDrawRing = false;

          if (widgetState === 'losing' && participant.isLocalUser) {
            overrideBarColor = '#FF3B5C';
            overrideScoreColor = '#FF3B5C';
          }
          if (widgetState === 'draw') {
            overrideBarColor = '#FFB800';
            showDrawRing = true;
          }

          // Completed-state color overrides driven by outcome
          if (isCompleted && completionOutcome === 'loss' && participant.isLocalUser) {
            overrideBarColor = '#FF3B5C';
            overrideScoreColor = '#FF3B5C';
          }
          if (isCompleted && completionOutcome === 'draw') {
            overrideBarColor = '#FFB800';
            overrideScoreColor = '#FFB800';
            showDrawRing = true;
          }

          return (
            <View key={participant.eaId} style={styles.progressRow}>
              <ShowdownProgressBar
                participant={participant}
                accentColor={challengeContext.gameLogoColor}
                isCompleted={isCompleted}
                overrideBarColor={overrideBarColor}
                overrideScoreColor={overrideScoreColor}
                showDrawRing={showDrawRing}
              />
              {lastUpdatedIdx === index && (
                <Animated.Text
                  style={[
                    styles.floatingIncrement,
                    {
                      transform: [{ translateY: incrementFloat }],
                      opacity: incrementOpacity,
                    },
                  ]}
                >
                  +{scoreIncrement}
                </Animated.Text>
              )}
            </View>
          );
        })}
      </View>

      {/* ── DRAW: Tied-at label ── */}
      {widgetState === 'draw' && (
        <Text style={styles.drawLabel}>
          Tied at {participants[0].currentScore} — first to move wins
        </Text>
      )}

      {/* ── COMPLETED: Final score, rematch, timestamp (outcome-driven) ── */}
      {widgetState === 'completed' && (() => {
        const local = participants.find((p) => p.isLocalUser);
        const opponent = participants.find((p) => !p.isLocalUser);
        const isWin = completionOutcome === 'win';
        const isLoss = completionOutcome === 'loss';

        // Score ordering: winner first in all cases
        const firstScore = isLoss ? (opponent?.currentScore ?? 0) : (local?.currentScore ?? 0);
        const secondScore = isLoss ? (local?.currentScore ?? 0) : (opponent?.currentScore ?? 0);
        const firstColor = isLoss ? '#FFB800' : '#FFB800';
        const secondColor = isLoss ? '#FF3B5C' : '#8888A0';

        const timestampPrefix = isWin ? 'Won' : isLoss ? 'Lost' : 'Draw';

        // Rematch button style depends on outcome
        const rematchBaseStyle = isLoss ? styles.rematchBtnLoss : styles.rematchBtn;
        const rematchBaseTextStyle = isLoss ? styles.rematchBtnTextLoss : styles.rematchBtnText;

        return (
          <View style={styles.winContent}>
            <Text style={styles.finalScoreLabel}>FINAL SCORE</Text>
            <View style={styles.finalScoreRow}>
              <Text style={[styles.finalScoreWinner, { color: firstColor }]}>{firstScore}</Text>
              <Text style={styles.finalScoreDash}> — </Text>
              <Text style={[styles.finalScoreLoser, { color: secondColor }]}>{secondScore}</Text>
            </View>
            <TouchableOpacity
              style={[rematchBaseStyle, rematchSent && styles.rematchBtnSent]}
              onPress={handleRematch}
              activeOpacity={0.7}
              disabled={rematchSent}
            >
              <Text style={[rematchBaseTextStyle, rematchSent && styles.rematchBtnTextSent]}>
                {rematchSent ? 'REMATCH SENT ✓' : '⚡ REMATCH'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.winTimestamp}>
              {timestampPrefix} {timeAgoStr(wonAt)} · {challengeContext.gameName}
            </Text>
          </View>
        );
      })()}

      {/* ── SIMULATE BUTTON ── */}
      {status === 'active' && (
        <Animated.View style={{ transform: [{ scale: simButtonScale }] }}>
          <TouchableOpacity
            style={[styles.simButton, isSimulating && styles.simButtonDisabled]}
            onPress={handleSimulate}
            disabled={isSimulating}
            activeOpacity={0.7}
          >
            <Text style={[styles.simButtonText, isSimulating && styles.simButtonTextDisabled]}>
              {isSimulating ? 'PROCESSING TELEMETRY...' : 'SIMULATE EADP TELEMETRY'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>{isCompleted ? 'COMPLETED' : 'EXPIRES'}</Text>
        <Text style={styles.footerValue}>
          {isCompleted
            ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '7 days remaining'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111118',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 8,
    padding: 20,
    overflow: 'visible',
    position: 'relative',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  particleLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  gameName: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: '#8888A0',
  },

  // Badges
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  liveBadgeLosing: {
    backgroundColor: 'rgba(255, 59, 92, 0.1)',
    borderColor: 'rgba(255, 59, 92, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 6,
  },
  liveDotLosing: {
    backgroundColor: '#FF3B5C',
  },
  liveText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#00E676',
  },
  liveTextLosing: {
    color: '#FF3B5C',
  },
  deadlockBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
  },
  deadlockBadgeText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FFB800',
  },
  winnerBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
  },
  winnerBadgeText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FFB800',
  },

  defeatedBadge: {
    backgroundColor: 'rgba(255, 59, 92, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 92, 0.4)',
  },
  defeatedBadgeText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FF3B5C',
  },
  drawCompleteBadge: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
  },
  drawCompleteBadgeText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FFB800',
  },

  // Challenge title
  challengeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E8E8F0',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  titleWin: {
    color: '#FFB800',
  },
  titleLoss: {
    color: '#FF3B5C',
  },

  // Losing banner
  losingBanner: {
    backgroundColor: 'rgba(255, 59, 92, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B5C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  losingBannerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF3B5C',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  dividerWin: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
  },
  dividerDraw: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
  },

  // Progress
  progressSection: {
    marginBottom: 4,
  },
  progressRow: {
    position: 'relative',
  },
  floatingIncrement: {
    position: 'absolute',
    right: 0,
    top: -4,
    fontFamily: MONO_FONT,
    fontSize: 16,
    fontWeight: '800',
    color: '#00E676',
  },

  // Draw tied-at label
  drawLabel: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '600',
    color: '#FFB800',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Win state content
  winContent: {
    alignItems: 'center',
    marginBottom: 4,
  },
  finalScoreLabel: {
    fontFamily: MONO_FONT,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.35,
    textTransform: 'uppercase' as const,
    color: '#55556A',
    marginTop: 16,
    marginBottom: 8,
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  finalScoreWinner: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFB800',
  },
  finalScoreDash: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8888A0',
  },
  finalScoreLoser: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8888A0',
  },
  rematchBtn: {
    backgroundColor: 'rgba(255,184,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 12,
  },
  rematchBtnText: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFB800',
  },
  rematchBtnLoss: {
    backgroundColor: 'rgba(255,59,92,0.12)',
    borderWidth: 1,
    borderColor: '#FF3B5C',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 12,
  },
  rematchBtnTextLoss: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B5C',
  },
  rematchBtnSent: {
    backgroundColor: 'rgba(0,230,118,0.12)',
    borderColor: '#00E676',
  },
  rematchBtnTextSent: {
    color: '#00E676',
  },
  rematchTag: {
    fontFamily: MONO_FONT,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: '#FFB800',
    marginBottom: 8,
  },
  winTimestamp: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    color: '#55556A',
    marginTop: 8,
  },

  // Simulate button
  simButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 118, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#0076FF',
    marginTop: 16,
  },
  simButtonDisabled: {
    borderColor: 'rgba(0, 118, 255, 0.3)',
    backgroundColor: 'rgba(0, 118, 255, 0.05)',
  },
  simButtonText: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: '#0076FF',
  },
  simButtonTextDisabled: {
    color: 'rgba(0, 118, 255, 0.4)',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  footerLabel: {
    fontFamily: MONO_FONT,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: '#55556A',
  },
  footerValue: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#8888A0',
  },
});
