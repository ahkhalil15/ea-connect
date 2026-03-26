/**
 * EA Echo - Mock Data
 * EADP Telemetry-Aligned Mock State
 * 
 * This mock data mirrors the production EADP backend architecture
 * for seamless integration when connected to real services.
 */

import { MissedInteraction, InboxMessage, QuickMessageOption } from '../types';
import { LobbyPlayer } from '../types/navigation';

/**
 * Generate lobby players for a given host
 */
export const generateLobbyPlayers = (hostPlayer: MissedInteraction['player']): LobbyPlayer[] => {
  const additionalPlayers: LobbyPlayer[] = [
    {
      player: hostPlayer,
      isReady: true,
      isHost: true,
    },
    {
      player: {
        eaId: 'QuickScope_Pro',
        avatarUrl: 'https://i.pravatar.cc/150?u=quickscope',
        presenceStatus: 'in_game',
      },
      isReady: true,
      isHost: false,
    },
    {
      player: {
        eaId: 'StealthMaster',
        avatarUrl: 'https://i.pravatar.cc/150?u=stealth',
        presenceStatus: 'in_game',
      },
      isReady: false,
      isHost: false,
    },
  ];
  return additionalPlayers;
};

/**
 * missedInteractions - Core state array for EA Echo carousel
 * Contains highly contextual missed interaction data
 */
export const missedInteractions: MissedInteraction[] = [
  {
    eventId: 'evt_001_fc25_lobby',
    eventType: 'missed_game_invite',
    player: {
      eaId: 'ShadowRanger',
      avatarUrl: 'https://i.pravatar.cc/150?u=shadowranger',
      presenceStatus: 'online',
    },
    gameContext: {
      gameName: 'EA SPORTS FC 26',
      gameImage: 'https://media.contentapi.ea.com/content/dam/ea/fc/fc-25/common/gameplay/fc25-gameplay-grid-tile-background-16x9.jpg',
    },
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
  },
  {
    eventId: 'evt_002_apex_squad',
    eventType: 'missed_game_invite',
    player: {
      eaId: 'NightHawk_Elite',
      avatarUrl: 'https://i.pravatar.cc/150?u=nighthawk',
      presenceStatus: 'in_game',
    },
    gameContext: {
      gameName: 'Apex Legends',
      gameImage: 'https://media.contentapi.ea.com/content/dam/apex-legends/common/articles/apex-legends-breakout/apex-legends-season-20-keyart-background.jpg',
    },
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
  },
  {
    eventId: 'evt_003_msg_dragon',
    eventType: 'missed_message',
    player: {
      eaId: 'DragonSlayer_2099',
      avatarUrl: 'https://i.pravatar.cc/150?u=dragonslayer',
      presenceStatus: 'away',
    },
    gameContext: {
      gameName: 'Dragon Age: The Veilguard',
      gameImage: 'https://media.contentapi.ea.com/content/dam/ea/dragon-age/the-veilguard/common/pre-order-now-screenshot-16x9.jpg',
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
    messagePreview: 'Hey, wanna run the new dungeon?',
  },
  {
    eventId: 'evt_004_madden_invite',
    eventType: 'missed_game_invite',
    player: {
      eaId: 'GridironKing_MVP',
      avatarUrl: 'https://i.pravatar.cc/150?u=gridiron',
      presenceStatus: 'online',
    },
    gameContext: {
      gameName: 'Madden NFL 25',
      gameImage: 'https://media.contentapi.ea.com/content/dam/ea/madden-nfl/madden-nfl-25/common/packart/MN25-Deluxe-Edition-Boxart-16x9.png',
    },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hrs ago
  },
  {
    eventId: 'evt_005_msg_tactical',
    eventType: 'missed_message',
    player: {
      eaId: 'TacticalOperator_X',
      avatarUrl: 'https://i.pravatar.cc/150?u=tactical',
      presenceStatus: 'offline',
    },
    gameContext: {
      gameName: 'Battlefield 2042',
      gameImage: 'https://media.contentapi.ea.com/content/dam/bf/bf-2042/common/media/screenshots/bf-2042-media-screenshot-01-background.jpg',
    },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hrs ago
    messagePreview: 'Squad up later tonight?',
  },
];

/**
 * Quick message options - Contextual, frictionless replies
 * Designed to maximize engagement without requiring keyboard input
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
 * Standard inbox messages - Existing conversation threads
 * Displayed below the Echo carousel
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
