import type { AppNotification } from '../types';

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Board activity notifications
  createBoardActivityNotification(
    activityType: 'card_created' | 'card_moved' | 'card_updated' | 'list_created' | 'list_moved',
    details: {
      cardTitle?: string;
      listTitle?: string;
      boardTitle?: string;
      boardId: string;
      cardId?: string;
      listId?: string;
    }
  ): Omit<AppNotification, 'id' | 'createdAt'> {
    const { cardTitle, listTitle, boardTitle, boardId, cardId, listId } = details;
    
    let title = '';
    let message = '';
    
    switch (activityType) {
      case 'card_created':
        title = '📝 New Card Created';
        message = `"${cardTitle}" was added to ${listTitle}`;
        break;
      case 'card_moved':
        title = '🔄 Card Moved';
        message = `"${cardTitle}" was moved to ${listTitle}`;
        break;
      case 'card_updated':
        title = '✏️ Card Updated';
        message = `"${cardTitle}" was updated`;
        break;
      case 'list_created':
        title = '📋 New List Created';
        message = `"${listTitle}" was added to the board`;
        break;
      case 'list_moved':
        title = '🔄 List Moved';
        message = `"${listTitle}" was reordered`;
        break;
    }

    return {
      type: 'board_activity',
      title,
      message,
      cardId,
      boardId,
      listId,
      priority: 'low',
      metadata: {
        cardTitle,
        listTitle,
        boardTitle,
      },
    };
  }

  // System notifications
  createSystemNotification(
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Omit<AppNotification, 'id' | 'createdAt'> {
    return {
      type: 'system',
      title,
      message,
      priority,
    };
  }

  // Due date notifications
  createDueDateNotification(
    cardTitle: string,
    dueDate: string,
    cardId: string,
    boardId: string,
    isOverdue: boolean = false
  ): Omit<AppNotification, 'id' | 'createdAt'> {
    return {
      type: 'reminder',
      title: isOverdue ? '⚠️ Overdue Reminder' : '⏰ Due Soon',
      message: isOverdue 
        ? `"${cardTitle}" is overdue!`
        : `"${cardTitle}" is due soon`,
      cardId,
      boardId,
      priority: isOverdue ? 'high' : 'medium',
      metadata: {
        reminderDate: dueDate,
        cardTitle,
      },
    };
  }

  // Check if it's quiet hours
  isQuietHours(settings: { quietHours: { enabled: boolean; startTime: string; endTime: string } }): boolean {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { startTime, endTime } = settings.quietHours;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    
    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return currentTime >= startTime && currentTime <= endTime;
  }

  // Format notification message with user mentions
  formatMessageWithMentions(message: string, mentions: string[]): string {
    let formattedMessage = message;
    mentions.forEach(mention => {
      formattedMessage = formattedMessage.replace(
        new RegExp(`@${mention}`, 'g'),
        `@${mention}`
      );
    });
    return formattedMessage;
  }

  // Get notification icon based on type
  getNotificationIcon(type: AppNotification['type']): string {
    switch (type) {
      case 'reminder':
        return '🔔';
      case 'system':
        return 'ℹ️';
      case 'board_activity':
        return '📋';
      case 'mention':
        return '👋';
      default:
        return '📢';
    }
  }

  // Calculate notification urgency score
  getUrgencyScore(notification: AppNotification): number {
    let score = 0;
    
    // Base score by priority
    switch (notification.priority) {
      case 'high':
        score += 100;
        break;
      case 'medium':
        score += 50;
        break;
      case 'low':
        score += 10;
        break;
    }
    
    // Additional score by type
    switch (notification.type) {
      case 'reminder':
        score += 50;
        break;
      case 'mention':
        score += 30;
        break;
      case 'board_activity':
        score += 10;
        break;
      case 'system':
        score += 5;
        break;
    }
    
    // Reduce score based on age
    const ageInHours = (Date.now() - new Date(notification.createdAt).getTime()) / (1000 * 60 * 60);
    score = Math.max(score - ageInHours * 5, 1);
    
    return Math.round(score);
  }
}

export const notificationService = NotificationService.getInstance();