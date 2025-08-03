import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

// Custom hook for accessing notification context
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}