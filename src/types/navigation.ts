/**
 * Navigation type definitions for EA Connect
 */

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Player, GameContext } from './index';

export type RootStackParamList = {
  /** Main inbox with tab navigator (Chat + Showdowns) */
  Inbox: undefined;

  /** Chat thread — destination for message taps and showdown card navigation */
  ChatThread: {
    player: Player;
    gameContext?: GameContext;
    quickMessage?: string;
    autoJoinLobby?: boolean;
  };
};

export type InboxScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Inbox'>;
export type ChatThreadScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatThread'>;
export type ChatThreadScreenRouteProp = RouteProp<RootStackParamList, 'ChatThread'>;
