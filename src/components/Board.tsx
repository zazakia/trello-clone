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
      <div className="flex items-center justify-center h-full bg-primary">
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-gray-700 text-lg font-medium">Loading your workspace...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚠</span>
            </div>
            <div className="text-red-800 text-lg font-bold">Connection Error</div>
          </div>
          <div className="text-red-600 text-base mb-4">{error}</div>
          <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-500 text-xl">📋</span>
          </div>
          <div className="text-gray-700 text-lg font-bold mb-2">Board Not Found</div>
          <div className="text-gray-500 text-base">The board you're looking for doesn't exist or has been deleted.</div>
        </div>
      </div>
    );
  }

  const sortedLists = (currentBoard.lists || []).sort((a, b) => a.position - b.position);

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-50 pointer-events-none" />
      
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