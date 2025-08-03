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
          {/* Glass Card Background */}
          <div className={`relative bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl transition-all duration-300 ${
            snapshot.isDragging ? 'shadow-2xl ring-4 ring-blue-500/20' : 'hover:shadow-2xl group-hover:border-white/60'
          }`}>
            
            {/* Header with Drag Handle */}
            <div className="flex items-center justify-between p-5 pb-3" {...provided.dragHandleProps}>
              <div className="flex items-center space-x-3 flex-1">
                <div className="p-1.5 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg cursor-grab active:cursor-grabbing group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-200">
                  <GripVertical className="h-4 w-4 text-slate-500" />
                </div>
                
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 p-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400 font-semibold"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 border border-green-200 hover:border-green-300"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelTitle}
                      className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all duration-200 border border-slate-200 hover:border-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{list.title}</h3>
                    <div className="flex items-center space-x-1">
                      <div className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                        {filteredCards.length}
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 text-slate-500 hover:text-slate-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {showMenu && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-12 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 py-2 min-w-[140px] z-20">
                              <button
                                onClick={() => {
                                  setIsEditingTitle(true);
                                  setShowMenu(false);
                                }}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                              >
                                <Edit2 className="h-4 w-4" />
                                <span>Edit List</span>
                              </button>
                              <div className="h-px bg-slate-200 mx-2 my-1" />
                              <button
                                onClick={() => {
                                  onDeleteList(list.id);
                                  setShowMenu(false);
                                }}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
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
            <div className="px-5 pb-3">
              <Droppable droppableId={list.id} type="card">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[8px] space-y-3 transition-all duration-300 rounded-xl ${
                      snapshot.isDraggingOver ? 'bg-blue-50/80 ring-2 ring-blue-200/50 ring-inset p-2' : ''
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
            <div className="px-5 pb-5">
              <AddButton
                onAdd={(title) => onCreateCard(title, list.id)}
                placeholder="Enter a title for this card..."
                buttonText="+ Add a card"
                className="border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-200"
              />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}