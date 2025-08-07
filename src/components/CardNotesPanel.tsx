import { useState } from 'react';
import { Plus, FileText, Link, Unlink, Calendar, Tag, Search } from 'lucide-react';
import type { Note } from '../types';

interface CardNotesPanelProps {
  cardId: string;
  linkedNotes: Note[];
  onLinkNote: (noteId: string) => void;
  onUnlinkNote: (noteId: string) => void;
  onCreateLinkedNote: () => void;
  availableNotes?: Note[];
  className?: string;
}

export function CardNotesPanel({
  cardId,
  linkedNotes,
  onLinkNote,
  onUnlinkNote,
  onCreateLinkedNote,
  availableNotes = [],
  className = ''
}: CardNotesPanelProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPreviewText = (note: Note) => {
    const text = note.plainText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  const filteredAvailableNotes = availableNotes.filter(note => 
    !linkedNotes.some(linked => linked.id === note.id) &&
    (note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     note.plainText?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">
            Linked Notes ({linkedNotes.length})
          </h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onCreateLinkedNote}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Create new note"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowLinkDialog(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Link existing note"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Linked Notes List */}
      <div className="max-h-64 overflow-y-auto">
        {linkedNotes.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {linkedNotes.map((note) => (
              <div key={note.id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {note.title || 'Untitled'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {getPreviewText(note)}
                    </p>
                    
                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(note.updatedAt)}</span>
                      </div>
                      {note.attachments && note.attachments.length > 0 && (
                        <span>{note.attachments.length} files</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onUnlinkNote(note.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Unlink note"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium mb-1">No linked notes</p>
            <p className="text-xs">Create or link notes to keep related information together</p>
          </div>
        )}
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Link Existing Note</h3>
              <button
                onClick={() => {
                  setShowLinkDialog(false);
                  setSearchQuery('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-5 h-5 transform rotate-45" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Available Notes */}
            <div className="max-h-64 overflow-y-auto">
              {filteredAvailableNotes.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredAvailableNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        onLinkNote(note.id);
                        setShowLinkDialog(false);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {note.title || 'Untitled'}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {getPreviewText(note)}
                          </p>
                          
                          {/* Tags */}
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {note.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {note.tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{note.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(note.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    {searchQuery ? 'No matching notes found' : 'No notes available to link'}
                  </p>
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {filteredAvailableNotes.length} notes available
                </p>
                <button
                  onClick={() => {
                    setShowLinkDialog(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}