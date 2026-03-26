/**
 * ShowdownsInboxScreen — The dedicated Showdowns tab.
 *
 * Displays all Showdown bounties from EADP mock data,
 * filtered by status (PENDING / ACTIVE / COMPLETED).
 *
 * State decisions:
 *   - Filter pills use Animated.timing scale for selection feedback
 *   - FlatList content fades on filter change (out 150ms → swap → in 200ms)
 *   - ACCEPT moves a pending card to active in local state
 *   - DECLINE removes the card (fade-out handled in ShowdownInboxCard)
 *   - Active card tap navigates to the Chat tab
 *   - Tab badge updates when pending count changes
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ShowdownsInboxScreenNavigationProp } from '../types/tabNavigation';
import { ShowdownTimelineItem, chatTimeline, CHAT_METADATA } from '../data/eadpMock';
import { ShowdownInboxCard } from '../components/ShowdownInboxCard';
import { ShowdownStatus, GameTitle, MONO_FONT } from '../types/showdown';

type FilterKey = 'pending' | 'active' | 'completed';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'pending', label: 'PENDING' },
  { key: 'active', label: 'ACTIVE' },
  { key: 'completed', label: 'COMPLETED' },
];

export const ShowdownsInboxScreen: React.FC = () => {
  const navigation = useNavigation<ShowdownsInboxScreenNavigationProp>();

  // Master item list — mutated by accept/decline actions
  const [items, setItems] = useState<ShowdownTimelineItem[]>(
    () => chatTimeline.filter((i) => i.type === 'showdown_bounty').map((i) => ({ ...i, bounty: { ...i.bounty } })),
  );

  // Active filter state — default to ACTIVE per spec
  const [activeFilter, setActiveFilter] = useState<FilterKey>('active');

  // Animation refs
  const listOpacity = useRef(new Animated.Value(1)).current;
  const pillScales = useRef<Record<FilterKey, Animated.Value>>({
    pending: new Animated.Value(1),
    active: new Animated.Value(1),
    completed: new Animated.Value(1),
  }).current;

  // ── Derived data ──
  const filteredItems = useMemo(
    () => items.filter((i) => i.bounty.status === activeFilter),
    [items, activeFilter],
  );

  const activeCount = useMemo(() => items.filter((i) => i.bounty.status === 'active').length, [items]);
  const pendingCount = useMemo(() => items.filter((i) => i.bounty.status === 'pending').length, [items]);

  // ── Update tab badge when pending count changes ──
  useEffect(() => {
    navigation.setOptions({
      tabBarBadge: pendingCount > 0 ? ' ' : undefined,
    });
  }, [pendingCount, navigation]);

  // ── Filter pill tap handler ──
  const handleFilterChange = useCallback(
    (key: FilterKey) => {
      if (key === activeFilter) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Pill scale bounce
      Animated.sequence([
        Animated.timing(pillScales[key], { toValue: 1.04, duration: 75, useNativeDriver: true }),
        Animated.timing(pillScales[key], { toValue: 1, duration: 75, useNativeDriver: true }),
      ]).start();

      // Fade out → swap filter → fade in
      Animated.timing(listOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setActiveFilter(key);
        Animated.timing(listOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    },
    [activeFilter, pillScales, listOpacity],
  );

  // ── ACCEPT: move pending → active ──
  const handleAccept = useCallback((id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, bounty: { ...i.bounty, status: 'active' as ShowdownStatus } } : i,
      ),
    );
  }, []);

  // ── DECLINE: remove from list (card handles its own fade-out) ──
  const handleDecline = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // ── Card tap: navigate to ChatThread screen for this bounty's chat thread ──
  // Uses CHAT_METADATA to look up player info by chatId, then navigates to the
  // ChatThread stack screen (not the Chat tab) so each card opens the correct thread
  const handleCardPress = useCallback(
    (pressedItem: ShowdownTimelineItem) => {
      const { chatId } = pressedItem.bounty;
      const meta = CHAT_METADATA[chatId];
      if (!meta) return;

      // Navigate to root stack's ChatThread, not the sibling Chat tab
      navigation.navigate('ChatThread', {
        player: {
          eaId: meta.displayName,
          avatarUrl: meta.avatarUrl,
          presenceStatus: meta.presenceStatus,
        },
        gameContext: {
          gameName: meta.gameStatus as GameTitle,
          gameImage: '',
        },
      });
    },
    [navigation],
  );

  // ── Render ──
  const renderCard = useCallback(
    ({ item }: { item: ShowdownTimelineItem }) => (
      <ShowdownInboxCard
        item={item}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onPress={handleCardPress}
      />
    ),
    [handleAccept, handleDecline, handleCardPress],
  );

  const keyExtractor = useCallback((item: ShowdownTimelineItem) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SHOWDOWNS</Text>
        <Text style={styles.headerSubtitle}>
          {activeCount} active · {pendingCount} pending
        </Text>
      </View>

      {/* ── Filter Pills ── */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((f) => {
            const isSelected = activeFilter === f.key;
            return (
              <Animated.View key={f.key} style={{ transform: [{ scale: pillScales[f.key] }] }}>
                <TouchableOpacity
                  style={[styles.filterPill, isSelected && styles.filterPillSelected]}
                  onPress={() => handleFilterChange(f.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterPillText, isSelected && styles.filterPillTextSelected]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List or Empty State ── */}
      <Animated.View style={[styles.listWrap, { opacity: listOpacity }]}>
        {filteredItems.length > 0 ? (
          <FlatList
            data={filteredItems}
            renderItem={renderCard}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⚡</Text>
            <Text style={styles.emptyTitle}>NO {activeFilter.toUpperCase()} SHOWDOWNS</Text>
            <Text style={styles.emptySubtitle}>Drop a bounty in any chat to get started</Text>
            <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.7}>
              <Text style={styles.emptyBtnText}>CREATE SHOWDOWN</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // Header
  header: {
    backgroundColor: '#111118',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,118,255,0.15)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E8E8F0',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    color: '#8888A0',
    letterSpacing: 1,
  },

  // Filter pills
  filterContainer: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterPillSelected: {
    backgroundColor: 'rgba(0,118,255,0.15)',
    borderColor: '#0076FF',
  },
  filterPillText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    color: '#8888A0',
    letterSpacing: 1,
  },
  filterPillTextSelected: {
    color: '#0076FF',
  },

  // List
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E8E8F0',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8888A0',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: '#0076FF',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
