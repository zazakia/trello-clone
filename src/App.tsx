import { useState } from 'react';
import { BoardProvider } from './contexts/BoardContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useBoard } from './hooks/useBoard';
import { Header } from './components/Header';
import { BoardSelector } from './components/BoardSelector';
import { Board } from './components/Board';
import { ReminderManager } from './components/ReminderManager';
import { ProjectAnalyticsDashboard } from './components/ProjectAnalyticsDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { Project } from './types';

// Modern Action Button Component
interface ActionButtonProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function ActionButton({ icon, label, active = false, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-t from-blue-500 to-blue-400 text-white shadow-md' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`}
      title={label}
    >
      <span className={`text-lg transition-transform group-hover:scale-110 ${active ? 'filter drop-shadow-sm' : ''}`}>
        {icon}
      </span>
      <span className={`text-xs font-medium ${active ? 'text-white' : 'text-slate-500'} hidden sm:block`}>
        {label}
      </span>
    </button>
  );
}

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

  const handleShowReports = () => {
    // Open the SPECS.md file or documentation
    window.open('/SPECS.md', '_blank');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(59,130,246,0.1),_transparent),radial-gradient(circle_at_70%_70%,_rgba(147,51,234,0.1),_transparent)] pointer-events-none" />
      
      <ReminderManager />
      
      {/* Modern Glass Header */}
      <div className="relative z-50">
        <Header 
          boardTitle={selectedBoardId ? currentBoard?.title : undefined}
          onSearch={handleSearch}
          onCreateBoard={handleCreateBoard}
          onShowAnalytics={handleShowAnalytics}
          onShowReports={handleShowReports}
          showAnalyticsButton={!!selectedBoardId}
        />
      </div>
      
      {/* Main Content Area */}
      <main className="relative z-10 h-[calc(100vh-80px)] overflow-hidden">
        {selectedBoardId ? (
          <div className="h-full flex flex-col">
            {/* Breadcrumb Navigation */}
            <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-white/20">
              <nav className="flex items-center space-x-4">
                <button
                  onClick={handleBackToBoards}
                  className="group inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white/90 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md border border-white/40"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>All Boards</span>
                </button>
                <div className="text-slate-400">/</div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                  <span className="text-slate-700 font-medium">{currentBoard?.title || 'Current Board'}</span>
                </div>
              </nav>
            </div>
            
            {/* Board Content */}
            <div className="flex-1 relative">
              <Board boardId={selectedBoardId} searchQuery={searchQuery} />
            </div>
          </div>
        ) : (
          <div className="h-full bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm">
            <BoardSelector 
              onSelectBoard={handleSelectBoard} 
              searchQuery={searchQuery}
              showCreateBoard={showCreateBoard}
              onCreateBoard={handleCreateBoardSubmit}
              onCancelCreate={() => setShowCreateBoard(false)}
            />
          </div>
        )}
        
        {/* Floating Action Dock */}
        {selectedBoardId && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
              <ActionButton icon="📥" label="Inbox" />
              <ActionButton icon="📅" label="Calendar" />
              <ActionButton icon="📋" label="Board" active />
              <ActionButton icon="📊" label="Analytics" onClick={handleShowAnalytics} />
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <ActionButton 
                icon="🏠" 
                label="Home" 
                onClick={handleBackToBoards}
              />
            </div>
          </div>
        )}
        
        {/* Analytics Dashboard Modal */}
        {showAnalytics && currentBoard && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <ErrorBoundary fallback={
              <div className="bg-white rounded-3xl p-8 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Analytics Unavailable</h3>
                <p className="text-slate-600 mb-4">The analytics dashboard encountered an error. This might be because the board doesn't have complete project data.</p>
                <button 
                  onClick={handleCloseAnalytics}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
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
