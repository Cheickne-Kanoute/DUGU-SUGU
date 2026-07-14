import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFavorites, toggleFavorite as toggleFavoriteApi, type Favorite } from '@/lib/api/favorites';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteProductIds(new Set());
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getFavorites(user.id);
      setFavorites(data);
      setFavoriteProductIds(new Set(data.map(f => f.product_id)));
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (productId: string) => {
    if (!user) return false;

    // Optimistic update
    const isCurrentlyFav = favoriteProductIds.has(productId);
    
    setFavoriteProductIds(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyFav) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    try {
      const isNowFav = await toggleFavoriteApi(user.id, productId);
      // Fetch fresh data to ensure `favorites` array is fully synced 
      // (especially if we need full product data for the dashboard)
      await fetchFavorites();
      return isNowFav;
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      // Revert optimistic update on failure
      setFavoriteProductIds(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyFav) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
      throw error;
    }
  };

  const isFavorite = (productId: string) => favoriteProductIds.has(productId);

  return {
    favorites,
    favoriteProductIds,
    isLoading,
    toggleFavorite,
    isFavorite,
    refreshFavorites: fetchFavorites
  };
}
