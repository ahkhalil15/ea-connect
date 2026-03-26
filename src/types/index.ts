/**
 * EA Echo - Type Definitions
 * Aligned with EADP (EA Digital Platform) telemetry architecture
 */

/** Presence status enum for player availability */
export type PresenceStatus = 'online' | 'away' | 'in_game' | 'offline';

/** Event type enum for missed interactions */
export type EventType = 'missed_game_invite' | 'missed_message';

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

/** 
 * MissedInteraction - Core data structure for EA Echo
 * Mirrors EADP backend telemetry schema
 */
export interface MissedInteraction {
  eventId: string;
  eventType: EventType;
  player: Player;
  gameContext: GameContext;
  timestamp: string; // ISO 8601 format
  messagePreview?: string; // Optional preview for missed_message type
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
