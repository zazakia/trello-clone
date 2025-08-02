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
}

export function Card({ card, index, onUpdate, onDelete }: CardProps) {
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

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-3 group hover:shadow-lg transition-all duration-200 ${
            snapshot.isDragging ? 'rotate-2 shadow-xl scale-105' : ''
          }`}
        >
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a description..."
                className="w-full p-2 bg-white border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium text-gray-900 flex-1">{card.title}</h4>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => setShowReminderPicker(true)}
                    className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${
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
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDelete(card.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {card.description && (
                <p className="text-xs text-gray-600 mt-2">{card.description}</p>
              )}
              
              {/* Reminder indicator */}
              {card.reminder_enabled && card.reminder_date && (
                <div className="mt-2 flex items-center space-x-1 text-xs">
                  <Clock className="h-3 w-3 text-purple-500" />
                  <span className={`font-medium ${
                    new Date(card.reminder_date) < new Date() 
                      ? 'text-red-500' 
                      : 'text-purple-600'
                  }`}>
                    {formatReminderDate(card.reminder_date)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Reminder Picker Modal */}
          {showReminderPicker && (
            <ReminderPicker
              reminderDate={card.reminder_date}
              reminderEnabled={card.reminder_enabled}
              onSave={handleReminderSave}
              onClose={() => setShowReminderPicker(false)}
            />
          )}
        </div>
      )}
    </Draggable>
  );
}