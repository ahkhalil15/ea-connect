/**
 * EA Showdowns — Type Definitions
 *
 * Aligned with EADP telemetry architecture.
 * Defines the complete data model for the Showdown Bounty system
 * including challenge configuration, participant tracking, and game metadata.
 */

import { Platform } from 'react-native';

/** Supported EA game titles for Showdowns */
export type GameTitle = 'EA SPORTS FC 26' | 'Battlefield 6' | 'Apex Legends';

/** Trackable metrics pulled from EADP MatchEndsForPlayer telemetry */
export type ShowdownMetric =
  | 'Goals Scored'
  | 'Eliminations'
  | 'Damage Dealt'
  | 'Wins'
  | 'Assists';

/** Bounty lifecycle states */
export type ShowdownStatus = 'pending' | 'active' | 'completed' | 'expired';

/** Individual participant in a Showdown bounty */
export interface ShowdownParticipant {
  eaId: string;
  avatarUrl: string;
  currentScore: number;
  targetScore: number;
  isWinner: boolean;
  isLocalUser: boolean;
}

/** Outcome of a completed Showdown from the local user's perspective */
export type CompletionOutcome = 'win' | 'loss' | 'draw';

/** Game + metric + target configuration for a bounty */
export interface ChallengeContext {
  gameName: GameTitle;
  gameLogoColor: string;
  metric: ShowdownMetric;
  targetScore: number;
}

/** Complete Showdown Bounty data model */
export interface ShowdownBounty {
  bountyId: string;
  chatId: string;
  createdAt: string;
  expiresAt: string;
  challengeContext: ChallengeContext;
  status: ShowdownStatus;
  participants: ShowdownParticipant[];
}

/** Game selection option for the creation sheet */
export interface GameOption {
  title: GameTitle;
  color: string;
  icon: string;
  metrics: ShowdownMetric[];
}

/** Available games for Showdown creation */
export const GAME_OPTIONS: GameOption[] = [
  {
    title: 'EA SPORTS FC 26',
    color: '#0076FF',
    icon: '⚽',
    metrics: ['Goals Scored', 'Assists', 'Wins'],
  },
  {
    title: 'Battlefield 6',
    color: '#FF6B00',
    icon: '🎯',
    metrics: ['Eliminations', 'Damage Dealt', 'Wins'],
  },
  {
    title: 'Apex Legends',
    color: '#FF3B5C',
    icon: '🔥',
    metrics: ['Eliminations', 'Damage Dealt', 'Wins'],
  },
];

/** Preset target values for quick selection */
export const TARGET_PRESETS: number[] = [5, 10, 15, 20, 25];

/** Platform-aware monospace font for scores/labels */
export const MONO_FONT = Platform.select({
  ios: 'Menlo',
  default: 'monospace',
}) as string;
