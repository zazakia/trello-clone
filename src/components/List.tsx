import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Edit2, Trash2, X, Check, GripVertical } from 'lucide-react';
import type { List as ListType } from '../types';
import { Card } from './Card';
import { AddButton } from './AddButton';

interface ListProps {
  list: ListType;
  index: number;
  onUpdateList: (id: string, title: string) => void;
  onDeleteList: (id: string) => void;
  onCreateCard: (title: string, listId: string) => void;
  onUpdateCard: (id: string, title: string, description?: string) => void;
  onDeleteCard: (id: string) => void;
  searchQuery?: string;
}

export function List({
  list,
  index,
  onUpdateList,
  onDeleteList,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  searchQuery = '',
}: ListProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleSaveTitle = () => {
    if (title.trim()) {
      onUpdateList(list.id, title.trim());
      setIsEditingTitle(false);
    }
  };

  const handleCancelTitle = () => {
    setTitle(list.title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelTitle();
    }
  };

  const sortedCards = (list.cards || []).sort((a, b) => a.position - b.position);
  
  // Filter cards based on search query
  const filteredCards = sortedCards.filter(card => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return card.title.toLowerCase().includes(query) ||
           (card.description && card.description.toLowerCase().includes(query));
  });
  
  // Check if list title matches search
  const listMatches = !searchQuery.trim() || list.title.toLowerCase().includes(searchQuery.toLowerCase());
  
  // Show list if it matches search OR has matching cards
  const shouldShowList = listMatches || filteredCards.length > 0;

  if (!shouldShowList && searchQuery.trim()) {
    return null;
  }

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-gray-100 rounded-lg p-4 w-72 flex-shrink-0 shadow-lg border border-gray-200 transition-all duration-200 ${
            snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing hover:bg-gray-200 p-2 -m-2 rounded transition-colors" {...provided.dragHandleProps}>
            {isEditingTitle ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 p-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelTitle}
                  className="p-2 text-gray-500 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2 flex-1">
                  <GripVertical className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-800 text-sm">{list.title}</h3>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </button>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-6 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[120px] z-20">
                        <button
                          onClick={() => {
                            setIsEditingTitle(true);
                            setShowMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            onDeleteList(list.id);
                            setShowMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <Droppable droppableId={list.id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[4px] transition-all duration-200 ${
                  snapshot.isDraggingOver ? 'bg-blue-500/20 rounded-lg p-1' : ''
                }`}
              >
                {(searchQuery ? filteredCards : sortedCards).map((card, cardIndex) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    onUpdate={onUpdateCard}
                    onDelete={onDeleteCard}
                    searchQuery={searchQuery}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <AddButton
            onAdd={(title) => onCreateCard(title, list.id)}
            placeholder="Enter a title for this card..."
            buttonText="+ Add a card"
            className="mt-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
          />
        </div>
      )}
    </Draggable>
  );
}