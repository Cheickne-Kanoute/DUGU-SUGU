import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface BuyerDashboardData {
  kpis: {
    totalSpent: number;
    activeOrders: number;
    favoritesCount: number;
  };
  recentOrders: any[];
  favorites: any[];
}

export function useDashboardBuyer() {
  const { user } = useAuth();
  const [data, setData] = useState<BuyerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'client') {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchBuyerData() {
      setIsLoading(true);
      setError(null);

      try {
        const [
          { data: ordersData, error: ordersError },
          { data: recentOrdersData, error: recentOrdersError },
          { count: favoritesCount, error: favCountError },
          { data: favoritesData, error: favoritesError }
        ] = await Promise.all([
          // All orders for this buyer
          supabase.from('orders')
            .select('total, status')
            .eq('buyer_id', user!.id),
          
          // Recent orders
          supabase.from('orders')
            .select(`
              id,
              total,
              status,
              created_at,
              seller:profiles!orders_seller_id_fkey(full_name)
            `)
            .eq('buyer_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(10),
            
          // Favorites count
          supabase.from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user!.id),
            
          // Recent favorites with product info
          supabase.from('favorites')
            .select(`
              id,
              product:products (
                id,
                name,
                price,
                image
              )
            `)
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(6)
        ]);

        if (ordersError) throw ordersError;
        if (recentOrdersError) throw recentOrdersError;
        if (favCountError) throw favCountError;
        if (favoritesError) throw favoritesError;

        if (!isMounted) return;

        const orders = (ordersData as any[]) || [];
        let totalSpent = 0;
        let activeOrders = 0;

        orders.forEach((order: any) => {
          if (order.status !== 'cancelled') {
            totalSpent += Number(order.total) || 0;
          }
          if (['pending', 'processing', 'shipped'].includes(order.status)) {
            activeOrders++;
          }
        });

        setData({
          kpis: {
            totalSpent,
            activeOrders,
            favoritesCount: favoritesCount || 0,
          },
          recentOrders: recentOrdersData || [],
          favorites: favoritesData || [],
        });

      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error fetching buyer data');
        console.error("Buyer dashboard fetch error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchBuyerData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { data, isLoading, error };
}
