import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminDashboardData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    activeSellers: number;
    totalClients: number;
    pendingRequests: number;
    cancellationRate: number;
  };
  revenueByDay: { date: string; revenue: number }[];
  recentOrders: any[];
  topSellers: any[];
  lowStockProducts: any[];
}

export function useDashboardAdmin() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAdminData() {
      setIsLoading(true);
      setError(null);

      try {
        // Run queries in parallel
        const [
          { data: ordersData, error: ordersError },
          { count: activeSellersCount, error: sellersError },
          { count: activeClientsCount, error: clientsError },
          { count: pendingRequestsCount, error: requestsError },
          { data: recentOrdersData, error: recentOrdersError },
          { data: lowStockData, error: lowStockError },
        ] = await Promise.all([
          // All orders for KPI and Revenue
          supabase.from('orders').select('total, status, created_at'),
          
          // Users count
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
          
          // Pending requests
          supabase.from('seller_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

          // Recent orders with buyer and seller info
          supabase.from('orders')
            .select(`
              id,
              total,
              status,
              created_at,
              buyer:profiles!orders_buyer_id_fkey(full_name),
              seller:profiles!orders_seller_id_fkey(full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(10),

          // Low stock products
          supabase.from('products')
            .select('id, name, stock, low_stock_threshold, seller:profiles!products_seller_id_fkey(full_name)')
            .order('stock', { ascending: true })
            .limit(10)
        ]);

        if (ordersError) throw ordersError;
        if (sellersError) throw sellersError;
        if (clientsError) throw clientsError;
        if (requestsError) throw requestsError;
        if (recentOrdersError) throw recentOrdersError;
        if (lowStockError) throw lowStockError;

        if (!isMounted) return;

        // Process Orders Data
        const orders = ordersData || [];
        
        let totalRevenue = 0;
        let cancelledCount = 0;
        const revenueMap = new Map<string, number>();

        orders.forEach((order: any) => {
          if (order.status !== 'cancelled') {
            totalRevenue += Number(order.total) || 0;
            
            // Format date for chart (e.g. YYYY-MM-DD)
            const dateStr = new Date(order.created_at).toISOString().split('T')[0];
            const currentRev = revenueMap.get(dateStr) || 0;
            revenueMap.set(dateStr, currentRev + Number(order.total));
          } else {
            cancelledCount++;
          }
        });

        const cancellationRate = orders.length > 0 ? (cancelledCount / orders.length) * 100 : 0;
        
        const revenueByDay = Array.from(revenueMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Let's create a mockup for top sellers if we don't have a specific RPC yet.
        // In a real app we'd do a group by in SQL. For now we just return an empty array
        // or a basic mock to be replaced by a real view later.
        const topSellers: any[] = [];

        // Low stock: ensure we got data from the fallback
        let lowStockProducts = [];
        if (lowStockData) {
            // filter manually in js for fallback
            lowStockProducts = (lowStockData as any[]).filter(p => p.stock <= p.low_stock_threshold);
        }

        setData({
          kpis: {
            totalRevenue,
            totalOrders: orders.length,
            activeSellers: activeSellersCount || 0,
            totalClients: activeClientsCount || 0,
            pendingRequests: pendingRequestsCount || 0,
            cancellationRate,
          },
          revenueByDay,
          recentOrders: recentOrdersData || [],
          topSellers,
          lowStockProducts,
        });

      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error fetching admin data');
        console.error("Admin dashboard fetch error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
