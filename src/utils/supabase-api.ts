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