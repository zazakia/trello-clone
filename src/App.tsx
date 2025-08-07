import { useState, useEffect } from 'react';
import { BoardProvider } from './contexts/BoardContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotesProvider } from './contexts/NotesContext';
import { useBoard } from './hooks/useBoard';
import { useSidebar } from './hooks/useSidebar';
import { useTheme } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { Sidebar, MobileSidebarOverlay } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { BoardSelector } from './components/BoardSelector';
import { Board } from './components/Board';
import { ReminderManager } from './components/ReminderManager';
import { ProjectAnalyticsDashboard } from './components/ProjectAnalyticsDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotesLayout } from './components/NotesLayout';
import ThemeSelector from './components/ThemeSelector';
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
      className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-500 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
      title={label}
    >
      <span className="text-lg">
        {icon}
      </span>
      <span className="text-xs font-medium mt-1 hidden md:block">
        {label}
      </span>
    </button>
  );
}

function AppContent() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'boards' | 'notes'>('boards');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { state, actions } = useBoard();
  const { currentBoard } = state;
  const sidebar = useSidebar();
  const { theme } = useTheme();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (sidebar.isMobile) {
      sidebar.close();
    }
  }, [selectedBoardId, sidebar.isMobile]);

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
    <div className={`min-h-screen flex ${theme === 'default' ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100' : theme === 'modern' ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' : 'bg-gray-900'}`}>
      <ReminderManager />

      {/* Mobile Header */}
      <MobileHeader 
        onToggleSidebar={sidebar.toggle}
        className="md:hidden"
      />

      {/* Black Sidebar */}
      <Sidebar
        isOpen={sidebar.isOpen}
        onToggle={sidebar.toggle}
        currentPath={window.location.pathname}
        user={{
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          role: 'Project Manager',
          workspace: 'Development Team',
          isOnline: true,
          permissions: ['view_analytics', 'manage_workspace', 'manage_billing'],
          teamSize: 12
        }}
        boards={state.boards}
        notifications={{
          total: 5,
          dashboard: 2,
          activity: 3,
          unreadMessages: 1
        }}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedBoardId(null);
        }}
      />

      {/* Mobile Overlay */}
      <MobileSidebarOverlay 
        isOpen={sidebar.isOpen && sidebar.isMobile}
        onClose={sidebar.close}
      />
      
      {/* Main Content Container */}
      <div className={`
        flex-1 flex flex-col min-h-screen transition-all duration-300
        ${sidebar.isMobile ? 'pt-16' : 'pt-0'}
        ${!sidebar.isMobile && sidebar.isOpen ? 'ml-72' : 'ml-0'}
      `}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(59,130,246,0.1),_transparent),radial-gradient(circle_at_70%_70%,_rgba(147,51,234,0.1),_transparent)] pointer-events-none" />
        
        {/* Header */}
        <div className="relative z-10">
          <Header
            boardTitle={selectedBoardId ? currentBoard?.title : undefined}
            onSearch={handleSearch}
            onCreateBoard={handleCreateBoard}
            onShowAnalytics={handleShowAnalytics}
            onShowReports={handleShowReports}
            showAnalyticsButton={!!selectedBoardId}
            onToggleSidebar={sidebar.toggle}
            showSidebarToggle={!sidebar.isMobile}
            themeSelector={<ThemeSelector />}
          />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 relative z-10 overflow-hidden">
        {currentView === 'notes' ? (
          <div className="h-full">
            <NotesLayout className="h-full" />
          </div>
        ) : selectedBoardId ? (
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
        
        {/* Floating Action Dock - Hidden on mobile */}
        {selectedBoardId && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 hidden md:block">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-3 shadow-lg border border-gray-200">
              <ActionButton icon="📋" label="Board" active />
              <ActionButton icon="📊" label="Analytics" onClick={handleShowAnalytics} />
              <div className="w-px h-6 bg-gray-200 mx-1" />
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
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <BoardProvider>
        <ErrorBoundary fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        }>
          <NotesProvider>
            <AppContent />
          </NotesProvider>
        </ErrorBoundary>
      </BoardProvider>
    </NotificationProvider>
  );
}

export default App;
