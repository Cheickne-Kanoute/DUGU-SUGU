import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Category = Database['public']['Tables']['categories']['Row'];

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  return data as Category[];
}
