import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Edit2, Trash2, X, Check, Bell, BellOff, Clock } from 'lucide-react';
import type { Card as CardType } from '../types';
import { ReminderPicker } from './ReminderPicker';

interface CardProps {
  card: CardType;
  index: number;
  onUpdate: (id: string, title: string, description?: string, reminderDate?: string | null, reminderEnabled?: boolean) => void;
  onDelete: (id: string) => void;
  searchQuery?: string;
}

export function Card({ card, index, onUpdate, onDelete, searchQuery = '' }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(card.id, title.trim(), description.trim() || undefined);
      setIsEditing(false);
    }
  };

  const handleReminderSave = (reminderDate: string | null, enabled: boolean) => {
    onUpdate(card.id, card.title, card.description, reminderDate, enabled);
  };

  const formatReminderDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return 'Overdue';
    } else if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleCancel = () => {
    setTitle(card.title);
    setDescription(card.description || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Function to highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 px-1 py-0.5 rounded font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative card rounded border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
            snapshot.isDragging ? 'rotate-1 shadow-lg scale-105 ring-2 ring-blue-500/30 z-50' : ''
          }`}
        >
          {/* Card Accent Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          
          <div className="p-4">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 font-medium"
                  autoFocus
                  placeholder="Card title..."
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a description (optional)..."
                  className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Press Enter to save, Esc to cancel
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium text-gray-900 flex-1">
                  {highlightText(card.title, searchQuery)}
                </h4>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowReminderPicker(true)}
                    className={`p-1 hover:bg-gray-100 rounded transition-colors ${
                      card.reminder_enabled && card.reminder_date
                        ? 'text-purple-600'
                        : 'text-gray-400 hover:text-purple-600'
                    }`}
                    title="Set reminder"
                  >
                    {card.reminder_enabled && card.reminder_date ? (
                      <Bell className="h-3 w-3" />
                    ) : (
                      <BellOff className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDelete(card.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
                {/* Card Description */}
                {card.description && (
                  <div className="bg-gray-50 rounded p-2 mt-2">
                    <p className="text-sm text-gray-600">
                      {highlightText(card.description, searchQuery)}
                    </p>
                  </div>
                )}

                {/* Reminder Badge */}
                {card.reminder_enabled && card.reminder_date && (
                  <div className="flex items-center mt-2">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${
                      new Date(card.reminder_date) < new Date()
                        ? 'bg-red-100 text-red-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      <Clock className="h-3 w-3" />
                      <span>{formatReminderDate(card.reminder_date)}</span>
                    </div>
                  </div>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(card.created_at || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>
          )}
          
            {/* Reminder Picker Modal */}
            {showReminderPicker && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <ReminderPicker
                  reminderDate={card.reminder_date}
                  reminderEnabled={card.reminder_enabled}
                  onSave={handleReminderSave}
                  onClose={() => setShowReminderPicker(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}