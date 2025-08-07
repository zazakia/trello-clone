import { supabase } from '../lib/supabase';

export interface MigrationStatus {
  isComplete: boolean;
  missingTables: string[];
  errors: string[];
}

export async function checkNotesMigration(): Promise<MigrationStatus> {
  const requiredTables = [
    'notebooks',
    'notes', 
    'tags',
    'note_tags',
    'note_card_links',
    'note_attachments',
    'note_shares'
  ];

  const missingTables: string[] = [];
  const errors: string[] = [];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === '42P01') {
          missingTables.push(table);
        } else {
          errors.push(`${table}: ${error.message}`);
        }
      }
    } catch (err) {
      errors.push(`${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return {
    isComplete: missingTables.length === 0 && errors.length === 0,
    missingTables,
    errors
  };
}

export function getMigrationInstructions(): string {
  return `
To set up the notes system, please run the following SQL migration in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the contents of: supabase/notes_migration.sql

This will create all the necessary tables for the notes system:
- notebooks (for organizing notes)
- notes (main notes table)
- tags (for tagging notes)
- note_tags (many-to-many relationship)
- note_card_links (linking notes to cards)
- note_attachments (file attachments)
- note_shares (sharing permissions)

After running the migration, refresh this page to start using the notes system.
  `.trim();
}