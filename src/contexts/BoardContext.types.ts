import type { Board, List, Card } from '../types';

export interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
}

export type BoardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_CURRENT_BOARD'; payload: Board | null }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: Board }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'ADD_LIST'; payload: List }
  | { type: 'UPDATE_LIST'; payload: List }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'MOVE_LIST'; payload: { listId: string; newPosition: number } }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'MOVE_CARD'; payload: { cardId: string; sourceListId: string; destListId: string; newPosition: number } };

export interface BoardContextType {
  state: BoardState;
  actions: {
    loadBoards: () => Promise<void>;
    loadBoard: (id: string) => Promise<void>;
    createBoard: (title: string, description?: string) => Promise<void>;
    updateBoard: (id: string, title: string, description?: string) => Promise<void>;
    deleteBoard: (id: string) => Promise<void>;
    createList: (title: string, boardId: string) => Promise<void>;
    updateList: (id: string, title: string) => Promise<void>;
    deleteList: (id: string) => Promise<void>;
    createCard: (title: string, listId: string, description?: string) => Promise<void>;
    updateCard: (id: string, title: string, description?: string, reminderDate?: string | null, reminderEnabled?: boolean) => Promise<void>;
    deleteCard: (id: string) => Promise<void>;
    moveCard: (cardId: string, sourceListId: string, destListId: string, newPosition: number) => Promise<void>;
    moveList: (listId: string, newPosition: number) => Promise<void>;
  };
}