import { supabase } from '../lib/supabase';
import type {
  Board,
  List,
  Card,
  CreateBoardData,
  CreateListData,
  CreateCardData,
  UpdateBoardData,
  UpdateListData,
  UpdateCardData,
  Note,
  Notebook,
  Tag,
  NoteAttachment,
  CreateNoteData,
  UpdateNoteData,
  CreateNotebookData,
  UpdateNotebookData,
  CreateTagData,
  SearchFilters,
  SearchResult,
} from '../types';

// Board API functions
export const boardAPI = {
  async getAll(): Promise<Board[]> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select(`
          *,
          lists (
            *,
            cards (*)
          )
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch boards: ${error.message}`);
      }
      return data || [];
    } catch (err) {
      console.error('API error:', err);
      throw err;
    }
  },

  async getById(id: string): Promise<Board | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select(`
          *,
          lists (
            *,
            cards (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch board: ${error.message}`);
      }
      return data;
    } catch (err) {
      console.error('API error:', err);
      throw err;
    }
  },

  async create(boardData: CreateBoardData): Promise<Board> {
    const { data, error } = await supabase
      .from('boards')
      .insert(boardData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, boardData: UpdateBoardData): Promise<Board> {
    const { data, error } = await supabase
      .from('boards')
      .update({ ...boardData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// List API functions
export const listAPI = {
  async create(listData: CreateListData): Promise<List> {
    // Get the current max position for this board
    const { data: maxPositionData } = await supabase
      .from('lists')
      .select('position')
      .eq('board_id', listData.board_id)
      .order('position', { ascending: false })
      .limit(1);

    const position = listData.position ?? (maxPositionData?.[0]?.position ?? 0) + 1;

    const { data, error } = await supabase
      .from('lists')
      .insert({ ...listData, position })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, listData: UpdateListData): Promise<List> {
    const { data, error } = await supabase
      .from('lists')
      .update({ ...listData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updatePositions(updates: { id: string; position: number }[]): Promise<void> {
    const { error } = await supabase.rpc('update_list_positions', {
      updates: updates,
    });

    if (error) throw error;
  },
};

// Card API functions
export const cardAPI = {
  async create(cardData: CreateCardData): Promise<Card> {
    // Get the current max position for this list
    const { data: maxPositionData } = await supabase
      .from('cards')
      .select('position')
      .eq('list_id', cardData.list_id)
      .order('position', { ascending: false })
      .limit(1);

    const position = cardData.position ?? (maxPositionData?.[0]?.position ?? 0) + 1;

    const { data, error } = await supabase
      .from('cards')
      .insert({ ...cardData, position })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, cardData: UpdateCardData): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .update({ ...cardData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updatePositions(updates: { id: string; position: number; list_id?: string }[]): Promise<void> {
    const { error } = await supabase.rpc('update_card_positions', {
      updates: updates,
    });

    if (error) throw error;
  },
};

// Notes API
export const notesAPI = {
  async getAll(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        notebook:notebooks(id, name, color),
        tags:note_tags(tag:tags(id, name, color)),
        attachments:note_attachments(*),
        linkedCards:note_card_links(card:cards(id, title))
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data?.map(transformNoteFromDB) || [];
  },

  async getById(id: string): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        notebook:notebooks(id, name, color),
        tags:note_tags(tag:tags(id, name, color)),
        attachments:note_attachments(*),
        linkedCards:note_card_links(card:cards(id, title))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformNoteFromDB(data);
  },

  async getByNotebook(notebookId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        notebook:notebooks(id, name, color),
        tags:note_tags(tag:tags(id, name, color)),
        attachments:note_attachments(*),
        linkedCards:note_card_links(card:cards(id, title))
      `)
      .eq('notebook_id', notebookId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data?.map(transformNoteFromDB) || [];
  },

  async create(noteData: CreateNoteData): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: noteData.title,
        content: noteData.content,
        notebook_id: noteData.notebookId,
      })
      .select()
      .single();

    if (error) throw error;

    // Add tags if provided
    if (noteData.tags && noteData.tags.length > 0) {
      await this.updateTags(data.id, noteData.tags);
    }

    // Link to card if provided
    if (noteData.linkedCardId) {
      await this.linkToCard(data.id, noteData.linkedCardId);
    }

    return this.getById(data.id);
  },

  async update(id: string, updates: UpdateNoteData): Promise<Note> {
    const { error } = await supabase
      .from('notes')
      .update({
        title: updates.title,
        content: updates.content,
        notebook_id: updates.notebookId,
      })
      .eq('id', id);

    if (error) throw error;

    // Update tags if provided
    if (updates.tags !== undefined) {
      await this.updateTags(id, updates.tags);
    }

    return this.getById(id);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    let queryBuilder = supabase
      .from('notes')
      .select(`
        *,
        notebook:notebooks(id, name, color),
        tags:note_tags(tag:tags(id, name, color))
      `);

    // Full-text search
    if (query) {
      queryBuilder = queryBuilder.textSearch('plain_text', query);
    }

    // Apply filters
    if (filters?.notebook) {
      queryBuilder = queryBuilder.eq('notebook_id', filters.notebook);
    }

    if (filters?.dateRange) {
      queryBuilder = queryBuilder
        .gte('created_at', filters.dateRange[0].toISOString())
        .lte('created_at', filters.dateRange[1].toISOString());
    }

    const { data, error } = await queryBuilder
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data?.map(note => ({
      note: transformNoteFromDB(note),
      highlights: extractHighlights(note.plain_text, query),
      relevanceScore: calculateRelevance(note, query)
    })) || [];
  },

  async updateTags(noteId: string, tagNames: string[]): Promise<void> {
    // Remove existing tags
    await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId);

    if (tagNames.length === 0) return;

    // Get or create tags
    const tags = await Promise.all(
      tagNames.map(async (name) => {
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', name)
          .single();

        if (existingTag) {
          return existingTag.id;
        }

        const { data: newTag, error } = await supabase
          .from('tags')
          .insert({ name })
          .select('id')
          .single();

        if (error) throw error;
        return newTag.id;
      })
    );

    // Link tags to note
    const { error } = await supabase
      .from('note_tags')
      .insert(tags.map(tagId => ({ note_id: noteId, tag_id: tagId })));

    if (error) throw error;
  },

  async linkToCard(noteId: string, cardId: string): Promise<void> {
    const { error } = await supabase
      .from('note_card_links')
      .insert({ note_id: noteId, card_id: cardId });

    if (error && !error.message.includes('duplicate')) throw error;
  },

  async unlinkFromCard(noteId: string, cardId: string): Promise<void> {
    const { error } = await supabase
      .from('note_card_links')
      .delete()
      .eq('note_id', noteId)
      .eq('card_id', cardId);

    if (error) throw error;
  },

  async uploadAttachment(noteId: string, file: File): Promise<NoteAttachment> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${noteId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('note-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('note_attachments')
      .insert({
        note_id: noteId,
        filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (error) throw error;
    return transformAttachmentFromDB(data);
  }
};

// Notebooks API
export const notebooksAPI = {
  async getAll(): Promise<Notebook[]> {
    const { data, error } = await supabase
      .from('notebooks')
      .select('*')
      .order('name');

    if (error) throw error;
    return data?.map(transformNotebookFromDB) || [];
  },

  async getById(id: string): Promise<Notebook> {
    const { data, error } = await supabase
      .from('notebooks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformNotebookFromDB(data);
  },

  async create(notebookData: CreateNotebookData): Promise<Notebook> {
    const { data, error } = await supabase
      .from('notebooks')
      .insert(notebookData)
      .select()
      .single();

    if (error) throw error;
    return transformNotebookFromDB(data);
  },

  async update(id: string, updates: UpdateNotebookData): Promise<Notebook> {
    const { data, error } = await supabase
      .from('notebooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformNotebookFromDB(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notebooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Tags API
export const tagsAPI = {
  async getAll(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('usage_count', { ascending: false });

    if (error) throw error;
    return data?.map(transformTagFromDB) || [];
  },

  async create(tagData: CreateTagData): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert(tagData)
      .select()
      .single();

    if (error) throw error;
    return transformTagFromDB(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Transform functions
function transformNoteFromDB(dbNote: any): Note {
  return {
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content,
    plainText: dbNote.plain_text,
    notebookId: dbNote.notebook_id,
    createdAt: dbNote.created_at,
    updatedAt: dbNote.updated_at,
    createdBy: dbNote.created_by,
    isShared: dbNote.is_shared,
    viewCount: dbNote.view_count,
    tags: dbNote.tags?.map((nt: any) => transformTagFromDB(nt.tag)) || [],
    attachments: dbNote.attachments?.map(transformAttachmentFromDB) || [],
    linkedCards: dbNote.linkedCards?.map((link: any) => link.card) || []
  };
}

function transformNotebookFromDB(dbNotebook: any): Notebook {
  return {
    id: dbNotebook.id,
    name: dbNotebook.name,
    description: dbNotebook.description,
    color: dbNotebook.color,
    createdAt: dbNotebook.created_at,
    updatedAt: dbNotebook.updated_at,
    noteCount: dbNotebook.note_count
  };
}

function transformTagFromDB(dbTag: any): Tag {
  return {
    id: dbTag.id,
    name: dbTag.name,
    color: dbTag.color,
    usageCount: dbTag.usage_count,
    createdAt: dbTag.created_at
  };
}

function transformAttachmentFromDB(dbAttachment: any): NoteAttachment {
  return {
    id: dbAttachment.id,
    noteId: dbAttachment.note_id,
    filename: dbAttachment.filename,
    filePath: dbAttachment.file_path,
    fileSize: dbAttachment.file_size,
    mimeType: dbAttachment.mime_type,
    uploadedAt: dbAttachment.uploaded_at
  };
}

function extractHighlights(text: string, query: string): string[] {
  if (!query) return [];
  
  const words = query.toLowerCase().split(' ');
  const highlights: string[] = [];
  
  words.forEach(word => {
    const regex = new RegExp(`(.{0,30})(${word})(.{0,30})`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      highlights.push(...matches.slice(0, 3));
    }
  });
  
  return highlights;
}

function calculateRelevance(note: any, query: string): number {
  if (!query) return 1;
  
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Title match gets highest score
  if (note.title?.toLowerCase().includes(queryLower)) {
    score += 10;
  }
  
  // Content match
  if (note.plain_text?.toLowerCase().includes(queryLower)) {
    score += 5;
  }
  
  // Tag match
  if (note.tags?.some((tag: any) => tag.name.toLowerCase().includes(queryLower))) {
    score += 3;
  }
  
  // Recent notes get slight boost
  const daysSinceUpdate = (Date.now() - new Date(note.updated_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 7) {
    score += 1;
  }
  
  return score;
}