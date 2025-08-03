import { useState } from 'react';
import { BoardProvider } from './contexts/BoardContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useBoard } from './hooks/useBoard';
import { Header } from './components/Header';
import { BoardSelector } from './components/BoardSelector';
import { Board } from './components/Board';
import { ReminderManager } from './components/ReminderManager';
import { ProjectAnalyticsDashboard } from './components/ProjectAnalyticsDashboard';
import type { Project } from './types';

function AppContent() {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-900">
      <ReminderManager />
      <Header 
        boardTitle={selectedBoardId ? currentBoard?.title : undefined}
        onSearch={handleSearch}
        onCreateBoard={handleCreateBoard}
        onShowAnalytics={handleShowAnalytics}
        showAnalyticsButton={!!selectedBoardId}
      />
        <main className="h-[calc(100vh-73px)] relative">
          {selectedBoardId ? (
            <div className="h-full">
              <div className="p-4">
                <button
                  onClick={handleBackToBoards}
                  className="inline-flex items-center space-x-2 text-white hover:text-gray-200 bg-purple-700 hover:bg-purple-600 px-3 py-1.5 rounded-md text-sm transition-all duration-200"
                >
                  <span>←</span>
                  <span>Back to boards</span>
                </button>
              </div>
              <Board boardId={selectedBoardId} searchQuery={searchQuery} />
            </div>
          ) : (
            <div className="bg-white h-full overflow-y-auto">
              <BoardSelector 
                onSelectBoard={handleSelectBoard} 
                searchQuery={searchQuery}
                showCreateBoard={showCreateBoard}
                onCreateBoard={handleCreateBoardSubmit}
                onCancelCreate={() => setShowCreateBoard(false)}
              />
            </div>
          )}
          
          {selectedBoardId && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-sm sm:max-w-none sm:w-auto px-4 sm:px-0">
              <div className="flex items-center justify-center space-x-2 sm:space-x-4 bg-purple-800 rounded-lg px-3 sm:px-6 py-3 shadow-lg border border-purple-700">
                <button 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  title="Inbox"
                >
                  <span className="text-sm">📥</span>
                  <span className="text-sm hidden sm:inline">Inbox</span>
                </button>
                <button 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  title="Planner"
                >
                  <span className="text-sm">📅</span>
                  <span className="text-sm hidden sm:inline">Planner</span>
                </button>
                <button 
                  className="flex items-center space-x-2 text-blue-400 border-b-2 border-blue-400 pb-1"
                  title="Current: Board View"
                >
                  <span className="text-sm">📋</span>
                  <span className="text-sm font-medium hidden sm:inline">Board</span>
                </button>
                <button 
                  onClick={handleBackToBoards}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  title="Switch boards"
                >
                  <span className="text-sm">🔄</span>
                  <span className="text-sm hidden sm:inline">Switch</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Analytics Dashboard */}
          {showAnalytics && currentBoard && (
            <ProjectAnalyticsDashboard 
              project={currentBoard as Project}
              onClose={handleCloseAnalytics}
            />
          )}
        </main>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <BoardProvider>
        <AppContent />
      </BoardProvider>
    </NotificationProvider>
  );
}

export default App;
