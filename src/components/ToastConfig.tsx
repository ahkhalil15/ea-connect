/**
 * Custom Toast Configuration for EA Connect
 * Styled to match the dark mode aesthetic
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { colors, spacing, typography, borderRadius } from '../utils/theme';

interface ToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const SuccessToast: React.FC<ToastProps> = ({ text1, text2 }) => (
  <View style={styles.successContainer}>
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>✓</Text>
    </View>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.title}>{text1}</Text>}
      {text2 && <Text style={styles.subtitle}>{text2}</Text>}
    </View>
  </View>
);

const ErrorToast: React.FC<ToastProps> = ({ text1, text2 }) => (
  <View style={styles.errorContainer}>
    <View style={[styles.iconContainer, styles.errorIcon]}>
      <Text style={styles.icon}>✕</Text>
    </View>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.title}>{text1}</Text>}
      {text2 && <Text style={styles.subtitle}>{text2}</Text>}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: ToastProps) => <SuccessToast {...props} />,
  error: (props: ToastProps) => <ErrorToast {...props} />,
};

const styles = StyleSheet.create({
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.accentSuccess,
    marginHorizontal: spacing.lg,
    shadowColor: colors.accentSuccess,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.accentError,
    marginHorizontal: spacing.lg,
    shadowColor: colors.accentError,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentSuccess,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  errorIcon: {
    backgroundColor: colors.accentError,
  },
  icon: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    marginTop: 2,
  },
});
