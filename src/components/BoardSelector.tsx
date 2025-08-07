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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
          <div className="text-[var(--text-primary)] text-lg font-medium">Loading your boards...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="card p-6 border-[var(--error)]/40">
          <div className="text-[var(--error)] text-lg font-medium">Error: {error}</div>
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
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          {searchQuery ? `Search Results` : 'Your Boards'}
        </h1>
        <p className="text-[var(--text-tertiary)] text-lg">
          {searchQuery
            ? `Found ${filteredBoards.length} board${filteredBoards.length !== 1 ? 's' : ''} matching "${searchQuery}"`
            : 'Organize your projects and stay productive'
          }
        </p>
      </div>
      
      {showCreateBoard && (
        <div className="mb-8 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Create New Board</h3>
            <button
              onClick={handleCancelCreate}
              className="btn-secondary p-1"
              aria-label="Cancel create board"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-tertiary)] mb-2">Board Title *</label>
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="Enter board title..."
                className="input w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-tertiary)] mb-2">Description (optional)</label>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Add a description for your board..."
                className="input w-full resize-none"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateSubmit}
                disabled={!createTitle.trim()}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed px-6 py-2 font-medium"
              >
                Create Board
              </button>
              <button
                onClick={handleCancelCreate}
                className="btn-secondary px-4 py-2"
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
            className="card text-left p-6 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-3 line-clamp-2 text-[var(--text-primary)]">{board.title}</h3>
              {board.description && (
                <p className="text-[var(--text-secondary)] text-sm line-clamp-3 leading-relaxed">{board.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1 opacity-80">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-secondary)' }}></div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-tertiary)' }}></div>
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">Click to open</span>
              </div>
            </div>
          </button>
        ))}
        
        {!searchQuery && !showCreateBoard && (
          <div className="card border-dashed border-2 p-6">
            <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-[var(--text-tertiary)]">
              <Plus className="h-8 w-8 mb-2 text-[var(--accent-primary)]" />
              <span className="font-medium">Create new board</span>
              <span className="text-sm mt-1">Use the Create button above</span>
            </div>
          </div>
        )}
      </div>
      
      {searchQuery && filteredBoards.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No boards found</h3>
          <p className="text-[var(--text-secondary)]">Try adjusting your search terms or create a new board</p>
        </div>
      )}
    </div>
  );
}