/**
 * EA Connect — Shared Type Definitions
 */

/** Presence status enum for player availability */
export type PresenceStatus = 'online' | 'away' | 'in_game' | 'offline';

/** Player profile data structure */
export interface Player {
  eaId: string;
  avatarUrl: string;
  presenceStatus: PresenceStatus;
}

/** Game context for game-related events */
export interface GameContext {
  gameName: string;
  gameImage: string;
}

/** Quick message option structure */
export interface QuickMessageOption {
  id: string;
  text: string;
}

/** Standard inbox message structure */
export interface InboxMessage {
  id: string;
  player: Player;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  gameContext?: GameContext;
}
