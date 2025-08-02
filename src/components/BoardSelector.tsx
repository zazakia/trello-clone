import { useEffect } from 'react';
import { useBoard } from '../hooks/useBoard';
import { AddButton } from './AddButton';
import { ConnectionTest } from './ConnectionTest';

interface BoardSelectorProps {
  onSelectBoard: (boardId: string) => void;
}

export function BoardSelector({ onSelectBoard }: BoardSelectorProps) {
  const { state, actions } = useBoard();
  const { boards, loading, error } = state;

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
          Your Boards
        </h1>
        <p className="text-gray-600 text-lg">Organize your projects and stay productive</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.map((board) => (
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
        
        <div className="group relative bg-gradient-to-br from-gray-100 to-gray-50 hover:from-purple-50 hover:to-pink-50 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-dashed border-gray-300 hover:border-purple-300">
          <AddButton
            onAdd={(title) => actions.createBoard(title)}
            placeholder="Enter board title..."
            buttonText="+ Create new board"
            className="h-full min-h-[140px] flex flex-col items-center justify-center text-gray-600 hover:text-purple-600"
          />
        </div>
      </div>
    </div>
  );
}