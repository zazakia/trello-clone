-- Notes Migration: Add note-taking functionality to existing Trello Clone schema
-- Run this after the main schema.sql

-- Create notebooks table
CREATE TABLE notebooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  note_count INTEGER DEFAULT 0
);

-- Create notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  plain_text TEXT DEFAULT '',
  notebook_id UUID REFERENCES notebooks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT, -- Future user management
  is_shared BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0
);

-- Create tags table
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create note-tag junction table
CREATE TABLE note_tags (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (note_id, tag_id)
);

-- Create note-card links table
CREATE TABLE note_card_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, card_id)
);

-- Create note attachments table
CREATE TABLE note_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create note sharing table
CREATE TABLE note_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  permission TEXT CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_plain_text ON notes USING gin(to_tsvector('english', plain_text));
CREATE INDEX idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);
CREATE INDEX idx_note_card_links_note_id ON note_card_links(note_id);
CREATE INDEX idx_note_card_links_card_id ON note_card_links(card_id);
CREATE INDEX idx_note_attachments_note_id ON note_attachments(note_id);
CREATE INDEX idx_tags_name ON tags(name);

-- Enable Row Level Security
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_card_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - can be restricted later)
CREATE POLICY "Allow all operations on notebooks" ON notebooks FOR ALL USING (true);
CREATE POLICY "Allow all operations on notes" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all operations on tags" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on note_tags" ON note_tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on note_card_links" ON note_card_links FOR ALL USING (true);
CREATE POLICY "Allow all operations on note_attachments" ON note_attachments FOR ALL USING (true);
CREATE POLICY "Allow all operations on note_shares" ON note_shares FOR ALL USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON notebooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update notebook note count
CREATE OR REPLACE FUNCTION update_notebook_note_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE notebooks SET note_count = note_count + 1 WHERE id = NEW.notebook_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE notebooks SET note_count = note_count - 1 WHERE id = OLD.notebook_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.notebook_id IS DISTINCT FROM NEW.notebook_id THEN
      UPDATE notebooks SET note_count = note_count - 1 WHERE id = OLD.notebook_id;
      UPDATE notebooks SET note_count = note_count + 1 WHERE id = NEW.notebook_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notebook note count
CREATE TRIGGER update_notebook_note_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_notebook_note_count();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tag usage count
CREATE TRIGGER update_tag_usage_count_trigger
  AFTER INSERT OR DELETE ON note_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Function to update plain text when content changes
CREATE OR REPLACE FUNCTION update_note_plain_text()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract plain text from JSONB content for search indexing
  -- This is a simplified version - in practice you'd parse the rich text structure
  NEW.plain_text = COALESCE(NEW.title, '') || ' ' || 
                   COALESCE(NEW.content->>'text', '') || ' ' ||
                   COALESCE(array_to_string(array(SELECT jsonb_array_elements_text(NEW.content->'blocks')), ' '), '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plain text extraction
CREATE TRIGGER update_note_plain_text_trigger
  BEFORE INSERT OR UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_note_plain_text();

-- Insert default notebook
INSERT INTO notebooks (name, description, color) 
VALUES ('General Notes', 'Default notebook for uncategorized notes', '#3B82F6');