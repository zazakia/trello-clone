import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Grid, List, Search, Filter, BookOpen, AlertCircle } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { useNotesHealth } from '../hooks/useNotesHealth';
import { NotebookSidebar } from './NotebookSidebar';
import { NotesList } from './NotesList';
import { NoteEditor } from './NoteEditor';
import { NoteSearch } from './NoteSearch';
import { QuickNoteCapture } from './QuickNoteCapture';
import type { SearchFilters } from '../types';

interface NotesLayoutProps {
  className?: string;
}

type ViewMode = 'list' | 'grid' | 'compact';

export function NotesLayout({ className = '' }: NotesLayoutProps) {
  const { state, actions } = useNotes();
  const { isHealthy, error: healthError, instructions, loading: healthLoading, retry: retryHealth } = useNotesHealth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showEditor, setShowEditor] = useState(false);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | undefined>();

  // Load initial data only if database is healthy
  useEffect(() => {
    if (isHealthy) {
      actions.loadNotes();
      actions.loadNotebooks();
      actions.loadTags();
    }
  }, [isHealthy, actions]);

  // Filter notes based on selected notebook (memoized for performance)
  const displayNotes = useMemo(() => {
    return selectedNotebookId 
      ? state.notes.filter(note => note.notebookId === selectedNotebookId)
      : state.notes;
  }, [state.notes, selectedNotebookId]);

  const handleSearch = useCallback((query: string, filters: SearchFilters) => {
    if (query || Object.keys(filters).length > 0) {
      actions.searchNotes(query, filters);
    } else {
      actions.clearSearch();
    }
  }, [actions]);

  const handleNoteSelect = useCallback((noteId: string) => {
    actions.loadNote(noteId);
    setEditingNoteId(noteId);
    setShowEditor(true);
  }, [actions]);

  const handleNoteEdit = useCallback((noteId: string) => {
    setEditingNoteId(noteId);
    setShowEditor(true);
  }, []);

  const handleNoteDelete = useCallback(async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await actions.deleteNote(noteId);
    }
  }, [actions]);

  const handleCreateNote = () => {
    setEditingNoteId(null);
    setShowEditor(true);
  };

  const handleQuickCapture = () => {
    setShowQuickCapture(true);
  };

  const handleNoteSave = async (data: any) => {
    try {
      if (editingNoteId) {
        await actions.updateNote(editingNoteId, data);
      } else {
        await actions.createNote({
          ...data,
          notebookId: selectedNotebookId
        });
      }
      setShowEditor(false);
      setEditingNoteId(null);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleQuickNoteSave = async (title: string, content: string, tags?: string[], notebookId?: string) => {
    try {
      await actions.createNote({
        title,
        content: { text: content, type: 'plain' },
        tags,
        notebookId
      });
      setShowQuickCapture(false);
    } catch (error) {
      console.error('Failed to save quick note:', error);
    }
  };

  const handleNotebookSelect = (notebookId: string | undefined) => {
    setSelectedNotebookId(notebookId);
    if (notebookId) {
      actions.loadNotebook(notebookId);
    }
  };

  const handleNotebookCreate = async (name: string, description?: string, color?: string) => {
    await actions.createNotebook({ name, description, color });
  };

  const handleNotebookEdit = async (id: string, updates: any) => {
    await actions.updateNotebook(id, updates);
  };

  const handleNotebookDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this notebook? Notes will be moved to "Uncategorized".')) {
      await actions.deleteNotebook(id);
      if (selectedNotebookId === id) {
        setSelectedNotebookId(undefined);
      }
    }
  };

  // Show health check loading or error
  if (healthLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing notes system...</p>
        </div>
      </div>
    );
  }

  if (!isHealthy && healthError) {
    return (
      <div className={`flex items-center justify-center h-full p-6 ${className}`}>
        <div className="text-center max-w-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes System Setup Required</h3>
          <p className="text-gray-600 mb-4">
            The notes database tables need to be created before you can use the notes system.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-700 font-medium">Error: {healthError}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4 text-left">
            <h4 className="font-medium text-gray-900 mb-2">Setup Instructions:</h4>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
              {instructions}
            </pre>
          </div>

          <div className="space-y-2">
            <button
              onClick={retryHealth}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Check Again
            </button>
            <p className="text-xs text-gray-500">
              After running the migration, click "Check Again" to verify the setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div className={`h-full ${className}`}>
        <NoteEditor
          note={editingNoteId ? state.currentNote : undefined}
          onSave={handleNoteSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingNoteId(null);
          }}
          notebookId={selectedNotebookId}
          className="h-full"
        />
      </div>
    );
  }

  return (
    <div className={`flex h-full bg-gray-50 ${className}`}>
      {/* Sidebar - Hidden on mobile, shown as overlay */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <NotebookSidebar
          notebooks={state.notebooks}
          selectedNotebookId={selectedNotebookId}
          onNotebookSelect={handleNotebookSelect}
          onNotebookCreate={handleNotebookCreate}
          onNotebookEdit={handleNotebookEdit}
          onNotebookDelete={handleNotebookDelete}
          className="h-full"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-gray-400" />
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedNotebookId 
                  ? state.currentNotebook?.name || 'Notebook'
                  : 'All Notes'
                }
              </h1>
              <span className="text-sm text-gray-500">
                ({displayNotes.length} notes)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle - Hidden on mobile */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'compact' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Compact view"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleQuickCapture}
                className="hidden sm:block px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Quick Note
              </button>
              <button
                onClick={handleCreateNote}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Note</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <NoteSearch
            onSearch={handleSearch}
            notebooks={state.notebooks}
            tags={state.tags}
            recentSearches={[]} // TODO: Implement recent searches
            searchSuggestions={[]} // TODO: Implement search suggestions
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {state.loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notes...</p>
              </div>
            </div>
          ) : state.error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error loading notes</p>
                <p className="text-sm text-gray-500">{state.error}</p>
                <button
                  onClick={() => actions.loadNotes()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <NotesList
              notes={state.searchQuery ? state.searchResults.map(r => r.note) : displayNotes}
              onNoteSelect={handleNoteSelect}
              onNoteDelete={handleNoteDelete}
              onNoteEdit={handleNoteEdit}
              viewMode={viewMode}
              searchQuery={state.searchQuery}
              filterBy={state.searchFilters}
            />
          )}
        </div>
      </div>

      {/* Quick Capture Modal */}
      {showQuickCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <QuickNoteCapture
              onSave={handleQuickNoteSave}
              onCancel={() => setShowQuickCapture(false)}
              notebooks={state.notebooks}
              defaultNotebook={selectedNotebookId}
            />
          </div>
        </div>
      )}
    </div>
  );
}