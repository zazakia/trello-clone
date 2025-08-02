import { useEffect, useState, useMemo } from 'react';
import { useBoard } from '../hooks/useBoard';
import { ConnectionTest } from './ConnectionTest';
import { Search, Plus, X } from 'lucide-react';

interface BoardSelectorProps {
  onSelectBoard: (boardId: string) => void;
  searchQuery?: string;
  showCreateBoard?: boolean;
  onCreateBoard?: (title: string, description?: string) => void;
  onCancelCreate?: () => void;
}

export function BoardSelector({ 
  onSelectBoard, 
  searchQuery = '',
  showCreateBoard = false,
  onCreateBoard,
  onCancelCreate
}: BoardSelectorProps) {
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const { state, actions } = useBoard();
  const { boards, loading, error } = state;

  // Filter boards based on search query
  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) return boards;
    
    const query = searchQuery.toLowerCase();
    return boards.filter(board => 
      board.title.toLowerCase().includes(query) ||
      (board.description && board.description.toLowerCase().includes(query))
    );
  }, [boards, searchQuery]);

  const handleCreateSubmit = () => {
    if (createTitle.trim()) {
      onCreateBoard?.(createTitle.trim(), createDescription.trim() || undefined);
      setCreateTitle('');
      setCreateDescription('');
    }
  };

  const handleCancelCreate = () => {
    setCreateTitle('');
    setCreateDescription('');
    onCancelCreate?.();
  };

  useEffect(() => {
    actions.loadBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="text-gray-600 text-lg font-medium">Loading your boards...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="text-red-600 text-lg font-medium">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-6">
        <ConnectionTest />
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          {searchQuery ? `Search Results` : 'Your Boards'}
        </h1>
        <p className="text-gray-600 text-lg">
          {searchQuery 
            ? `Found ${filteredBoards.length} board${filteredBoards.length !== 1 ? 's' : ''} matching "${searchQuery}"`
            : 'Organize your projects and stay productive'
          }
        </p>
      </div>
      
      {showCreateBoard && (
        <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Board</h3>
            <button
              onClick={handleCancelCreate}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Board Title *</label>
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="Enter board title..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Add a description for your board..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateSubmit}
                disabled={!createTitle.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Board
              </button>
              <button
                onClick={handleCancelCreate}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBoards.map((board) => (
          <button
            key={board.id}
            onClick={() => onSelectBoard(board.id)}
            className="group relative bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-3 line-clamp-2">{board.title}</h3>
              {board.description && (
                <p className="text-white text-sm line-clamp-3 leading-relaxed">{board.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-200 group-hover:text-white transition-colors">Click to open</span>
              </div>
            </div>
          </button>
        ))}
        
        {!searchQuery && !showCreateBoard && (
          <div className="group relative bg-gradient-to-br from-gray-100 to-gray-50 hover:from-purple-50 hover:to-pink-50 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-dashed border-gray-300 hover:border-purple-300">
            <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-gray-600 hover:text-purple-600 p-6">
              <Plus className="h-8 w-8 mb-2" />
              <span className="font-medium">Create new board</span>
              <span className="text-sm text-gray-500 mt-1">Use the Create button above</span>
            </div>
          </div>
        )}
      </div>
      
      {searchQuery && filteredBoards.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No boards found</h3>
          <p className="text-gray-600">Try adjusting your search terms or create a new board</p>
        </div>
      )}
    </div>
  );
}