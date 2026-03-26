/**
 * Tab navigator types — separate from the root stack to avoid
 * modifying navigation.ts (which InboxScreen depends on).
 */

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation';

export type MainTabParamList = {
  Chat: undefined;
  Showdowns: undefined;
};

/** Showdowns tab can navigate to both sibling tabs and parent stack screens */
export type ShowdownsInboxScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Showdowns'>,
  NativeStackNavigationProp<RootStackParamList>
>;
