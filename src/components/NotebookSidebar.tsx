import { useState } from 'react';
import { Plus, Book, Edit, Trash2, MoreVertical, Search } from 'lucide-react';
import type { Notebook } from '../types';

interface NotebookSidebarProps {
  notebooks: Notebook[];
  selectedNotebookId?: string;
  onNotebookSelect: (notebookId: string | undefined) => void;
  onNotebookCreate: (name: string, description?: string, color?: string) => void;
  onNotebookEdit: (id: string, updates: { name?: string; description?: string; color?: string }) => void;
  onNotebookDelete: (id: string) => void;
  className?: string;
}

const NOTEBOOK_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

export function NotebookSidebar({
  notebooks,
  selectedNotebookId,
  onNotebookSelect,
  onNotebookCreate,
  onNotebookEdit,
  onNotebookDelete,
  className = ''
}: NotebookSidebarProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: NOTEBOOK_COLORS[0]
  });

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onNotebookCreate(formData.name.trim(), formData.description || undefined, formData.color);
      setFormData({ name: '', description: '', color: NOTEBOOK_COLORS[0] });
      setShowCreateForm(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent, notebookId: string) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onNotebookEdit(notebookId, {
        name: formData.name.trim(),
        description: formData.description || undefined,
        color: formData.color
      });
      setEditingNotebook(null);
      setFormData({ name: '', description: '', color: NOTEBOOK_COLORS[0] });
    }
  };

  const startEdit = (notebook: Notebook) => {
    setFormData({
      name: notebook.name,
      description: notebook.description || '',
      color: notebook.color
    });
    setEditingNotebook(notebook.id);
    setShowActions(null);
  };

  const cancelEdit = () => {
    setEditingNotebook(null);
    setFormData({ name: '', description: '', color: NOTEBOOK_COLORS[0] });
  };

  return (
    <div className={`bg-white border-r border-gray-200 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Notebooks</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title="Create notebook"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* All Notes Option */}
      <div className="p-2">
        <button
          onClick={() => onNotebookSelect(undefined)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
            !selectedNotebookId 
              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Book className="w-4 h-4" />
          <div className="flex-1">
            <div className="font-medium">All Notes</div>
            <div className="text-xs text-gray-500">
              {notebooks.reduce((total, nb) => total + nb.noteCount, 0)} notes
            </div>
          </div>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleCreateSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Notebook name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <div className="flex space-x-1">
                {NOTEBOOK_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ name: '', description: '', color: NOTEBOOK_COLORS[0] });
                }}
                className="flex-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notebooks List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredNotebooks.map((notebook) => (
            <div key={notebook.id} className="relative">
              {editingNotebook === notebook.id ? (
                <div className="p-2 bg-gray-50 rounded-md">
                  <form onSubmit={(e) => handleEditSubmit(e, notebook.id)} className="space-y-2">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex space-x-1">
                      {NOTEBOOK_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`w-4 h-4 rounded-full border ${
                            formData.color === color ? 'border-gray-400' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        type="submit"
                        className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors group cursor-pointer ${
                    selectedNotebookId === notebook.id 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    onClick={() => onNotebookSelect(notebook.id)}
                    className="flex items-center space-x-3 flex-1 min-w-0"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: notebook.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{notebook.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {notebook.noteCount} notes
                        {notebook.description && ` • ${notebook.description}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(showActions === notebook.id ? null : notebook.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Actions Menu */}
              {showActions === notebook.id && (
                <div className="absolute right-2 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-24">
                  <button
                    onClick={() => startEdit(notebook)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onNotebookDelete(notebook.id);
                      setShowActions(null);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredNotebooks.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-500">
            <Book className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notebooks found</p>
          </div>
        )}
      </div>
    </div>
  );
}