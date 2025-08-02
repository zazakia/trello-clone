import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { AppNotification, NotificationSettings } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  settings: NotificationSettings;
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: AppNotification[] }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<AppNotification> } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'SNOOZE_NOTIFICATION'; payload: { id: string; snoozedUntil: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationSettings> };

const initialState: NotificationState = {
  notifications: [],
  settings: {
    browserNotifications: true,
    emailNotifications: false,
    reminderNotifications: true,
    boardActivityNotifications: true,
    mentionNotifications: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  },
  unreadCount: 0,
  loading: false,
  error: null,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_NOTIFICATIONS': {
      const notifications = action.payload;
      const unreadCount = notifications.filter(n => !n.readAt && !n.dismissedAt).length;
      return { ...state, notifications, unreadCount };
    }

    case 'ADD_NOTIFICATION': {
      const newNotification = action.payload;
      const notifications = [newNotification, ...state.notifications];
      const unreadCount = notifications.filter(n => !n.readAt && !n.dismissedAt).length;
      return { ...state, notifications, unreadCount };
    }

    case 'UPDATE_NOTIFICATION': {
      const { id, updates } = action.payload;
      const notifications = state.notifications.map(n =>
        n.id === id ? { ...n, ...updates } : n
      );
      const unreadCount = notifications.filter(n => !n.readAt && !n.dismissedAt).length;
      return { ...state, notifications, unreadCount };
    }

    case 'REMOVE_NOTIFICATION': {
      const notifications = state.notifications.filter(n => n.id !== action.payload);
      const unreadCount = notifications.filter(n => !n.readAt && !n.dismissedAt).length;
      return { ...state, notifications, unreadCount };
    }

    case 'MARK_AS_READ': {
      const readAt = new Date().toISOString();
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, readAt } : n
      );
      const unreadCount = notifications.filter(n => !n.readAt && !n.dismissedAt).length;
      return { ...state, notifications, unreadCount };
    }

    case 'MARK_ALL_AS_READ': {
      const readAt = new Date().toISOString();
      const notifications = state.notifications.map(n =>
        !n.readAt ? { ...n, readAt } : n
      );
      return { ...state, notifications, unreadCount: 0 };
    }

    case 'DISMISS_NOTIFICATION': {
      const dismissedAt = new Date().toISOString();
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, dismissedAt } : n
      );
      const unreadCount = notifications.filter(n => !n.readAt && !n.dismissedAt).length;
      return { ...state, notifications, unreadCount };
    }

    case 'SNOOZE_NOTIFICATION': {
      const { id, snoozedUntil } = action.payload;
      const notifications = state.notifications.map(n =>
        n.id === id ? { ...n, snoozedUntil } : n
      );
      return { ...state, notifications };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    default:
      return state;
  }
}

interface NotificationActions {
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  snoozeNotification: (id: string, minutes: number) => void;
  removeNotification: (id: string) => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  createReminderNotification: (cardTitle: string, reminderDate: string, cardId: string, boardId: string) => void;
}

interface NotificationContextType {
  state: NotificationState;
  actions: NotificationActions;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const actions = {
    addNotification: useCallback((notification: Omit<AppNotification, 'id' | 'createdAt'>) => {
      const newNotification: AppNotification = {
        ...notification,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    }, []),

    markAsRead: useCallback((id: string) => {
      dispatch({ type: 'MARK_AS_READ', payload: id });
    }, []),

    markAllAsRead: useCallback(() => {
      dispatch({ type: 'MARK_ALL_AS_READ' });
    }, []),

    dismissNotification: useCallback((id: string) => {
      dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
    }, []),

    snoozeNotification: useCallback((id: string, minutes: number) => {
      const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      dispatch({ type: 'SNOOZE_NOTIFICATION', payload: { id, snoozedUntil } });
    }, []),

    removeNotification: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    }, []),

    updateSettings: useCallback((settings: Partial<NotificationSettings>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    }, []),

    createReminderNotification: useCallback((cardTitle: string, reminderDate: string, cardId: string, boardId: string) => {
      const notification: Omit<AppNotification, 'id' | 'createdAt'> = {
        type: 'reminder',
        title: '🔔 Reminder Due',
        message: `Don't forget: ${cardTitle}`,
        cardId,
        boardId,
        priority: 'high',
        metadata: {
          reminderDate,
          cardTitle,
        },
      };
      actions.addNotification(notification);
    }, []),
  };

  return (
    <NotificationContext.Provider value={{ state, actions }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}