import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  clearCart as clearCartApi,
  type CartItem
} from '@/lib/api/cart';

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoadingCart(true);
      const cartItems = await getCart(user?.id);
      setItems(cartItems);
      setTotalItems(cartItems.reduce((sum, item) => sum + item.quantity, 0));
      setTotalPrice(cartItems.reduce((sum, item) => sum + item.quantity * (item.product?.price || 0), 0));
    } catch (error) {
      console.error('Failed to load cart', error);
    } finally {
      setIsLoadingCart(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshCart();
    
    // Custom event to refresh when adding from other components without triggering full re-renders
    const handleCartUpdate = () => refreshCart();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      await addToCartApi(productId, quantity, user?.id);
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      console.error('Failed to add to cart', error);
    }
  }, [user?.id]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      await updateCartItemApi(itemId, quantity, user?.id);
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      console.error('Failed to update cart item', error);
    }
  }, [user?.id]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      await updateCartItemApi(itemId, 0, user?.id); // quantity 0 removes it
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      console.error('Failed to remove cart item', error);
    }
  }, [user?.id]);

  const clearCart = useCallback(async () => {
    try {
      await clearCartApi(user?.id);
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  }, [user?.id]);

  return {
    items,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    isLoadingCart,
  };
}
