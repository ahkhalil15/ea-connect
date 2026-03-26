/**
 * EA Connect — Mock Data
 * Chat inbox messages and quick message options.
 */

import { InboxMessage, QuickMessageOption } from '../types';

/**
 * Quick message options — contextual, frictionless replies
 */
export const quickMessageOptions: QuickMessageOption[] = [
  { id: 'qm_down', text: "Yeah! I'm down 🎮" },
  { id: 'qm_minute', text: 'Need a minute ⏳' },
  { id: 'qm_dinner', text: 'Maybe after dinner?' },
  { id: 'qm_later', text: 'Hit me up later' },
  { id: 'qm_busy', text: 'Busy rn, sorry!' },
  { id: 'qm_omw', text: 'On my way! 🏃' },
  { id: 'qm_five', text: 'Give me 5 mins' },
  { id: 'qm_lets_go', text: "Let's gooo! 🔥" },
];

/**
 * Standard inbox messages — existing conversation threads
 */
export const inboxMessages: InboxMessage[] = [
  {
    id: 'inbox_001',
    player: {
      eaId: 'ProGamer_99',
      avatarUrl: 'https://i.pravatar.cc/150?u=progamer99',
      presenceStatus: 'online',
    },
    lastMessage: 'GG! That was intense',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 2,
    gameContext: {
      gameName: 'EA SPORTS FC 26',
      gameImage: 'https://media.contentapi.ea.com/content/dam/ea/fc/fc-25/common/gameplay/fc25-gameplay-grid-tile-background-16x9.jpg',
    },
  },
  {
    id: 'inbox_002',
    player: {
      eaId: 'CasualChamp',
      avatarUrl: 'https://i.pravatar.cc/150?u=casualchamp',
      presenceStatus: 'away',
    },
    lastMessage: 'Ranked matches tonight?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'inbox_003',
    player: {
      eaId: 'TeamLeader_Alpha',
      avatarUrl: 'https://i.pravatar.cc/150?u=teamleader',
      presenceStatus: 'in_game',
    },
    lastMessage: 'Tournament registration closes tomorrow',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    gameContext: {
      gameName: 'Apex Legends',
      gameImage: 'https://media.contentapi.ea.com/content/dam/apex-legends/common/articles/apex-legends-breakout/apex-legends-season-20-keyart-background.jpg',
    },
  },
  {
    id: 'inbox_004',
    player: {
      eaId: 'StrategyMaster',
      avatarUrl: 'https://i.pravatar.cc/150?u=strategymaster',
      presenceStatus: 'offline',
    },
    lastMessage: 'Check out this highlight clip',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'inbox_005',
    player: {
      eaId: 'RookieRiser',
      avatarUrl: 'https://i.pravatar.cc/150?u=rookieriser',
      presenceStatus: 'online',
    },
    lastMessage: 'Thanks for the tips!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
];
