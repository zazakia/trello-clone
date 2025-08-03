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
        <mark key={index} className="bg-gradient-to-r from-yellow-200 to-amber-200 text-slate-900 px-1.5 py-0.5 rounded-lg font-medium">
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
          className={`group relative bg-white/95 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
            snapshot.isDragging ? 'rotate-1 shadow-2xl scale-105 ring-4 ring-blue-500/20 z-50' : 'hover:scale-[1.02]'
          }`}
        >
          {/* Card Accent Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-60" />
          
          <div className="p-5">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400 font-semibold shadow-sm"
                  autoFocus
                  placeholder="Card title..."
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a description (optional)..."
                  className="w-full p-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400 shadow-sm"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500 font-medium">
                    Press Enter to save, Esc to cancel
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
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
                {/* Card Description */}
                {card.description && (
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {highlightText(card.description, searchQuery)}
                    </p>
                  </div>
                )}

                {/* Reminder Badge */}
                {card.reminder_enabled && card.reminder_date && (
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                      new Date(card.reminder_date) < new Date() 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}>
                      <Clock className="h-3 w-3" />
                      <span>{formatReminderDate(card.reminder_date)}</span>
                    </div>
                  </div>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Task</span>
                  </div>
                  <div className="text-xs text-slate-400">
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