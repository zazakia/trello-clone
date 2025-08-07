import { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from 'react';
import type { 
  Note, 
  Notebook, 
  Tag, 
  CreateNoteData, 
  UpdateNoteData, 
  CreateNotebookData, 
  UpdateNotebookData,
  SearchFilters,
  SearchResult
} from '../types';
import { notesAPI, notebooksAPI, tagsAPI } from '../utils/supabase-api';

// State interface
interface NotesState {
  notes: Note[];
  notebooks: Notebook[];
  tags: Tag[];
  currentNote: Note | null;
  currentNotebook: Notebook | null;
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  searchFilters: SearchFilters;
}

// Action types
type NotesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_NOTEBOOKS'; payload: Notebook[] }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'SET_CURRENT_NOTE'; payload: Note | null }
  | { type: 'SET_CURRENT_NOTEBOOK'; payload: Notebook | null }
  | { type: 'SET_SEARCH_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_FILTERS'; payload: SearchFilters }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_NOTEBOOK'; payload: Notebook }
  | { type: 'UPDATE_NOTEBOOK'; payload: Notebook }
  | { type: 'DELETE_NOTEBOOK'; payload: string }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: string };

// Initial state
const initialState: NotesState = {
  notes: [],
  notebooks: [],
  tags: [],
  currentNote: null,
  currentNotebook: null,
  searchResults: [],
  loading: false,
  error: null,
  searchQuery: '',
  searchFilters: {}
};

// Reducer
function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    
    case 'SET_NOTEBOOKS':
      return { ...state, notebooks: action.payload };
    
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    
    case 'SET_CURRENT_NOTE':
      return { ...state, currentNote: action.payload };
    
    case 'SET_CURRENT_NOTEBOOK':
      return { ...state, currentNotebook: action.payload };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SEARCH_FILTERS':
      return { ...state, searchFilters: action.payload };
    
    case 'ADD_NOTE':
      return { 
        ...state, 
        notes: [action.payload, ...state.notes],
        notebooks: state.notebooks.map(nb => 
          nb.id === action.payload.notebookId 
            ? { ...nb, noteCount: nb.noteCount + 1 }
            : nb
        )
      };
    
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        ),
        currentNote: state.currentNote?.id === action.payload.id ? action.payload : state.currentNote
      };
    
    case 'DELETE_NOTE':
      const deletedNote = state.notes.find(note => note.id === action.payload);
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        currentNote: state.currentNote?.id === action.payload ? null : state.currentNote,
        notebooks: state.notebooks.map(nb => 
          nb.id === deletedNote?.notebookId 
            ? { ...nb, noteCount: Math.max(0, nb.noteCount - 1) }
            : nb
        )
      };
    
    case 'ADD_NOTEBOOK':
      return { ...state, notebooks: [...state.notebooks, action.payload] };
    
    case 'UPDATE_NOTEBOOK':
      return {
        ...state,
        notebooks: state.notebooks.map(notebook =>
          notebook.id === action.payload.id ? action.payload : notebook
        ),
        currentNotebook: state.currentNotebook?.id === action.payload.id ? action.payload : state.currentNotebook
      };
    
    case 'DELETE_NOTEBOOK':
      return {
        ...state,
        notebooks: state.notebooks.filter(notebook => notebook.id !== action.payload),
        currentNotebook: state.currentNotebook?.id === action.payload ? null : state.currentNotebook,
        notes: state.notes.map(note => 
          note.notebookId === action.payload 
            ? { ...note, notebookId: undefined }
            : note
        )
      };
    
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload),
        notes: state.notes.map(note => ({
          ...note,
          tags: note.tags?.filter(tag => tag.id !== action.payload)
        }))
      };
    
    default:
      return state;
  }
}

// Context interface
interface NotesContextType {
  state: NotesState;
  actions: {
    // Data loading
    loadNotes: () => Promise<void>;
    loadNotebooks: () => Promise<void>;
    loadTags: () => Promise<void>;
    loadNote: (id: string) => Promise<void>;
    loadNotebook: (id: string) => Promise<void>;
    
    // Notes CRUD
    createNote: (noteData: CreateNoteData) => Promise<void>;
    updateNote: (id: string, updates: UpdateNoteData) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    
    // Notebooks CRUD
    createNotebook: (notebookData: CreateNotebookData) => Promise<void>;
    updateNotebook: (id: string, updates: UpdateNotebookData) => Promise<void>;
    deleteNotebook: (id: string) => Promise<void>;
    
    // Tags
    createTag: (name: string, color?: string) => Promise<void>;
    deleteTag: (id: string) => Promise<void>;
    
    // Search
    searchNotes: (query: string, filters?: SearchFilters) => Promise<void>;
    setSearchQuery: (query: string) => void;
    setSearchFilters: (filters: SearchFilters) => void;
    clearSearch: () => void;
    
    // Note linking
    linkNoteToCard: (noteId: string, cardId: string) => Promise<void>;
    unlinkNoteFromCard: (noteId: string, cardId: string) => Promise<void>;
    
    // UI state
    setCurrentNote: (note: Note | null) => void;
    setCurrentNotebook: (notebook: Notebook | null) => void;
  };
}

// Create context
const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Provider component
export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  const actions = useMemo(() => ({
    // Data loading
    loadNotes: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const notes = await notesAPI.getAll();
        dispatch({ type: 'SET_NOTES', payload: notes });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Failed to load notes:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load notes';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    loadNotebooks: async () => {
      try {
        const notebooks = await notebooksAPI.getAll();
        dispatch({ type: 'SET_NOTEBOOKS', payload: notebooks });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Failed to load notebooks:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load notebooks';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    },

    loadTags: async () => {
      try {
        const tags = await tagsAPI.getAll();
        dispatch({ type: 'SET_TAGS', payload: tags });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Failed to load tags:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load tags';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    },

    loadNote: async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const note = await notesAPI.getById(id);
        dispatch({ type: 'SET_CURRENT_NOTE', payload: note });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load note' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    loadNotebook: async (id: string) => {
      try {
        const notebook = await notebooksAPI.getById(id);
        dispatch({ type: 'SET_CURRENT_NOTEBOOK', payload: notebook });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load notebook' });
      }
    },

    // Notes CRUD
    createNote: async (noteData: CreateNoteData) => {
      try {
        const note = await notesAPI.create(noteData);
        dispatch({ type: 'ADD_NOTE', payload: note });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create note' });
      }
    },

    updateNote: async (id: string, updates: UpdateNoteData) => {
      try {
        const note = await notesAPI.update(id, updates);
        dispatch({ type: 'UPDATE_NOTE', payload: note });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update note' });
      }
    },

    deleteNote: async (id: string) => {
      try {
        await notesAPI.delete(id);
        dispatch({ type: 'DELETE_NOTE', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete note' });
      }
    },

    // Notebooks CRUD
    createNotebook: async (notebookData: CreateNotebookData) => {
      try {
        const notebook = await notebooksAPI.create(notebookData);
        dispatch({ type: 'ADD_NOTEBOOK', payload: notebook });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create notebook' });
      }
    },

    updateNotebook: async (id: string, updates: UpdateNotebookData) => {
      try {
        const notebook = await notebooksAPI.update(id, updates);
        dispatch({ type: 'UPDATE_NOTEBOOK', payload: notebook });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update notebook' });
      }
    },

    deleteNotebook: async (id: string) => {
      try {
        await notebooksAPI.delete(id);
        dispatch({ type: 'DELETE_NOTEBOOK', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete notebook' });
      }
    },

    // Tags
    createTag: async (name: string, color?: string) => {
      try {
        const tag = await tagsAPI.create({ name, color });
        dispatch({ type: 'ADD_TAG', payload: tag });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create tag' });
      }
    },

    deleteTag: async (id: string) => {
      try {
        await tagsAPI.delete(id);
        dispatch({ type: 'DELETE_TAG', payload: id });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete tag' });
      }
    },

    // Search
    searchNotes: async (query: string, filters?: SearchFilters) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const results = await notesAPI.search(query, filters);
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        if (filters) {
          dispatch({ type: 'SET_SEARCH_FILTERS', payload: filters });
        }
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Search failed' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    setSearchQuery: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },

    setSearchFilters: (filters: SearchFilters) => {
      dispatch({ type: 'SET_SEARCH_FILTERS', payload: filters });
    },

    clearSearch: () => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
      dispatch({ type: 'SET_SEARCH_FILTERS', payload: {} });
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
    },

    // Note linking
    linkNoteToCard: async (noteId: string, cardId: string) => {
      try {
        await notesAPI.linkToCard(noteId, cardId);
        // Reload the note to get updated linked cards
        const note = await notesAPI.getById(noteId);
        dispatch({ type: 'UPDATE_NOTE', payload: note });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to link note to card' });
      }
    },

    unlinkNoteFromCard: async (noteId: string, cardId: string) => {
      try {
        await notesAPI.unlinkFromCard(noteId, cardId);
        // Reload the note to get updated linked cards
        const note = await notesAPI.getById(noteId);
        dispatch({ type: 'UPDATE_NOTE', payload: note });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to unlink note from card' });
      }
    },

    // UI state
    setCurrentNote: (note: Note | null) => {
      dispatch({ type: 'SET_CURRENT_NOTE', payload: note });
    },

    setCurrentNotebook: (notebook: Notebook | null) => {
      dispatch({ type: 'SET_CURRENT_NOTEBOOK', payload: notebook });
    }
  }), []); // Empty dependency array since dispatch is stable

  return (
    <NotesContext.Provider value={{ state, actions }}>
      {children}
    </NotesContext.Provider>
  );
}

// Hook to use notes context
export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}