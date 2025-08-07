import { useState } from 'react';
import { Search, Grid, List, Calendar, Tag, Trash2, Edit, Link, MoreVertical } from 'lucide-react';
import type { Note, SearchFilters } from '../types';

interface NotesListProps {
  notes: Note[];
  selectedNoteId?: string;
  onNoteSelect: (noteId: string) => void;
  onNoteDelete: (noteId: string) => void;
  onNoteEdit: (noteId: string) => void;
  viewMode?: 'list' | 'grid' | 'compact';
  searchQuery?: string;
  filterBy?: SearchFilters;
  className?: string;
}

export function NotesList({
  notes,
  selectedNoteId,
  onNoteSelect,
  onNoteDelete,
  onNoteEdit,
  viewMode = 'list',
  searchQuery = '',
  filterBy = {},
  className = ''
}: NotesListProps) {
  const [showActions, setShowActions] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getPreviewText = (note: Note) => {
    const text = note.plainText || '';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const handleActionClick = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    setShowActions(showActions === noteId ? null : noteId);
  };

  if (notes.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 text-gray-500 ${className}`}>
        <Search className="w-12 h-12 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No notes found</h3>
        <p className="text-sm text-center">
          {searchQuery ? 'Try adjusting your search terms' : 'Create your first note to get started'}
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onNoteSelect(note.id)}
            className={`relative bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedNoteId === note.id 
                ? 'border-blue-500 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Actions Menu */}
            <div className="absolute top-2 right-2">
              <button
                onClick={(e) => handleActionClick(e, note.id)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              {showActions === note.id && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNoteEdit(note.id);
                      setShowActions(null);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNoteDelete(note.id);
                      setShowActions(null);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Note Content */}
            <div className="pr-8">
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {highlightText(note.title || 'Untitled', searchQuery)}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {highlightText(getPreviewText(note), searchQuery)}
              </p>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{note.tags.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(note.updatedAt)}</span>
                <div className="flex items-center space-x-2">
                  {note.linkedCards && note.linkedCards.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Link className="w-3 h-3" />
                      <span>{note.linkedCards.length}</span>
                    </div>
                  )}
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{note.attachments.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === 'compact') {
    return (
      <div className={`space-y-1 ${className}`}>
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onNoteSelect(note.id)}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
              selectedNoteId === note.id 
                ? 'bg-blue-50 border-l-4 border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate">
                {highlightText(note.title || 'Untitled', searchQuery)}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {formatDate(note.updatedAt)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-2">
              {note.linkedCards && note.linkedCards.length > 0 && (
                <Link className="w-3 h-3 text-gray-400" />
              )}
              {note.tags && note.tags.length > 0 && (
                <Tag className="w-3 h-3 text-gray-400" />
              )}
              <button
                onClick={(e) => handleActionClick(e, note.id)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <MoreVertical className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default list view
  return (
    <div className={`space-y-2 ${className}`}>
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onNoteSelect(note.id)}
          className={`relative bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-sm ${
            selectedNoteId === note.id 
              ? 'border-blue-500 shadow-sm' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Actions Menu */}
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => handleActionClick(e, note.id)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {showActions === note.id && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNoteEdit(note.id);
                    setShowActions(null);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNoteDelete(note.id);
                    setShowActions(null);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Note Content */}
          <div className="pr-8">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 line-clamp-1">
                {highlightText(note.title || 'Untitled', searchQuery)}
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {highlightText(getPreviewText(note), searchQuery)}
            </p>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDate(note.updatedAt)}</span>
              <div className="flex items-center space-x-3">
                {note.linkedCards && note.linkedCards.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Link className="w-3 h-3" />
                    <span>{note.linkedCards.length} linked</span>
                  </div>
                )}
                {note.attachments && note.attachments.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{note.attachments.length} files</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}