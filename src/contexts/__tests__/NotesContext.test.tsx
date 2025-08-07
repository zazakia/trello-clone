import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { NotesProvider, useNotes } from '../NotesContext';
import * as supabaseApi from '../../utils/supabase-api';

// Mock the API
vi.mock('../../utils/supabase-api', () => ({
  notesAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
  },
  notebooksAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  tagsAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockNotesAPI = supabaseApi.notesAPI as any;
const mockNotebooksAPI = supabaseApi.notebooksAPI as any;
const mockTagsAPI = supabaseApi.tagsAPI as any;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotesProvider>{children}</NotesProvider>
);

describe('NotesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads notes successfully', async () => {
    const mockNotes = [
      {
        id: '1',
        title: 'Test Note',
        content: { text: 'Content' },
        plainText: 'Content',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isShared: false,
        viewCount: 0,
        tags: [],
        attachments: [],
        linkedCards: []
      }
    ];

    mockNotesAPI.getAll.mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes(), { wrapper });

    await act(async () => {
      await result.current.actions.loadNotes();
    });

    expect(result.current.state.notes).toEqual(mockNotes);
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.error).toBe(null);
  });

  it('handles note creation', async () => {
    const newNote = {
      id: '2',
      title: 'New Note',
      content: { text: 'New content' },
      plainText: 'New content',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isShared: false,
      viewCount: 0,
      tags: [],
      attachments: [],
      linkedCards: []
    };

    mockNotesAPI.create.mockResolvedValue(newNote);

    const { result } = renderHook(() => useNotes(), { wrapper });

    await act(async () => {
      await result.current.actions.createNote({
        title: 'New Note',
        content: { text: 'New content' }
      });
    });

    expect(result.current.state.notes).toContain(newNote);
    expect(mockNotesAPI.create).toHaveBeenCalledWith({
      title: 'New Note',
      content: { text: 'New content' }
    });
  });

  it('handles note deletion', async () => {
    const initialNotes = [
      {
        id: '1',
        title: 'Note to delete',
        content: { text: 'Content' },
        plainText: 'Content',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        isShared: false,
        viewCount: 0,
        tags: [],
        attachments: [],
        linkedCards: []
      }
    ];

    mockNotesAPI.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotes(), { wrapper });

    // Set initial state
    act(() => {
      result.current.state.notes = initialNotes;
    });

    await act(async () => {
      await result.current.actions.deleteNote('1');
    });

    expect(result.current.state.notes).toHaveLength(0);
    expect(mockNotesAPI.delete).toHaveBeenCalledWith('1');
  });

  it('handles search functionality', async () => {
    const searchResults = [
      {
        note: {
          id: '1',
          title: 'Search Result',
          content: { text: 'Matching content' },
          plainText: 'Matching content',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          isShared: false,
          viewCount: 0,
          tags: [],
          attachments: [],
          linkedCards: []
        },
        highlights: ['Matching content'],
        relevanceScore: 10
      }
    ];

    mockNotesAPI.search.mockResolvedValue(searchResults);

    const { result } = renderHook(() => useNotes(), { wrapper });

    await act(async () => {
      await result.current.actions.searchNotes('test query');
    });

    expect(result.current.state.searchResults).toEqual(searchResults);
    expect(result.current.state.searchQuery).toBe('test query');
    expect(mockNotesAPI.search).toHaveBeenCalledWith('test query', undefined);
  });

  it('handles errors gracefully', async () => {
    const errorMessage = 'Failed to load notes';
    mockNotesAPI.getAll.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useNotes(), { wrapper });

    await act(async () => {
      await result.current.actions.loadNotes();
    });

    expect(result.current.state.error).toBe(errorMessage);
    expect(result.current.state.loading).toBe(false);
  });

  it('manages notebooks correctly', async () => {
    const mockNotebooks = [
      {
        id: '1',
        name: 'Test Notebook',
        description: 'Test description',
        color: '#3B82F6',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        noteCount: 0
      }
    ];

    mockNotebooksAPI.getAll.mockResolvedValue(mockNotebooks);

    const { result } = renderHook(() => useNotes(), { wrapper });

    await act(async () => {
      await result.current.actions.loadNotebooks();
    });

    expect(result.current.state.notebooks).toEqual(mockNotebooks);
  });
});