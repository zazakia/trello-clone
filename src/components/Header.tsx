import { Search, Bell, HelpCircle, Grid3X3, ChevronDown } from 'lucide-react';

interface HeaderProps {
  boardTitle?: string;
}

export function Header({ boardTitle }: HeaderProps) {
  return (
    <header className="bg-purple-800 text-white px-4 py-2 border-b border-purple-700">
      <div className="flex items-center justify-between max-w-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5 text-purple-400" />
            <span className="text-lg font-semibold">Trello</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-purple-700 text-white placeholder-gray-300 pl-10 pr-4 py-2 rounded-lg border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-purple-500">
            Create
          </button>
          <button className="p-2 hover:bg-purple-700 rounded-lg transition-all duration-200">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-purple-700 rounded-lg transition-all duration-200">
            <HelpCircle className="h-5 w-5" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-medium border border-purple-500">
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