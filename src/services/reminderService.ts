import type { Card } from '../types';

interface ReminderService {
  checkReminders: (cards: Card[], onReminder: (card: Card) => void) => void;
  startReminderCheck: (cards: Card[], onReminder: (card: Card) => void) => number;
  stopReminderCheck: (intervalId: number) => void;
}

export const reminderService: ReminderService = {
  checkReminders: (cards: Card[], onReminder: (card: Card) => void) => {
    const now = new Date();
    
    cards.forEach(card => {
      if (
        card.reminder_enabled && 
        card.reminder_date && 
        new Date(card.reminder_date) <= now
      ) {
        onReminder(card);
      }
    });
  },

  startReminderCheck: (cards: Card[], onReminder: (card: Card) => void) => {
    // Check every minute for due reminders
    const intervalId = window.setInterval(() => {
      reminderService.checkReminders(cards, onReminder);
    }, 60000); // 60 seconds

    // Also check immediately
    reminderService.checkReminders(cards, onReminder);
    
    return intervalId;
  },

  stopReminderCheck: (intervalId: number) => {
    clearInterval(intervalId);
  },
};

// Helper function to get all cards from a board
export function getAllCardsFromBoard(board: { lists?: { cards?: Card[] }[] }): Card[] {
  if (!board?.lists) return [];
  
  return board.lists.reduce((allCards: Card[], list) => {
    if (list.cards) {
      return [...allCards, ...list.cards];
    }
    return allCards;
  }, []);
}