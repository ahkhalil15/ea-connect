/**
 * QuickMessagePill - Frictionless reply button
 * These are ACTION TRIGGERS that navigate to destinations
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../utils/theme';

interface QuickMessagePillProps {
  text: string;
  onPress: () => void;
}

export const QuickMessagePill: React.FC<QuickMessagePillProps> = ({
  text,
  onPress,
}) => {
  const handlePress = () => {
    console.log('Pill pressed:', text);
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.pill}
      onPress={handlePress}
      activeOpacity={0.6}
    >
      <Text style={styles.pillText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.eaPrimaryBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    // @ts-ignore - web only
    cursor: 'pointer',
  },
  pillText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
});
