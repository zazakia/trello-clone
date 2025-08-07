import { useState, useRef, useEffect } from 'react';
import { Save, X, Tag, Book } from 'lucide-react';
import type { Notebook } from '../types';

interface QuickNoteCaptureProps {
  onSave: (title: string, content: string, tags?: string[], notebookId?: string) => void;
  onCancel: () => void;
  notebooks: Notebook[];
  defaultNotebook?: string;
  linkedCardId?: string;
  className?: string;
}

export function QuickNoteCapture({
  onSave,
  onCancel,
  notebooks,
  defaultNotebook,
  linkedCardId,
  className = ''
}: QuickNoteCaptureProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState(defaultNotebook || '');
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus on title input when component mounts
    titleRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    setSaving(true);
    try {
      await onSave(
        title.trim() || 'Quick Note',
        content.trim(),
        tags.length > 0 ? tags : undefined,
        selectedNotebook || undefined
      );
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    
    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tagName = tagInput.trim();
      
      if (tagName && !tags.includes(tagName)) {
        setTags(prev => [...prev, tagName]);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      setTags(prev => prev.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-800">Quick Note</h3>
          {linkedCardId && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Linked to card
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saving || (!title.trim() && !content.trim())}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <input
            ref={titleRef}
            type="text"
            placeholder="Note title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-lg font-medium text-gray-800 placeholder-gray-400 border-none outline-none bg-transparent"
          />
        </div>

        {/* Content */}
        <div>
          <textarea
            ref={contentRef}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={handleKeyDown}
            className="w-full resize-none border-none outline-none text-gray-700 placeholder-gray-400 leading-relaxed"
            style={{ minHeight: '120px' }}
          />
        </div>

        {/* Metadata */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {/* Notebook Selection */}
          <div className="flex items-center space-x-3">
            <Book className="w-4 h-4 text-gray-400" />
            <select
              value={selectedNotebook}
              onChange={(e) => setSelectedNotebook(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No notebook</option>
              {notebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id}>
                  {notebook.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="flex items-start space-x-3">
            <Tag className="w-4 h-4 text-gray-400 mt-1" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-1 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-20"
                />
              </div>
              <p className="text-xs text-gray-500">
                Press Enter or comma to add tags
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            <span className="font-medium">Shortcuts:</span> Ctrl+Enter to save, Escape to cancel
          </div>
          <div>
            {title.trim() || content.trim() ? (
              <span className="text-green-600">Ready to save</span>
            ) : (
              <span>Start typing to create your note</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}