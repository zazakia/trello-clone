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
          className={`relative group w-80 flex-shrink-0 transition-all duration-300 ${
            snapshot.isDragging ? 'rotate-1 scale-105 z-50' : ''
          }`}
        >
          {/* List Card Background */}
          <div className={`relative list rounded border shadow-sm transition-all duration-300 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500/30' : 'hover:shadow-md'
          }`}>
            
            {/* Header with Drag Handle */}
            <div className="flex items-center justify-between p-4 pb-2" {...provided.dragHandleProps}>
              <div className="flex items-center space-x-2 flex-1">
                <div className="p-1 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                  <GripVertical className="h-4 w-4" />
                </div>
                
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 font-medium"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelTitle}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-1">
                    <h3 className="font-medium text-gray-800">{list.title}</h3>
                    <div className="flex items-center space-x-1">
                      <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                        {filteredCards.length}
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {showMenu && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-20">
                              <button
                                onClick={() => {
                                  setIsEditingTitle(true);
                                  setShowMenu(false);
                                }}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                                <span>Edit List</span>
                              </button>
                              <div className="h-px bg-gray-200 mx-2 my-1" />
                              <button
                                onClick={() => {
                                  onDeleteList(list.id);
                                  setShowMenu(false);
                                }}
                                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete List</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cards Container */}
            <div className="px-4 pb-3">
              <Droppable droppableId={list.id} type="card">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[8px] space-y-3 transition-all duration-300 rounded-lg ${
                      snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset p-2' : ''
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
            </div>

            {/* Add Card Button */}
            <div className="px-4 pb-4">
              <AddButton
                onAdd={(title) => onCreateCard(title, list.id)}
                placeholder="Enter a title for this card..."
                buttonText="+ Add a card"
                className="border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}