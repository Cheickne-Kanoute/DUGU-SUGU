import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Product = Database['public']['Tables']['products']['Row'] & {
  seller?: Database['public']['Tables']['profiles']['Row'];
  categories?: { name: string; image: string };
};

export async function getProducts(options?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
}) {
  let query = supabase.from('products').select(`
    *,
    seller:seller_id(*),
    categories:category_id(name, image)
  `);

  if (options?.category && options.category !== 'all') {
    query = query.eq('category_id', options.category);
  }
  
  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }

  if (options?.minPrice !== undefined) {
    query = query.gte('price', options.minPrice);
  }
  
  if (options?.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice);
  }

  if (options?.sellerId) {
    query = query.eq('seller_id', options.sellerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data as Product[];
}

export async function getProductById(id: string) {
  const { data, error } = await supabase.from('products').select(`
    *,
    seller:seller_id(*),
    categories:category_id(name, image)
  `).eq('id', id).single();
  
  if (error) throw error;
  return data as Product;
}

export async function createProduct(product: Omit<Database['public']['Tables']['products']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('products').insert([product]).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Database['public']['Tables']['products']['Update']) {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
