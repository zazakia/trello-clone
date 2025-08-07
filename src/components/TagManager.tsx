import { useState } from 'react';
import { Tag, Plus, X, Hash } from 'lucide-react';
import type { Tag as TagType } from '../types';

interface TagManagerProps {
  availableTags: TagType[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onTagCreate: (name: string, color?: string) => void;
  className?: string;
}

const TAG_COLORS = [
  '#6B7280', // Gray
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export function TagManager({
  availableTags,
  selectedTags,
  onTagsChange,
  onTagCreate,
  className = ''
}: TagManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim() && !availableTags.some(tag => tag.name === newTagName.trim())) {
      onTagCreate(newTagName.trim(), newTagColor);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setShowCreateForm(false);
    }
  };

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tagName = searchQuery.trim();
      
      if (tagName && !selectedTags.includes(tagName)) {
        // Check if tag exists
        const existingTag = availableTags.find(tag => tag.name === tagName);
        if (existingTag) {
          onTagsChange([...selectedTags, tagName]);
        } else {
          // Create new tag
          onTagCreate(tagName);
          onTagsChange([...selectedTags, tagName]);
        }
        setSearchQuery('');
      }
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Tags</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title="Create new tag"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add Input */}
        <div className="relative">
          <Hash className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search or create tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleQuickAdd}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-2">Selected Tags</div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tagName) => {
              const tag = availableTags.find(t => t.name === tagName);
              return (
                <span
                  key={tagName}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag?.color || TAG_COLORS[0] }}
                >
                  {tagName}
                  <button
                    onClick={() => handleTagToggle(tagName)}
                    className="ml-1 text-white hover:text-gray-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleCreateTag} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Color</div>
              <div className="flex space-x-1">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      newTagColor === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={!newTagName.trim()}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Tag
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTagName('');
                  setNewTagColor(TAG_COLORS[0]);
                }}
                className="flex-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Available Tags */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {filteredTags.length > 0 ? (
          <div className="space-y-1">
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.name)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${
                  selectedTags.includes(tag.name)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{tag.usageCount}</span>
                  {selectedTags.includes(tag.name) && (
                    <X className="w-3 h-3 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Tag className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {searchQuery ? 'No matching tags found' : 'No tags available'}
            </p>
            {searchQuery && (
              <p className="text-xs mt-1">
                Press Enter to create "{searchQuery}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}