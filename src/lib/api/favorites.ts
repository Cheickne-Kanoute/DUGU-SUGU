import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Favorite = Database['public']['Tables']['favorites']['Row'] & {
  product?: Database['public']['Tables']['products']['Row'] & {
    seller?: Database['public']['Tables']['profiles']['Row'];
  };
};

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      product:product_id(
        *,
        seller:seller_id(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Favorite[];
}

export async function toggleFavorite(userId: string, productId: string) {
  // Check if exists
  const { data: existing } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
    return false; // Not favorited anymore
  } else {
    // Add
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, product_id: productId }]);
    if (error) throw error;
    return true; // Favorited
  }
}

export async function isFavorite(userId: string, productId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
