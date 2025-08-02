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
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div className="text-white/80 text-lg font-medium">Loading your board...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="text-red-600 text-lg font-medium">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-6">
          <div className="text-gray-600 text-lg">Board not found</div>
        </div>
      </div>
    );
  }

  const sortedLists = (currentBoard.lists || []).sort((a, b) => a.position - b.position);

  return (
    <div className="h-full overflow-x-auto pb-24">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex space-x-6 p-6 min-h-full"
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