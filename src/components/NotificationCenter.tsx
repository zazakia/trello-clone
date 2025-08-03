import { useState, useMemo } from 'react';
import { 
  Bell, 
  BellOff, 
  X, 
  Check, 
  Clock, 
  Settings, 
  MoreHorizontal,
  AlertCircle,
  Info,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import type { AppNotification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { state, actions } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'reminders'>('all');
  const [showSettings, setShowSettings] = useState(false);

  const filteredNotifications = useMemo(() => {
    let filtered = state.notifications.filter((n: AppNotification) => !n.dismissedAt);

    // Filter out snoozed notifications that aren't due yet
    const now = new Date();
    filtered = filtered.filter((n: AppNotification) => !n.snoozedUntil || new Date(n.snoozedUntil) <= now);

    switch (filter) {
      case 'unread':
        return filtered.filter((n: AppNotification) => !n.readAt);
      case 'reminders':
        return filtered.filter((n: AppNotification) => n.type === 'reminder');
      default:
        return filtered;
    }
  }, [state.notifications, filter]);

  const getNotificationIcon = (notification: AppNotification) => {
    switch (notification.type) {
      case 'reminder':
        return <Clock className="h-4 w-4 text-purple-600" />;
      case 'system':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'board_activity':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'mention':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSnooze = (id: string, minutes: number) => {
    actions.snoozeNotification(id, minutes);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end pt-16 pr-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-96 max-h-[80vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {state.unreadCount > 0 && (
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                {state.unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 p-3 border-b border-gray-100">
          {(['all', 'unread', 'reminders'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
          {state.unreadCount > 0 && (
            <button
              onClick={actions.markAllAsRead}
              className="ml-auto text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Settings</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={state.settings.reminderNotifications}
                  onChange={(e) => actions.updateSettings({ reminderNotifications: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Reminder notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={state.settings.boardActivityNotifications}
                  onChange={(e) => actions.updateSettings({ boardActivityNotifications: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Board activity</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={state.settings.browserNotifications}
                  onChange={(e) => actions.updateSettings({ browserNotifications: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Browser notifications</span>
              </label>
            </div>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <BellOff className="h-8 w-8 mb-2" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification: AppNotification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={actions.markAsRead}
                  onDismiss={actions.dismissNotification}
                  onSnooze={handleSnooze}
                  formatDate={formatDate}
                  getIcon={getNotificationIcon}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  formatDate: (date: string) => string;
  getIcon: (notification: AppNotification) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
}

function NotificationItem({
  notification,
  onMarkRead,
  onDismiss,
  onSnooze,
  formatDate,
  getIcon,
  getPriorityColor,
}: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`p-4 hover:bg-gray-50 border-l-4 ${getPriorityColor(notification.priority)} ${
        !notification.readAt ? 'bg-purple-50/30' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!notification.readAt ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              {notification.metadata?.cardTitle && (
                <p className="text-xs text-purple-600 mt-1 font-medium">
                  Card: {notification.metadata.cardTitle}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-20">
                    {!notification.readAt && (
                      <button
                        onClick={() => {
                          onMarkRead(notification.id);
                          setShowActions(false);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Check className="h-3 w-3" />
                        <span>Mark read</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSnooze(notification.id, 15);
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Clock className="h-3 w-3" />
                      <span>Snooze 15m</span>
                    </button>
                    <button
                      onClick={() => {
                        onSnooze(notification.id, 60);
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Calendar className="h-3 w-3" />
                      <span>Snooze 1h</span>
                    </button>
                    <button
                      onClick={() => {
                        onDismiss(notification.id);
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}