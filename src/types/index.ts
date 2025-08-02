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