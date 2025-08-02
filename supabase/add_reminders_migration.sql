-- Add reminder fields to cards table
ALTER TABLE cards 
ADD COLUMN reminder_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN reminder_enabled BOOLEAN DEFAULT FALSE;

-- Create index for reminder queries
CREATE INDEX idx_cards_reminder_date ON cards(reminder_date);
CREATE INDEX idx_cards_reminder_enabled ON cards(reminder_enabled);