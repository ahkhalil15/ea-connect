/**
 * Navigation type definitions for EA Connect
 * Every screen has a clear purpose and destination
 */

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Player, GameContext } from './index';

/** Lobby player with ready status */
export interface LobbyPlayer {
  player: Player;
  isReady: boolean;
  isHost: boolean;
}

export type RootStackParamList = {
  /** Main inbox with Echo carousel + message list */
  Inbox: undefined;
  
  /** Lobby preview - destination for game invite taps */
  LobbyPreview: {
    hostPlayer: Player;
    gameContext: GameContext;
    lobbyPlayers: LobbyPlayer[];
    lobbyStatus: 'waiting' | 'in_match' | 'starting';
    eventId: string;
  };
  
  /** Chat thread - destination for message taps and quick replies */
  ChatThread: {
    player: Player;
    gameContext?: GameContext;
    quickMessage?: string;
    sentViaEcho?: boolean;
    autoJoinLobby?: boolean;
  };
};

export type InboxScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Inbox'>;
export type LobbyPreviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LobbyPreview'>;
export type LobbyPreviewScreenRouteProp = RouteProp<RootStackParamList, 'LobbyPreview'>;
export type ChatThreadScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatThread'>;
export type ChatThreadScreenRouteProp = RouteProp<RootStackParamList, 'ChatThread'>;
