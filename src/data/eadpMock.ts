/**
 * EADP Mock Data — Simulated Showdown bounty timeline.
 *
 * Contains 6 showdown_bounty items across all lifecycle states:
 *   2 active  (one winning, one losing for local user)
 *   2 pending (awaiting acceptance)
 *   2 completed (one win, one loss for local user)
 *
 * Convention: participants[0] is ALWAYS the local user ("You").
 */

import { ShowdownBounty } from '../types/showdown';

export interface ShowdownTimelineItem {
  id: string;
  type: 'showdown_bounty';
  bounty: ShowdownBounty;
  timestamp: string;
}

/** Per-chatId metadata for routing from Showdowns inbox to the correct chat thread */
export const CHAT_METADATA: Record<string, {
  displayName: string;
  avatarUrl: string;
  gameStatus: string;
  presenceStatus: 'online' | 'in_game' | 'away' | 'offline';
}> = {
  chat_shadowranger: {
    displayName: 'ShadowRanger',
    avatarUrl: 'https://i.pravatar.cc/150?u=shadowranger',
    gameStatus: 'Apex Legends',
    presenceStatus: 'online',
  },
  chat_neonviper42: {
    displayName: 'NeonViper_42',
    avatarUrl: 'https://i.pravatar.cc/80?u=neonviper42',
    gameStatus: 'EA SPORTS FC 26',
    presenceStatus: 'in_game',
  },
  chat_blazestrike: {
    displayName: 'BlazeStrike',
    avatarUrl: 'https://i.pravatar.cc/80?u=blazestrike',
    gameStatus: 'Battlefield 6',
    presenceStatus: 'in_game',
  },
  chat_frostbytex: {
    displayName: 'FrostByte_X',
    avatarUrl: 'https://i.pravatar.cc/80?u=frostbytex',
    gameStatus: 'EA SPORTS FC 26',
    presenceStatus: 'online',
  },
  chat_phantomace: {
    displayName: 'xX_PhantomAce_Xx',
    avatarUrl: 'https://i.pravatar.cc/80?u=phantomace',
    gameStatus: 'Apex Legends',
    presenceStatus: 'away',
  },
  chat_glitchhunter99: {
    displayName: 'GlitchHunter99',
    avatarUrl: 'https://i.pravatar.cc/80?u=glitchhunter99',
    gameStatus: 'EA SPORTS FC 26',
    presenceStatus: 'online',
  },
};

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;

export const chatTimeline: ShowdownTimelineItem[] = [
  // ── ACTIVE: local user WINNING ──
  {
    id: 'sd_active_win',
    type: 'showdown_bounty',
    bounty: {
      bountyId: 'SD_A1',
      chatId: 'chat_neonviper42',
      createdAt: new Date(now - 2 * DAY).toISOString(),
      expiresAt: new Date(now + 4 * DAY + 12 * 60 * 60 * 1000).toISOString(),
      challengeContext: {
        gameName: 'EA SPORTS FC 26',
        gameLogoColor: '#0076FF',
        metric: 'Goals Scored',
        targetScore: 10,
      },
      status: 'active',
      participants: [
        { eaId: 'You', avatarUrl: 'https://i.pravatar.cc/80?u=me_player', currentScore: 8, targetScore: 10, isWinner: false, isLocalUser: true },
        { eaId: 'NeonViper_42', avatarUrl: 'https://i.pravatar.cc/80?u=neonviper42', currentScore: 5, targetScore: 10, isWinner: false, isLocalUser: false },
      ],
    },
    timestamp: new Date(now - 2 * DAY).toISOString(),
  },

  // ── ACTIVE: local user LOSING ──
  {
    id: 'sd_active_lose',
    type: 'showdown_bounty',
    bounty: {
      bountyId: 'SD_A2',
      chatId: 'chat_blazestrike',
      createdAt: new Date(now - 1 * DAY).toISOString(),
      expiresAt: new Date(now + 6 * DAY + 3 * 60 * 60 * 1000).toISOString(),
      challengeContext: {
        gameName: 'Battlefield 6',
        gameLogoColor: '#FF6B00',
        metric: 'Eliminations',
        targetScore: 10,
      },
      status: 'active',
      participants: [
        { eaId: 'You', avatarUrl: 'https://i.pravatar.cc/80?u=me_player', currentScore: 3, targetScore: 10, isWinner: false, isLocalUser: true },
        { eaId: 'BlazeStrike', avatarUrl: 'https://i.pravatar.cc/80?u=blazestrike', currentScore: 7, targetScore: 10, isWinner: false, isLocalUser: false },
      ],
    },
    timestamp: new Date(now - 1 * DAY).toISOString(),
  },

  // ── PENDING: Apex challenge ──
  {
    id: 'sd_pending_1',
    type: 'showdown_bounty',
    bounty: {
      bountyId: 'SD_P1',
      chatId: 'chat_phantomace',
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now + 7 * DAY).toISOString(),
      challengeContext: {
        gameName: 'Apex Legends',
        gameLogoColor: '#FF3B5C',
        metric: 'Damage Dealt',
        targetScore: 15,
      },
      status: 'pending',
      participants: [
        { eaId: 'You', avatarUrl: 'https://i.pravatar.cc/80?u=me_player', currentScore: 0, targetScore: 15, isWinner: false, isLocalUser: true },
        { eaId: 'xX_PhantomAce_Xx', avatarUrl: 'https://i.pravatar.cc/80?u=phantomace', currentScore: 0, targetScore: 15, isWinner: false, isLocalUser: false },
      ],
    },
    timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
  },

  // ── PENDING: FC 26 assists challenge ──
  {
    id: 'sd_pending_2',
    type: 'showdown_bounty',
    bounty: {
      bountyId: 'SD_P2',
      chatId: 'chat_glitchhunter99',
      createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
      expiresAt: new Date(now + 7 * DAY).toISOString(),
      challengeContext: {
        gameName: 'EA SPORTS FC 26',
        gameLogoColor: '#0076FF',
        metric: 'Assists',
        targetScore: 10,
      },
      status: 'pending',
      participants: [
        { eaId: 'You', avatarUrl: 'https://i.pravatar.cc/80?u=me_player', currentScore: 0, targetScore: 10, isWinner: false, isLocalUser: true },
        { eaId: 'GlitchHunter99', avatarUrl: 'https://i.pravatar.cc/80?u=glitchhunter99', currentScore: 0, targetScore: 10, isWinner: false, isLocalUser: false },
      ],
    },
    timestamp: new Date(now - 30 * 60 * 1000).toISOString(),
  },

  // ── COMPLETED: local user WON ──
  {
    id: 'sd_complete_win',
    type: 'showdown_bounty',
    bounty: {
      bountyId: 'SD_C1',
      chatId: 'chat_frostbytex',
      createdAt: new Date(now - 5 * DAY).toISOString(),
      expiresAt: new Date(now - 1 * DAY).toISOString(),
      challengeContext: {
        gameName: 'EA SPORTS FC 26',
        gameLogoColor: '#0076FF',
        metric: 'Goals Scored',
        targetScore: 10,
      },
      status: 'completed',
      participants: [
        { eaId: 'You', avatarUrl: 'https://i.pravatar.cc/80?u=me_player', currentScore: 10, targetScore: 10, isWinner: true, isLocalUser: true },
        { eaId: 'FrostByte_X', avatarUrl: 'https://i.pravatar.cc/80?u=frostbytex', currentScore: 7, targetScore: 10, isWinner: false, isLocalUser: false },
      ],
    },
    timestamp: new Date(now - 1 * DAY).toISOString(),
  },

  // ── COMPLETED: local user LOST ──
  {
    id: 'sd_complete_lose',
    type: 'showdown_bounty',
    bounty: {
      bountyId: 'SD_C2',
      chatId: 'chat_shadowranger',
      createdAt: new Date(now - 8 * DAY).toISOString(),
      expiresAt: new Date(now - 3 * DAY).toISOString(),
      challengeContext: {
        gameName: 'Apex Legends',
        gameLogoColor: '#FF3B5C',
        metric: 'Eliminations',
        targetScore: 10,
      },
      status: 'completed',
      participants: [
        { eaId: 'You', avatarUrl: 'https://i.pravatar.cc/80?u=me_player', currentScore: 5, targetScore: 10, isWinner: false, isLocalUser: true },
        { eaId: 'ShadowRanger', avatarUrl: 'https://i.pravatar.cc/80?u=shadowranger', currentScore: 10, targetScore: 10, isWinner: true, isLocalUser: false },
      ],
    },
    timestamp: new Date(now - 3 * DAY).toISOString(),
  },
];
