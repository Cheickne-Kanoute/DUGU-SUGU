import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  product?: Database['public']['Tables']['products']['Row'] & {
    seller?: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'>;
  };
};

// Fallback to local storage for guests
const LOCAL_CART_KEY = 'dugu_sugu_local_cart';

function getLocalCart(): any[] {
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCart(cart: any[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

export async function getCart(userId?: string): Promise<CartItem[]> {
  if (!userId) {
    return getLocalCart();
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:product_id(
        *,
        seller:seller_id(full_name, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as CartItem[];
}

export async function addToCart(productId: string, quantity: number, userId?: string) {
  if (!userId) {
    const cart = getLocalCart();
    const existing = cart.find(item => item.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: `local-${Date.now()}`, product_id: productId, quantity });
    }
    saveLocalCart(cart);
    return cart;
  }

  // Check if exists in DB
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id: productId, quantity }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function updateCartItem(itemId: string, quantity: number, userId?: string) {
  if (!userId) {
    let cart = getLocalCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.id !== itemId);
    } else {
      const item = cart.find(i => i.id === itemId);
      if (item) item.quantity = quantity;
    }
    saveLocalCart(cart);
    return cart;
  }

  if (quantity <= 0) {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (error) throw error;
    return null;
  } else {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function clearCart(userId?: string) {
  if (!userId) {
    localStorage.removeItem(LOCAL_CART_KEY);
    return;
  }
  
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) throw error;
}

// Sync local cart to DB after login
export async function syncCartToDb(userId: string) {
  const localCart = getLocalCart();
  if (localCart.length === 0) return;

  for (const item of localCart) {
    await addToCart(item.product_id, item.quantity, userId);
  }
  
  localStorage.removeItem(LOCAL_CART_KEY);
}
