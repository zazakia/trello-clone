import { useState } from 'react';
import { BoardProvider } from './contexts/BoardContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useBoard } from './hooks/useBoard';
import { StandardLayout } from './components/StandardLayout';
import { BoardSelector } from './components/BoardSelector';
import { Board } from './components/Board';
import { ReminderManager } from './components/ReminderManager';
import { ProjectAnalyticsDashboard } from './components/ProjectAnalyticsDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Plus, BarChart3, ArrowLeft } from 'lucide-react';
import type { Project } from './types';

// Import reset styles
import './styles/reset.css';

function AppContentStandard() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { state, actions } = useBoard();
  const { currentBoard } = state;

  const handleSelectBoard = (boardId: string) => {
    setSelectedBoardId(boardId);
  };

  const handleBackToBoards = () => {
    setSelectedBoardId(null);
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateBoard = () => {
    setShowCreateBoard(true);
  };

  const handleShowAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleCloseAnalytics = () => {
    setShowAnalytics(false);
  };

  const handleCreateBoardSubmit = async (title: string, description?: string) => {
    try {
      await actions.createBoard(title, description);
      setShowCreateBoard(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  return (
    <StandardLayout>
      <ReminderManager />
      
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            {selectedBoardId && (
              <button
                onClick={handleBackToBoards}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Boards
              </button>
            )}
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {selectedBoardId
                  ? currentBoard?.title || 'Board View'
                  : searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : 'Your Boards'
                }
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {selectedBoardId
                  ? 'Manage your project tasks and workflows'
                  : 'Organize your projects and stay productive'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {selectedBoardId && (
              <button
                onClick={handleShowAnalytics}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
            )}
            
            {!selectedBoardId && (
              <button
                onClick={handleCreateBoard}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Board
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {!selectedBoardId && (
          <div className="mt-6">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded border border-gray-200 min-h-96">
        {selectedBoardId ? (
          <div className="h-full">
            <Board boardId={selectedBoardId} searchQuery={searchQuery} />
          </div>
        ) : (
          <div className="p-4">
            <BoardSelector
              onSelectBoard={handleSelectBoard}
              searchQuery={searchQuery}
              showCreateBoard={showCreateBoard}
              onCreateBoard={handleCreateBoardSubmit}
              onCancelCreate={() => setShowCreateBoard(false)}
            />
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && currentBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-hidden">
            <ErrorBoundary fallback={
              <div className="p-6 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Analytics Unavailable</h3>
                <p className="text-gray-600 mb-4">
                  The analytics dashboard encountered an error. This might be because the board doesn't have complete project data.
                </p>
                <button
                  onClick={handleCloseAnalytics}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            }>
              <ProjectAnalyticsDashboard
                project={currentBoard as Project}
                onClose={handleCloseAnalytics}
              />
            </ErrorBoundary>
          </div>
        </div>
      )}
    </StandardLayout>
  );
}

function AppStandard() {
  return (
    <NotificationProvider>
      <BoardProvider>
        <AppContentStandard />
      </BoardProvider>
    </NotificationProvider>
  );
}

export default AppStandard;