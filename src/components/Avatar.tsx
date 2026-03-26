/**
 * Avatar - Player profile image with presence indicator
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { PresenceStatus } from '../types';
import { colors, borderRadius } from '../utils/theme';

interface AvatarProps {
  uri: string;
  size?: number;
  presenceStatus?: PresenceStatus;
  showPresence?: boolean;
}

const getPresenceColor = (status: PresenceStatus): string => {
  switch (status) {
    case 'online':
      return colors.statusOnline;
    case 'away':
      return colors.statusAway;
    case 'in_game':
      return colors.statusInGame;
    case 'offline':
    default:
      return colors.statusOffline;
  }
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 48,
  presenceStatus = 'offline',
  showPresence = true,
}) => {
  const presenceSize = Math.max(12, size * 0.28);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
      {showPresence && (
        <View
          style={[
            styles.presenceIndicator,
            {
              width: presenceSize,
              height: presenceSize,
              borderRadius: presenceSize / 2,
              backgroundColor: getPresenceColor(presenceStatus),
              borderWidth: size > 40 ? 2 : 1.5,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: colors.backgroundSecondary,
  },
  presenceIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: colors.backgroundCard,
  },
});
