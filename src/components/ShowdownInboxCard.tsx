/**
 * ShowdownInboxCard — A single row in the Showdowns inbox list.
 *
 * Renders differently based on bounty status:
 *   pending   → ACCEPT / DECLINE buttons, pulsing blue avatar ring
 *   active    → score gap label, time remaining, tap-to-navigate
 *   completed → crown/L icon, final score, REMATCH button
 *
 * DECLINE triggers a 300ms opacity fade-out before removal.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { ShowdownTimelineItem } from '../data/eadpMock';
import { MONO_FONT } from '../types/showdown';

interface ShowdownInboxCardProps {
  item: ShowdownTimelineItem;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onPress: (item: ShowdownTimelineItem) => void;
}

/** Format time remaining from an ISO expiry date */
function timeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h left`;
}

export const ShowdownInboxCard: React.FC<ShowdownInboxCardProps> = ({
  item,
  onAccept,
  onDecline,
  onPress,
}) => {
  const { bounty } = item;
  const status = bounty.status;
  const localUser = bounty.participants[0];
  const opponent = bounty.participants[1];
  const target = bounty.challengeContext.targetScore;

  // Decline fade-out
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // Pending avatar pulse
  const avatarPulse = useRef(new Animated.Value(1)).current;
  const avatarPulseRef = useRef<Animated.CompositeAnimation | null>(null);

  // Start pulsing avatar border for pending status
  useEffect(() => {
    if (status !== 'pending') return;
    avatarPulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(avatarPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    avatarPulseRef.current.start();
    return () => avatarPulseRef.current?.stop();
  }, [status]);

  const handleDecline = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onDecline(item.id));
  }, [item.id, onDecline, fadeAnim]);

  const handleCardPress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  // ── Score gap for active cards ──
  const gap = localUser.currentScore - opponent.currentScore;
  const gapText = gap > 0 ? `+${gap} UP` : gap < 0 ? `${gap} DOWN` : 'TIED';
  const gapColor = gap > 0 ? '#00E676' : gap < 0 ? '#FF3B5C' : '#FFB800';

  // ── Progress ratios ──
  const localRatio = target > 0 ? Math.min(localUser.currentScore / target, 1) * 100 : 0;
  const opponentRatio = target > 0 ? Math.min(opponent.currentScore / target, 1) * 100 : 0;
  const opponentAhead = opponent.currentScore > localUser.currentScore;

  // ── Avatar border style ──
  const isWonByLocal = status === 'completed' && localUser.isWinner;

  // ── Completed score display ──
  const finalScore = `${localUser.currentScore} — ${opponent.currentScore}`;

  // ── Challenge title abbreviation ──
  const challengeLabel = `First to ${target} ${bounty.challengeContext.metric}`;

  // All cards are tappable — navigates to the chat thread for this bounty
  const CardWrapper = TouchableOpacity;
  const wrapperProps = { onPress: handleCardPress, activeOpacity: 0.7 };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <CardWrapper {...wrapperProps} style={styles.card}>
        {/* ── LEFT: Opponent avatar ── */}
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: opponent.avatarUrl }}
            style={[
              styles.avatar,
              isWonByLocal && styles.avatarWon,
              status === 'pending' && styles.avatarPending,
            ]}
          />
          {/* Pulsing ring for pending avatars */}
          {status === 'pending' && (
            <Animated.View style={[styles.avatarPulseRing, { opacity: avatarPulse }]} />
          )}
        </View>

        {/* ── MIDDLE: Info column ── */}
        <View style={styles.middleCol}>
          <View style={styles.topRow}>
            <Text style={styles.opponentName} numberOfLines={1}>{opponent.eaId}</Text>
            <Text style={styles.gameName} numberOfLines={1}>{bounty.challengeContext.gameName}</Text>
          </View>
          <Text style={styles.challengeTitle} numberOfLines={1}>{challengeLabel}</Text>

          {/* Mini progress bar */}
          <View style={styles.miniTrack}>
            {/* Opponent fill behind (red), only if ahead */}
            {opponentAhead && (
              <View style={[styles.miniFill, styles.miniFillOpponent, { width: `${opponentRatio}%` }]} />
            )}
            {/* Local user fill (blue) */}
            <View style={[styles.miniFill, styles.miniFillLocal, { width: `${localRatio}%` }]} />
          </View>
        </View>

        {/* ── RIGHT: Status-specific CTA ── */}
        <View style={styles.rightCol}>
          {status === 'pending' && (
            <>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => onAccept(item.id)} activeOpacity={0.7}>
                <Text style={styles.acceptBtnText}>ACCEPT</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDecline} activeOpacity={0.7}>
                <Text style={styles.declineText}>DECLINE</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'active' && (
            <>
              <Text style={[styles.scoreFraction, { color: gapColor }]}>
                {localUser.currentScore} / {target}
              </Text>
              <Text style={[styles.gapLabel, { color: gapColor }]}>{gapText}</Text>
              <Text style={styles.timeLeft}>{timeRemaining(bounty.expiresAt)}</Text>
            </>
          )}

          {status === 'completed' && (
            <>
              {isWonByLocal ? (
                <Text style={styles.crownIcon}>👑</Text>
              ) : (
                <Text style={styles.lossIcon}>L</Text>
              )}
              <Text style={styles.finalScore}>{finalScore}</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.rematchText}>REMATCH</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </CardWrapper>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111118',
    borderWidth: 1,
    borderColor: 'rgba(0,118,255,0.15)',
    borderRadius: 12,
    padding: 16,
  },

  // Avatar
  avatarWrap: {
    position: 'relative',
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarWon: {
    borderColor: '#FFB800',
    borderWidth: 2,
  },
  avatarPending: {
    borderColor: '#0076FF',
    borderWidth: 2,
  },
  avatarPulseRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#0076FF',
  },

  // Middle
  middleCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8E8F0',
    flex: 1,
    marginRight: 8,
  },
  gameName: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    color: '#55556A',
    flexShrink: 0,
  },
  challengeTitle: {
    fontSize: 13,
    color: '#8888A0',
    marginBottom: 8,
  },
  miniTrack: {
    height: 4,
    backgroundColor: '#1A1A24',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  miniFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 2,
  },
  miniFillLocal: {
    backgroundColor: '#0076FF',
    zIndex: 2,
  },
  miniFillOpponent: {
    backgroundColor: '#FF3B5C',
    zIndex: 1,
  },

  // Right column
  rightCol: {
    alignItems: 'flex-end',
    minWidth: 64,
  },

  // Pending
  acceptBtn: {
    backgroundColor: '#0076FF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 6,
  },
  acceptBtnText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  declineText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '600',
    color: '#FF3B5C',
  },

  // Active
  scoreFraction: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  gapLabel: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  timeLeft: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    color: '#55556A',
  },

  // Completed
  crownIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  lossIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B5C',
    marginBottom: 4,
  },
  finalScore: {
    fontFamily: MONO_FONT,
    fontSize: 13,
    color: '#8888A0',
    marginBottom: 4,
  },
  rematchText: {
    fontFamily: MONO_FONT,
    fontSize: 11,
    fontWeight: '600',
    color: '#0076FF',
  },
});
