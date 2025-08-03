import { useEffect } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useBoard } from '../hooks/useBoard';
import { List } from './List';
import { AddButton } from './AddButton';

interface BoardProps {
  boardId: string;
  searchQuery?: string;
}

export function Board({ boardId, searchQuery = '' }: BoardProps) {
  const { state, actions } = useBoard();
  const { currentBoard, loading, error } = state;

  useEffect(() => {
    actions.loadBoard(boardId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'card') {
      await actions.moveCard(
        draggableId,
        source.droppableId,
        destination.droppableId,
        destination.index
      );
    } else if (type === 'list') {
      // Remove the 'list-' prefix from draggableId to get the actual list ID
      const listId = draggableId.replace('list-', '');
      await actions.moveList(listId, destination.index);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-6 p-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-slate-700 text-xl font-semibold">Loading your workspace...</div>
          <div className="text-slate-500 text-sm">Preparing your project dashboard</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-red-50 to-red-100/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-8 shadow-xl max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚠</span>
            </div>
            <div className="text-red-800 text-xl font-bold">Connection Error</div>
          </div>
          <div className="text-red-600 text-base leading-relaxed">{error}</div>
          <button className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-8 shadow-xl max-w-md text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-slate-500 text-2xl">📋</span>
          </div>
          <div className="text-slate-700 text-xl font-bold mb-2">Board Not Found</div>
          <div className="text-slate-500 text-base">The board you're looking for doesn't exist or has been deleted.</div>
        </div>
      </div>
    );
  }

  const sortedLists = (currentBoard.lists || []).sort((a, b) => a.position - b.position);

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)
          `
        }} />
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex space-x-8 p-8 min-h-full relative z-10"
              style={{ paddingBottom: '120px' }}
            >
              {sortedLists.map((list, index) => (
                <List
                  key={list.id}
                  list={list}
                  index={index}
                  onUpdateList={actions.updateList}
                  onDeleteList={actions.deleteList}
                  onCreateCard={actions.createCard}
                  onUpdateCard={actions.updateCard}
                  onDeleteCard={actions.deleteCard}
                  searchQuery={searchQuery}
                />
              ))}
              {provided.placeholder}
              
              {/* Modern Add List Button */}
              <div className="w-80 flex-shrink-0">
                <AddButton
                  onAdd={(title) => actions.createList(title, boardId)}
                  placeholder="Enter list title..."
                  buttonText="+ Add another list"
                  className="bg-gray-200 hover:bg-gray-300 border border-gray-300 text-gray-800 rounded-xl"
                />
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}