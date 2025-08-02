import { useState } from 'react';
import { Search, Bell, HelpCircle, Grid3X3, ChevronDown, X } from 'lucide-react';

interface HeaderProps {
  boardTitle?: string;
  onSearch?: (query: string) => void;
  onCreateBoard?: () => void;
}

export function Header({ boardTitle, onSearch, onCreateBoard }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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
    <header className="bg-purple-800 text-white px-4 py-3 border-b border-purple-700 relative z-10">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5 text-purple-400" />
            <span className="text-lg font-semibold">Trello</span>
          </div>
        </div>

        <div className={`flex-1 max-w-sm sm:max-w-md mx-2 sm:mx-4 transition-all duration-200 ${isSearchExpanded ? 'max-w-lg' : ''}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search cards, lists, and boards..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchExpanded(true)}
              onBlur={() => setIsSearchExpanded(false)}
              className="w-full bg-purple-700 text-white placeholder-gray-300 pl-10 pr-10 py-2 rounded-lg border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-purple-600 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button 
            onClick={onCreateBoard}
            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 border border-purple-500 text-sm whitespace-nowrap"
          >
            Create
          </button>
          <button 
            className="p-2 hover:bg-purple-700 rounded-lg transition-all duration-200"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button 
            className="p-2 hover:bg-purple-700 rounded-lg transition-all duration-200"
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-medium border border-purple-500 cursor-pointer hover:scale-105 transition-transform">
            U
          </div>
        </div>
      </div>

      {boardTitle && (
        <div className="mt-2 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">{boardTitle}</span>
            <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}