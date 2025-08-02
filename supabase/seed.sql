-- Insert sample data for testing

-- Insert sample boards
INSERT INTO boards (id, title, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'My First Board', 'This is a sample board to get you started'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Project Management', 'Track project tasks and progress');

-- Insert sample lists for the first board
INSERT INTO lists (id, title, position, board_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'To Do', 1, '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440012', 'In Progress', 2, '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Done', 3, '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample lists for the second board
INSERT INTO lists (id, title, position, board_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 'Backlog', 1, '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440022', 'Sprint', 2, '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440023', 'Review', 3, '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440024', 'Complete', 4, '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample cards for the first board
INSERT INTO cards (title, description, position, list_id) VALUES
  ('Welcome to your Trello Clone!', 'This is your first card. You can edit, move, and delete cards.', 1, '550e8400-e29b-41d4-a716-446655440011'),
  ('Try dragging this card', 'Drag and drop cards between lists to organize your work.', 2, '550e8400-e29b-41d4-a716-446655440011'),
  ('Add new cards', 'Click the "+ Add a card" button to create new tasks.', 3, '550e8400-e29b-41d4-a716-446655440011'),
  ('Currently working on this', 'This card is in the "In Progress" list.', 1, '550e8400-e29b-41d4-a716-446655440012'),
  ('Completed task', 'This task has been finished and moved to Done.', 1, '550e8400-e29b-41d4-a716-446655440013'),
  ('Another completed item', 'Keep your completed work here for reference.', 2, '550e8400-e29b-41d4-a716-446655440013');

-- Insert sample cards for the second board
INSERT INTO cards (title, description, position, list_id) VALUES
  ('Plan project scope', 'Define the requirements and deliverables for the project.', 1, '550e8400-e29b-41d4-a716-446655440021'),
  ('Design user interface', 'Create mockups and wireframes for the application.', 2, '550e8400-e29b-41d4-a716-446655440021'),
  ('Set up development environment', 'Configure tools and dependencies needed for development.', 3, '550e8400-e29b-41d4-a716-446655440021'),
  ('Implement authentication', 'Add user login and registration functionality.', 1, '550e8400-e29b-41d4-a716-446655440022'),
  ('Build API endpoints', 'Create the backend services for data management.', 2, '550e8400-e29b-41d4-a716-446655440022'),
  ('Code review - Authentication', 'Review the authentication implementation for security and best practices.', 1, '550e8400-e29b-41d4-a716-446655440023'),
  ('Project kickoff meeting', 'Initial team meeting to align on goals and timeline.', 1, '550e8400-e29b-41d4-a716-446655440024');