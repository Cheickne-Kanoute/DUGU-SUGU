import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchSellerData() {
      setIsLoading(true);
      setError(null);

      try {
        const [ordersSnap, productsSnap] = await Promise.all([
          getDocs(query(collection(db, 'commandes'), where('seller_id', '==', user!.id))),
          getDocs(query(collection(db, 'produits'), where('seller_id', '==', user!.id))),
        ]);

        if (!isMounted) return;

        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

        let myRevenue = 0;
        let pendingOrders = 0;
        const revenueMap = new Map<string, number>();

        orders.forEach((order: any) => {
          const status = order.status || order.statut;
          const total = Number(order.total) || 0;
          if (status !== 'cancelled') {
            myRevenue += total;
            const dateStr = new Date(order.created_at || order.dateCommande || new Date()).toISOString().split('T')[0];
            const currentRev = revenueMap.get(dateStr) || 0;
            revenueMap.set(dateStr, currentRev + total);
          }
          if (status === 'pending' || status === 'processing') {
            pendingOrders++;
          }
        });

        const revenueByDay = Array.from(revenueMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));

        const lowStockProducts = products.filter(p => (p.stock ?? p.quantiteStock ?? 0) <= (p.low_stock_threshold ?? p.seuilStockBas ?? 10));

        setData({
          kpis: {
            myRevenue,
            myOrders: orders.length,
            pendingOrders,
            myRating: Number(user?.rating || 0),
          },
          revenueByDay,
          recentOrders: orders.slice(0, 10),
          lowStockProducts,
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
