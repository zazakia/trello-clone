import { useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { notificationService } from '../services/notificationService';
import type { Card, List, Board } from '../types';

export function useBoardNotifications() {
  const { actions: notificationActions } = useNotifications();

  const notifyCardCreated = useCallback((card: Card, list: List, board: Board) => {
    const notification = notificationService.createBoardActivityNotification('card_created', {
      cardTitle: card.title,
      listTitle: list.title,
      boardTitle: board.title,
      boardId: board.id,
      cardId: card.id,
      listId: list.id,
    });
    notificationActions.addNotification(notification);
  }, [notificationActions]);

  const notifyCardMoved = useCallback((card: Card, fromList: List, toList: List, board: Board) => {
    if (fromList.id !== toList.id) {
      const notification = notificationService.createBoardActivityNotification('card_moved', {
        cardTitle: card.title,
        listTitle: toList.title,
        boardTitle: board.title,
        boardId: board.id,
        cardId: card.id,
        listId: toList.id,
      });
      notificationActions.addNotification(notification);
    }
  }, [notificationActions]);

  const notifyCardUpdated = useCallback((card: Card, board: Board) => {
    const notification = notificationService.createBoardActivityNotification('card_updated', {
      cardTitle: card.title,
      boardTitle: board.title,
      boardId: board.id,
      cardId: card.id,
    });
    notificationActions.addNotification(notification);
  }, [notificationActions]);

  const notifyListCreated = useCallback((list: List, board: Board) => {
    const notification = notificationService.createBoardActivityNotification('list_created', {
      listTitle: list.title,
      boardTitle: board.title,
      boardId: board.id,
      listId: list.id,
    });
    notificationActions.addNotification(notification);
  }, [notificationActions]);

  const notifyListMoved = useCallback((list: List, board: Board) => {
    const notification = notificationService.createBoardActivityNotification('list_moved', {
      listTitle: list.title,
      boardTitle: board.title,
      boardId: board.id,
      listId: list.id,
    });
    notificationActions.addNotification(notification);
  }, [notificationActions]);

  const notifyWelcome = useCallback(() => {
    const notification = notificationService.createSystemNotification(
      '👋 Welcome to Trello Clone!',
      'Get started by creating your first board and organizing your tasks.',
      'medium'
    );
    notificationActions.addNotification(notification);
  }, [notificationActions]);

  return {
    notifyCardCreated,
    notifyCardMoved,
    notifyCardUpdated,
    notifyListCreated,
    notifyListMoved,
    notifyWelcome,
  };
}