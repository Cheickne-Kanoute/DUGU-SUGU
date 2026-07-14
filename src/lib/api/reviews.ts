import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Review = Database['public']['Tables']['reviews']['Row'] & {
  buyer?: Database['public']['Tables']['profiles']['Row'];
};

export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      buyer:buyer_id(full_name, avatar_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Review[];
}

export async function getSellerReviews(sellerId: string) {
  // We need to join through products to get reviews for a specific seller
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      buyer:buyer_id(full_name, avatar_url),
      product:product_id(seller_id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Filter client-side for now, or use a RPC function in Supabase for better performance
  return (data as any[]).filter(review => review.product?.seller_id === sellerId);
}

export async function createReview(review: Omit<Database['public']['Tables']['reviews']['Insert'], 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;
  return data;
}
