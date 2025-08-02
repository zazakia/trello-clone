export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  list_id: string;
  created_at: string;
  updated_at: string;
  reminder_date?: string;
  reminder_enabled?: boolean;
}

export interface List {
  id: string;
  title: string;
  position: number;
  board_id: string;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  lists?: List[];
}

export interface CreateCardData {
  title: string;
  description?: string;
  list_id: string;
  position?: number;
}

export interface CreateListData {
  title: string;
  board_id: string;
  position?: number;
}

export interface CreateBoardData {
  title: string;
  description?: string;
}

export interface UpdateCardData {
  title?: string;
  description?: string;
  position?: number;
  list_id?: string;
  reminder_date?: string | null;
  reminder_enabled?: boolean;
}

export interface UpdateListData {
  title?: string;
  position?: number;
}

export interface UpdateBoardData {
  title?: string;
  description?: string;
}

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

export interface AppNotification {
  id: string;
  type: 'reminder' | 'system' | 'board_activity' | 'mention';
  title: string;
  message: string;
  cardId?: string;
  boardId?: string;
  listId?: string;
  createdAt: string;
  readAt?: string;
  dismissedAt?: string;
  snoozedUntil?: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: {
    reminderDate?: string;
    cardTitle?: string;
    boardTitle?: string;
    listTitle?: string;
  };
}

export interface NotificationSettings {
  browserNotifications: boolean;
  emailNotifications: boolean;
  reminderNotifications: boolean;
  boardActivityNotifications: boolean;
  mentionNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}