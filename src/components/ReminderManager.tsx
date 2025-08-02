import { useEffect, useRef } from 'react';
import { useBoard } from '../hooks/useBoard';
import { useNotifications as useBrowserNotifications } from '../hooks/useNotifications';
import { useNotifications as useAppNotifications } from '../contexts/NotificationContext';
import { reminderService, getAllCardsFromBoard } from '../services/reminderService';
import type { Card } from '../types';

export function ReminderManager() {
  const { state } = useBoard();
  const { showNotification } = useBrowserNotifications();
  const { actions: notificationActions } = useAppNotifications();
  const intervalRef = useRef<number | null>(null);
  const notifiedCardsRef = useRef<Set<string>>(new Set());

  const handleReminder = (card: Card) => {
    // Avoid showing the same reminder multiple times
    if (notifiedCardsRef.current.has(card.id)) {
      return;
    }

    notifiedCardsRef.current.add(card.id);
    
    // Show browser notification
    showNotification({
      title: '🔔 Trello Reminder',
      body: `Don't forget: ${card.title}`,
      tag: `reminder-${card.id}`,
      requireInteraction: true,
    });

    // Add to app notification center
    notificationActions.createReminderNotification(
      card.title,
      card.reminder_date || new Date().toISOString(),
      card.id,
      card.list_id
    );

    // Remove from notified set after 5 minutes to allow re-notification for overdue items
    setTimeout(() => {
      notifiedCardsRef.current.delete(card.id);
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      reminderService.stopReminderCheck(intervalRef.current);
    }

    // Start reminder checking if we have a current board
    if (state.currentBoard) {
      const allCards = getAllCardsFromBoard(state.currentBoard);
      intervalRef.current = reminderService.startReminderCheck(allCards, handleReminder);
    }

    return () => {
      if (intervalRef.current) {
        reminderService.stopReminderCheck(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentBoard]);

  // This component doesn't render anything, it just manages reminders
  return null;
}