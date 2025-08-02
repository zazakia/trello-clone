import { useReducer, useCallback, type ReactNode } from 'react';
import type { Card } from '../types';
import { boardAPI, listAPI, cardAPI } from '../utils/supabase-api';
import type { BoardState, BoardAction } from './BoardContext.types';
import { BoardContext } from './BoardContextValue';

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_BOARDS':
      return { ...state, boards: action.payload };
    
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.payload };
    
    case 'ADD_BOARD':
      return { ...state, boards: [...state.boards, action.payload] };
    
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.id ? action.payload : board
        ),
        currentBoard: state.currentBoard?.id === action.payload.id ? action.payload : state.currentBoard,
      };
    
    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
        currentBoard: state.currentBoard?.id === action.payload ? null : state.currentBoard,
      };
    
    case 'ADD_LIST': {
      if (!state.currentBoard) return state;
      const updatedBoard = {
        ...state.currentBoard,
        lists: [...(state.currentBoard.lists || []), action.payload],
      };
      return {
        ...state,
        currentBoard: updatedBoard,
        boards: state.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        ),
      };
    }
    
    case 'UPDATE_LIST': {
      if (!state.currentBoard) return state;
      const boardWithUpdatedList = {
        ...state.currentBoard,
        lists: (state.currentBoard.lists || []).map(list =>
          list.id === action.payload.id ? action.payload : list
        ),
      };
      return {
        ...state,
        currentBoard: boardWithUpdatedList,
        boards: state.boards.map(board =>
          board.id === boardWithUpdatedList.id ? boardWithUpdatedList : board
        ),
      };
    }
    
    case 'DELETE_LIST': {
      if (!state.currentBoard) return state;
      const boardWithDeletedList = {
        ...state.currentBoard,
        lists: (state.currentBoard.lists || []).filter(list => list.id !== action.payload),
      };
      return {
        ...state,
        currentBoard: boardWithDeletedList,
        boards: state.boards.map(board =>
          board.id === boardWithDeletedList.id ? boardWithDeletedList : board
        ),
      };
    }
    
    case 'ADD_CARD': {
      if (!state.currentBoard) return state;
      const boardWithNewCard = {
        ...state.currentBoard,
        lists: (state.currentBoard.lists || []).map(list =>
          list.id === action.payload.list_id
            ? { ...list, cards: [...(list.cards || []), action.payload] }
            : list
        ),
      };
      return {
        ...state,
        currentBoard: boardWithNewCard,
        boards: state.boards.map(board =>
          board.id === boardWithNewCard.id ? boardWithNewCard : board
        ),
      };
    }
    
    case 'UPDATE_CARD': {
      if (!state.currentBoard) return state;
      const boardWithUpdatedCard = {
        ...state.currentBoard,
        lists: (state.currentBoard.lists || []).map(list => ({
          ...list,
          cards: (list.cards || []).map(card =>
            card.id === action.payload.id ? action.payload : card
          ),
        })),
      };
      return {
        ...state,
        currentBoard: boardWithUpdatedCard,
        boards: state.boards.map(board =>
          board.id === boardWithUpdatedCard.id ? boardWithUpdatedCard : board
        ),
      };
    }
    
    case 'DELETE_CARD': {
      if (!state.currentBoard) return state;
      const boardWithDeletedCard = {
        ...state.currentBoard,
        lists: (state.currentBoard.lists || []).map(list => ({
          ...list,
          cards: (list.cards || []).filter(card => card.id !== action.payload),
        })),
      };
      return {
        ...state,
        currentBoard: boardWithDeletedCard,
        boards: state.boards.map(board =>
          board.id === boardWithDeletedCard.id ? boardWithDeletedCard : board
        ),
      };
    }
    
    case 'MOVE_CARD': {
      if (!state.currentBoard) return state;
      const { cardId, sourceListId, destListId, newPosition } = action.payload;
      
      let cardToMove: Card | undefined;
      const boardWithMovedCard = {
        ...state.currentBoard,
        lists: (state.currentBoard.lists || []).map(list => {
          if (list.id === sourceListId) {
            cardToMove = list.cards?.find(card => card.id === cardId);
            return {
              ...list,
              cards: (list.cards || []).filter(card => card.id !== cardId),
            };
          }
          return list;
        }).map(list => {
          if (list.id === destListId && cardToMove) {
            const cards = [...(list.cards || [])];
            cards.splice(newPosition, 0, { ...cardToMove, list_id: destListId, position: newPosition });
            return { ...list, cards };
          }
          return list;
        }),
      };
      
      return {
        ...state,
        currentBoard: boardWithMovedCard,
        boards: state.boards.map(board =>
          board.id === boardWithMovedCard.id ? boardWithMovedCard : board
        ),
      };
    }
    
    case 'MOVE_LIST': {
      if (!state.currentBoard) return state;
      const { listId, newPosition } = action.payload;
      
      const lists = [...(state.currentBoard.lists || [])];
      const listIndex = lists.findIndex(list => list.id === listId);
      
      if (listIndex === -1) return state;
      
      const [movedList] = lists.splice(listIndex, 1);
      lists.splice(newPosition, 0, { ...movedList, position: newPosition });
      
      // Update positions for all affected lists
      const updatedLists = lists.map((list, index) => ({
        ...list,
        position: index + 1,
      }));
      
      const boardWithMovedList = {
        ...state.currentBoard,
        lists: updatedLists,
      };
      
      return {
        ...state,
        currentBoard: boardWithMovedList,
        boards: state.boards.map(board =>
          board.id === boardWithMovedList.id ? boardWithMovedList : board
        ),
      };
    }
    
    default:
      return state;
  }
}


export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  const actions = {
    loadBoards: useCallback(async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const boards = await boardAPI.getAll();
        dispatch({ type: 'SET_BOARDS', payload: boards });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load boards' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, []),

    loadBoard: useCallback(async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const board = await boardAPI.getById(id);
        dispatch({ type: 'SET_CURRENT_BOARD', payload: board });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load board' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, []),

    createBoard: useCallback(async (title: string, description?: string) => {
      try {
        const board = await boardAPI.create({ title, description });
        dispatch({ type: 'ADD_BOARD', payload: board });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create board' });
      }
    }, []),

    updateBoard: useCallback(async (id: string, title: string, description?: string) => {
      try {
        const board = await boardAPI.update(id, { title, description });
        dispatch({ type: 'UPDATE_BOARD', payload: board });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update board' });
      }
    }, []),

    deleteBoard: useCallback(async (id: string) => {
      try {
        await boardAPI.delete(id);
        dispatch({ type: 'DELETE_BOARD', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete board' });
      }
    }, []),

    createList: useCallback(async (title: string, boardId: string) => {
      try {
        const list = await listAPI.create({ title, board_id: boardId });
        dispatch({ type: 'ADD_LIST', payload: list });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create list' });
      }
    }, []),

    updateList: useCallback(async (id: string, title: string) => {
      try {
        const list = await listAPI.update(id, { title });
        dispatch({ type: 'UPDATE_LIST', payload: list });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update list' });
      }
    }, []),

    deleteList: useCallback(async (id: string) => {
      try {
        await listAPI.delete(id);
        dispatch({ type: 'DELETE_LIST', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete list' });
      }
    }, []),

    createCard: useCallback(async (title: string, listId: string, description?: string) => {
      try {
        const card = await cardAPI.create({ title, list_id: listId, description });
        dispatch({ type: 'ADD_CARD', payload: card });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create card' });
      }
    }, []),

    updateCard: useCallback(async (id: string, title: string, description?: string, reminderDate?: string | null, reminderEnabled?: boolean) => {
      try {
        const updateData: { title: string; description?: string; reminder_date?: string | null; reminder_enabled?: boolean } = { title, description };
        if (reminderDate !== undefined) updateData.reminder_date = reminderDate;
        if (reminderEnabled !== undefined) updateData.reminder_enabled = reminderEnabled;
        
        const card = await cardAPI.update(id, updateData);
        dispatch({ type: 'UPDATE_CARD', payload: card });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update card' });
      }
    }, []),

    deleteCard: useCallback(async (id: string) => {
      try {
        await cardAPI.delete(id);
        dispatch({ type: 'DELETE_CARD', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete card' });
      }
    }, []),

    moveCard: useCallback(async (cardId: string, sourceListId: string, destListId: string, newPosition: number) => {
      try {
        dispatch({ type: 'MOVE_CARD', payload: { cardId, sourceListId, destListId, newPosition } });
        
        await cardAPI.update(cardId, { list_id: destListId, position: newPosition });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to move card' });
      }
    }, []),

    moveList: useCallback(async (listId: string, newPosition: number) => {
      try {
        dispatch({ type: 'MOVE_LIST', payload: { listId, newPosition } });
        
        // Update list positions in the database
        const updates = state.currentBoard?.lists?.map((list, index) => ({
          id: list.id,
          position: index + 1,
        })) || [];
        
        await listAPI.updatePositions(updates);
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to move list' });
      }
    }, [state.currentBoard?.lists]),
  };

  return (
    <BoardContext.Provider value={{ state, actions }}>
      {children}
    </BoardContext.Provider>
  );
}

