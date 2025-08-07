import { useState } from 'react';
import { Search, Bell, HelpCircle, Grid3X3, X, BarChart3, FileText, Menu, Sparkles } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationCenter } from './NotificationCenter';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  boardTitle?: string;
  onSearch?: (query: string) => void;
  onCreateBoard?: () => void;
  onShowAnalytics?: () => void;
  onShowReports?: () => void;
  onToggleSidebar?: () => void;
  showAnalyticsButton?: boolean;
  showSidebarToggle?: boolean;
  themeSelector?: React.ReactNode;
}

const themeOrder = ['default','modern','dark','pastel','neoglass'] as const;

export function Header({
  boardTitle,
  onSearch,
  onCreateBoard,
  onShowAnalytics,
  onShowReports,
  onToggleSidebar,
  showAnalyticsButton = false,
  showSidebarToggle = false,
  themeSelector
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { state: notificationState } = useNotifications();
  const { theme, setTheme } = useTheme();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
  };
  return (
    <header className="header border-b shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section with Sidebar Toggle */}
          <div className="flex items-center space-x-4">
            {showSidebarToggle && (
              <button
                onClick={onToggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle Sidebar"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Grid3X3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">ProjectFlow</span>
            </div>
          </div>

          {/* Search Section */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search across all projects..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {showAnalyticsButton && (
              <button
                onClick={onShowAnalytics}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                title="Project Analytics"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
            )}
            
            <button
              onClick={onShowReports}
              className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              title="Reports & Documentation"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </button>
            
            <button
              onClick={onCreateBoard}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Create
            </button>
            
            {themeSelector && (
              <div className="hidden md:flex items-center gap-2">
                {themeSelector}
                {/* Compact Theme Switch - cycles themes */}
                <button
                  onClick={() => {
                    const idx = themeOrder.findIndex(t => t === theme);
                    const next = themeOrder[(idx + 1) % themeOrder.length];
                    setTheme(next as any);
                  }}
                  className="btn-secondary p-2 rounded-lg"
                  title={`Switch theme (current: ${theme})`}
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationState.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {notificationState.unreadCount > 9 ? '9+' : notificationState.unreadCount}
                </div>
              )}
            </button>
            
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Help & Support"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold text-white cursor-pointer">
              PM
            </div>
          </div>
        </div>
      </div>
      
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {boardTitle && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-800">{boardTitle}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}