import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Order = Database['public']['Tables']['orders']['Row'] & {
  buyer?: Database['public']['Tables']['profiles']['Row'];
  seller?: Database['public']['Tables']['profiles']['Row'];
  items?: (Database['public']['Tables']['order_items']['Row'] & {
    product: Database['public']['Tables']['products']['Row']
  })[];
};

export async function getOrders(options?: { buyerId?: string; sellerId?: string }) {
  let query = supabase.from('orders').select(`
    *,
    buyer:buyer_id(*),
    seller:seller_id(*),
    items:order_items(
      *,
      product:product_id(*)
    )
  `).order('created_at', { ascending: false });

  if (options?.buyerId) {
    query = query.eq('buyer_id', options.buyerId);
  }
  
  if (options?.sellerId) {
    query = query.eq('seller_id', options.sellerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data as unknown as Order[];
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase.from('orders').select(`
    *,
    buyer:buyer_id(*),
    seller:seller_id(*),
    items:order_items(
      *,
      product:product_id(*)
    )
  `).eq('id', id).single();
  
  if (error) throw error;
  return data as unknown as Order;
}

export async function createOrder(
  order: Omit<Database['public']['Tables']['orders']['Insert'], 'id' | 'created_at' | 'updated_at'>,
  items: Omit<Database['public']['Tables']['order_items']['Insert'], 'id' | 'order_id'>[]
) {
  // 1. Create order
  const { data: newOrder, error: orderError } = await supabase.from('orders').insert([order] as any).select().single();
  if (orderError) throw orderError;

  // 2. Create order items
  const orderItemsToInsert = items.map(item => ({
    ...item,
    order_id: (newOrder as any).id,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert as any);
  if (itemsError) throw itemsError;

  // 3. Deduct stock and check low stock threshold
  for (const item of items) {
    if (!item.product_id) continue;
    
    const { data: product } = await supabase
      .from('products')
      .select('stock, low_stock_threshold, seller_id, name')
      .eq('id', item.product_id)
      .single();

    if (product) {
      const p = product as any;
      const newStock = Math.max(0, (p.stock || 0) - item.quantity);
      await (supabase.from('products') as any).update({ stock: newStock }).eq('id', item.product_id);

      // Create notification if stock becomes low
      if ((p.stock || 0) > (p.low_stock_threshold || 0) && newStock <= (p.low_stock_threshold || 0)) {
        await supabase.from('notifications').insert({
          user_id: p.seller_id,
          title: 'Stock faible',
          message: `Le stock pour le produit "${p.name}" est maintenant très faible (${newStock} restant). Veuillez réapprovisionner.`,
          type: 'low_stock'
        } as any);
      }
    }
  }

  return newOrder;
}

export async function updateOrderStatus(id: string, status: Database['public']['Tables']['orders']['Update']['status']) {
  const { data, error } = await (supabase.from('orders') as any).update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
