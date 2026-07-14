import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface SellerDashboardData {
  kpis: {
    myRevenue: number;
    myOrders: number;
    pendingOrders: number;
    myRating: number;
  };
  revenueByDay: { date: string; revenue: number }[];
  recentOrders: any[];
  lowStockProducts: any[];
}

export function useDashboardSeller() {
  const { user } = useAuth();
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchSellerData() {
      setIsLoading(true);
      setError(null);

      try {
        const [
          { data: ordersData, error: ordersError },
          { data: recentOrdersData, error: recentOrdersError },
          { data: productsData, error: productsError }
        ] = await Promise.all([
          // All orders for this seller
          supabase.from('orders')
            .select('total, status, created_at')
            .eq('seller_id', user!.id),
          
          // Recent orders for this seller
          supabase.from('orders')
            .select(`
              id,
              total,
              status,
              created_at,
              buyer:profiles!orders_buyer_id_fkey(full_name)
            `)
            .eq('seller_id', user!.id)
            .order('created_at', { ascending: false })
            .limit(10),

          // All products for this seller (to calculate stock alerts)
          supabase.from('products')
            .select('id, name, stock, low_stock_threshold')
            .eq('seller_id', user!.id)
        ]);

        if (ordersError) throw ordersError;
        if (recentOrdersError) throw recentOrdersError;
        if (productsError) throw productsError;

        if (!isMounted) return;

        const orders = (ordersData as any[]) || [];
        
        let myRevenue = 0;
        let pendingOrders = 0;
        const revenueMap = new Map<string, number>();

        orders.forEach((order: any) => {
          if (order.status !== 'cancelled') {
            myRevenue += Number(order.total) || 0;
            
            const dateStr = new Date(order.created_at).toISOString().split('T')[0];
            const currentRev = revenueMap.get(dateStr) || 0;
            revenueMap.set(dateStr, currentRev + Number(order.total));
          }
          if (order.status === 'pending' || order.status === 'processing') {
            pendingOrders++;
          }
        });

        const revenueByDay = Array.from(revenueMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));

        const products = productsData || [];
        const lowStockProducts = (products as any[]).filter((p: any) => p.stock <= p.low_stock_threshold);

        setData({
          kpis: {
            myRevenue,
            myOrders: orders.length,
            pendingOrders,
            myRating: Number(user?.rating || 0),
          },
          revenueByDay,
          recentOrders: recentOrdersData || [],
          lowStockProducts: (lowStockProducts as any[]) || [],
        });

      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error fetching seller data');
        console.error("Seller dashboard fetch error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSellerData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { data, isLoading, error };
}
