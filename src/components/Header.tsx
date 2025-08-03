import { useState } from 'react';
import { Search, Bell, HelpCircle, Grid3X3, ChevronDown, X, BarChart3, FileText } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  boardTitle?: string;
  onSearch?: (query: string) => void;
  onCreateBoard?: () => void;
  onShowAnalytics?: () => void;
  onShowReports?: () => void;
  showAnalyticsButton?: boolean;
}

export function Header({ boardTitle, onSearch, onCreateBoard, onShowAnalytics, onShowReports, showAnalyticsButton = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { state: notificationState } = useNotifications();

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
    <header className="relative bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10" />
      
      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo Section */}
          <div className="flex items-center space-x-6 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Grid3X3 className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  ProjectFlow
                </span>
                <span className="text-xs text-slate-500 -mt-1">Enterprise Suite</span>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className={`flex-1 max-w-md mx-8 transition-all duration-300 ${isSearchExpanded ? 'max-w-lg scale-105' : ''}`}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-sm group-focus-within:blur-md transition-all duration-300" />
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search across all projects..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchExpanded(true)}
                  onBlur={() => setIsSearchExpanded(false)}
                  className="w-full bg-transparent text-slate-700 placeholder-slate-400 pl-12 pr-12 py-3 rounded-2xl border-none focus:outline-none focus:ring-0 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {showAnalyticsButton && (
              <button 
                onClick={onShowAnalytics}
                className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-400/50 flex items-center space-x-2 overflow-hidden"
                title="Project Analytics"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <BarChart3 className="h-4 w-4 relative z-10" />
                <span className="hidden sm:inline relative z-10">Analytics</span>
              </button>
            )}
            
            <button 
              onClick={onShowReports}
              className="group relative bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-indigo-400/50 overflow-hidden"
              title="Reports & Documentation"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FileText className="h-4 w-4 relative z-10 sm:mr-2" />
              <span className="hidden sm:inline relative z-10">Reports</span>
            </button>
            
            <button 
              onClick={onCreateBoard}
              className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-purple-400/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Create</span>
            </button>
            
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white/90 hover:bg-white/95 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/40 group"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
              {notificationState.unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse border-2 border-white">
                  {notificationState.unreadCount > 9 ? '9+' : notificationState.unreadCount}
                </div>
              )}
            </button>
            
            <button 
              className="p-3 bg-white/90 hover:bg-white/95 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/40 group"
              title="Help & Support"
            >
              <HelpCircle className="h-5 w-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
            </button>
            
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white/40">
              <span className="bg-gradient-to-br from-white/20 to-transparent bg-clip-text text-transparent filter drop-shadow-sm">
                PM
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {boardTitle && (
        <div className="relative px-6 py-3 border-t border-white/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-sm" />
                <span className="text-lg font-bold text-slate-800">{boardTitle}</span>
                <button className="group flex items-center space-x-1 text-slate-500 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-white/50">
                  <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}