import { useState } from 'react';
import { BoardProvider } from './contexts/BoardContext';
import { useBoard } from './hooks/useBoard';
import { Header } from './components/Header';
import { BoardSelector } from './components/BoardSelector';
import { Board } from './components/Board';
import { ReminderManager } from './components/ReminderManager';

function AppContent() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const { state } = useBoard();
  const { currentBoard } = state;

  const handleSelectBoard = (boardId: string) => {
    setSelectedBoardId(boardId);
  };

  const handleBackToBoards = () => {
    setSelectedBoardId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-900">
      <ReminderManager />
      <Header boardTitle={selectedBoardId ? currentBoard?.title : undefined} />
        <main className="h-[calc(100vh-64px)] relative">
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
              <Board boardId={selectedBoardId} />
            </div>
          ) : (
            <div className="bg-white h-full overflow-y-auto">
              <BoardSelector onSelectBoard={handleSelectBoard} />
            </div>
          )}
          
          {selectedBoardId && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4">
              <div className="flex items-center space-x-4 bg-purple-800 rounded-lg px-6 py-3">
                <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <span className="text-sm">📥</span>
                  <span className="text-sm">Inbox</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <span className="text-sm">📅</span>
                  <span className="text-sm">Planner</span>
                </button>
                <button className="flex items-center space-x-2 text-blue-400 border-b-2 border-blue-400 pb-1">
                  <span className="text-sm">📋</span>
                  <span className="text-sm font-medium">Board</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <span className="text-sm">🔄</span>
                  <span className="text-sm">Switch boards</span>
                </button>
              </div>
            </div>
          )}
        </main>
    </div>
  );
}

function App() {
  return (
    <BoardProvider>
      <AppContent />
    </BoardProvider>
  );
}

export default App;
