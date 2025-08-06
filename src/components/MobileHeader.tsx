import React from 'react';
import { Menu, Search, Bell, Kanban } from 'lucide-react';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onToggleSidebar,
  className = ""
}) => {
  return (
    <header className={`
      fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-700 z-20
      flex items-center justify-between px-4
      ${className}
    `}>
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-300" />
        </button>
        
        <div className="flex items-center space-x-2">
          <Kanban className="w-6 h-6 text-blue-500" />
          <h1 className="text-lg font-semibold text-white">ProjectFlow</h1>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Search className="w-5 h-5 text-gray-400" />
        </button>
        
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
};