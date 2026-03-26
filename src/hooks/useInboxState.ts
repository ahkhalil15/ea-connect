/**
 * useInboxState - Manages inbox state including read/unread status
 * Tracks which items have been viewed and interacted with
 */

import { useState, useCallback } from 'react';
import { MissedInteraction, InboxMessage } from '../types';
import { 
  missedInteractions as initialMissedData,
  inboxMessages as initialInboxData 
} from '../data/mockData';

interface UseInboxStateReturn {
  missedInteractions: MissedInteraction[];
  inboxMessages: InboxMessage[];
  dismissInteraction: (eventId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
  sendQuickMessage: (eventId: string, messageText: string) => void;
  hasUnreadMessages: boolean;
  unreadCount: number;
}

export function useInboxState(): UseInboxStateReturn {
  const [missedInteractions, setMissedInteractions] = useState<MissedInteraction[]>(initialMissedData);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(initialInboxData);

  const dismissInteraction = useCallback((eventId: string) => {
    setMissedInteractions((current) =>
      current.filter((interaction) => interaction.eventId !== eventId)
    );
    
    console.log('Telemetry Event: Echo interaction dismissed', {
      eventId,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const markMessageAsRead = useCallback((messageId: string) => {
    setInboxMessages((current) =>
      current.map((msg) =>
        msg.id === messageId ? { ...msg, unreadCount: 0 } : msg
      )
    );
    
    console.log('Telemetry Event: Message marked as read', {
      messageId,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setInboxMessages((current) =>
      current.map((msg) => ({ ...msg, unreadCount: 0 }))
    );
  }, []);

  const sendQuickMessage = useCallback((eventId: string, messageText: string) => {
    console.log('Telemetry Event: Quick message sent via EA Echo', {
      eventId,
      messageText,
      timestamp: new Date().toISOString(),
      source: 'echo_carousel',
    });

    // Remove the interaction after sending
    dismissInteraction(eventId);
  }, [dismissInteraction]);

  const unreadCount = inboxMessages.reduce((sum, msg) => sum + msg.unreadCount, 0);

  return {
    missedInteractions,
    inboxMessages,
    dismissInteraction,
    markMessageAsRead,
    markAllAsRead,
    sendQuickMessage,
    hasUnreadMessages: unreadCount > 0,
    unreadCount,
  };
}
