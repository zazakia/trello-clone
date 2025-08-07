import { useState, useEffect, useCallback, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Quote, Code, Image, Paperclip, Save, X } from 'lucide-react';
import type { Note, CreateNoteData, UpdateNoteData } from '../types';

interface NoteEditorProps {
  note?: Note;
  onSave: (data: CreateNoteData | UpdateNoteData) => Promise<void>;
  onCancel: () => void;
  linkedCardId?: string;
  notebookId?: string;
  className?: string;
}

interface EditorState {
  title: string;
  content: string;
  tags: string[];
  notebookId?: string;
}

export function NoteEditor({ 
  note, 
  onSave, 
  onCancel, 
  linkedCardId, 
  notebookId: defaultNotebookId,
  className = '' 
}: NoteEditorProps) {
  const [editorState, setEditorState] = useState<EditorState>({
    title: note?.title || '',
    content: extractPlainText(note?.content) || '',
    tags: note?.tags?.map(tag => tag.name) || [],
    notebookId: note?.notebookId || defaultNotebookId
  });
  
  const [saving, setSaving] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!editorState.title && !editorState.content) return;
    
    try {
      const saveData = {
        title: editorState.title || undefined,
        content: { text: editorState.content, type: 'plain' },
        notebookId: editorState.notebookId,
        tags: editorState.tags,
        ...(linkedCardId && { linkedCardId })
      };

      if (note) {
        await onSave(saveData as UpdateNoteData);
      } else {
        await onSave(saveData as CreateNoteData);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [editorState, note, onSave, linkedCardId]);

  // Trigger auto-save on content changes
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      autoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    setAutoSaveTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [editorState.content, editorState.title]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveData = {
        title: editorState.title || undefined,
        content: { text: editorState.content, type: 'plain' },
        notebookId: editorState.notebookId,
        tags: editorState.tags,
        ...(linkedCardId && { linkedCardId })
      };

      if (note) {
        await onSave(saveData as UpdateNoteData);
      } else {
        await onSave(saveData as CreateNoteData);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Ctrl/Cmd + Enter to save and close
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const formatText = (format: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      case 'ordered-list':
        formattedText = `1. ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    setEditorState(prev => ({ ...prev, content: newContent }));
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const tagName = input.value.trim();
      
      if (tagName && !editorState.tags.includes(tagName)) {
        setEditorState(prev => ({
          ...prev,
          tags: [...prev.tags, tagName]
        }));
        input.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditorState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          {saving && (
            <div className="flex items-center space-x-1 text-sm text-blue-600">
              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
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

      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-3 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => formatText('bold')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('italic')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('underline')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          onClick={() => formatText('list')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('ordered-list')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('quote')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('code')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Insert Image"
        >
          <Image className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Attach File"
        >
          <Paperclip className="w-4 h-4" />
        </button>
      </div>

      {/* Title Input */}
      <div className="p-4 border-b border-gray-200">
        <input
          ref={titleRef}
          type="text"
          placeholder="Note title..."
          value={editorState.title}
          onChange={(e) => setEditorState(prev => ({ ...prev, title: e.target.value }))}
          onKeyDown={handleKeyDown}
          className="w-full text-xl font-semibold text-gray-800 placeholder-gray-400 border-none outline-none bg-transparent"
        />
      </div>

      {/* Content Editor */}
      <div className="flex-1 p-4">
        <textarea
          ref={contentRef}
          placeholder="Start writing your note..."
          value={editorState.content}
          onChange={(e) => setEditorState(prev => ({ ...prev, content: e.target.value }))}
          onKeyDown={handleKeyDown}
          className="w-full h-full resize-none border-none outline-none text-gray-700 placeholder-gray-400 leading-relaxed"
          style={{ minHeight: '300px' }}
        />
      </div>

      {/* Tags and Metadata */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap items-center gap-2">
              {editorState.tags.map((tag, index) => (
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
                placeholder="Add tag..."
                onKeyDown={handleTagInput}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="text-xs text-gray-500">
            <span className="font-medium">Shortcuts:</span> Ctrl+S to save, Ctrl+Enter to save & close
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to extract plain text from note content
function extractPlainText(content: any): string {
  if (!content) return '';
  
  if (typeof content === 'string') return content;
  
  if (content.text) return content.text;
  
  if (content.blocks && Array.isArray(content.blocks)) {
    return content.blocks
      .map((block: any) => block.text || '')
      .join('\n');
  }
  
  return JSON.stringify(content);
}