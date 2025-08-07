import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { NoteEditor } from '../NoteEditor';
import type { Note } from '../../types';

// Mock note data
const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: { text: 'Test content', type: 'plain' },
  plainText: 'Test content',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isShared: false,
  viewCount: 0,
  tags: [],
  attachments: [],
  linkedCards: []
};

describe('NoteEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with empty state for new note', () => {
    render(
      <NoteEditor
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('New Note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note title...')).toHaveValue('');
    expect(screen.getByPlaceholderText('Start writing your note...')).toHaveValue('');
  });

  it('renders with existing note data', () => {
    render(
      <NoteEditor
        note={mockNote}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    render(
      <NoteEditor
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByPlaceholderText('Note title...');
    const contentInput = screen.getByPlaceholderText('Start writing your note...');
    const saveButton = screen.getByText('Save');

    fireEvent.change(titleInput, { target: { value: 'New Note Title' } });
    fireEvent.change(contentInput, { target: { value: 'New note content' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Note Title',
        content: { text: 'New note content', type: 'plain' },
        tags: [],
        notebookId: undefined
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <NoteEditor
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles keyboard shortcuts', async () => {
    render(
      <NoteEditor
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByPlaceholderText('Note title...');
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    // Test Ctrl+S shortcut
    fireEvent.keyDown(titleInput, { key: 's', ctrlKey: true });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('adds and removes tags correctly', () => {
    render(
      <NoteEditor
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const tagInput = screen.getByPlaceholderText('Add tag...');
    
    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'test-tag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });

    expect(screen.getByText('test-tag')).toBeInTheDocument();

    // Remove the tag
    const removeButton = screen.getByRole('button', { name: /remove tag/i });
    fireEvent.click(removeButton);

    expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
  });

  it('shows saving state', async () => {
    const slowSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <NoteEditor
        onSave={slowSave}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByPlaceholderText('Note title...');
    const saveButton = screen.getByText('Save');

    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });
  });
});