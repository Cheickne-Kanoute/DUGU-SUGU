import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
        const [ordersSnap, sellersSnap, clientsSnap, requestsSnap, productsSnap] = await Promise.all([
          getDocs(collection(db, 'commandes')),
          getDocs(query(collection(db, 'users'), where('role', '==', 'seller'))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'client'))),
          getDocs(query(collection(db, 'demandesVendeur'), where('status', '==', 'pending'))),
          getDocs(collection(db, 'produits')),
        ]);

        if (!isMounted) return;

        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        let totalRevenue = 0;
        let cancelledCount = 0;
        const revenueMap = new Map<string, number>();

        orders.forEach((order: any) => {
          const status = order.status || order.statut;
          const total = Number(order.total) || 0;
          if (status !== 'cancelled') {
            totalRevenue += total;
            const dateStr = new Date(order.created_at || order.dateCommande || new Date()).toISOString().split('T')[0];
            const currentRev = revenueMap.get(dateStr) || 0;
            revenueMap.set(dateStr, currentRev + total);
          } else {
            cancelledCount++;
          }
        });

        const cancellationRate = orders.length > 0 ? (cancelledCount / orders.length) * 100 : 0;
        const revenueByDay = Array.from(revenueMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));

        const lowStockProducts = productsSnap.docs
          .map(d => ({ id: d.id, ...d.data() as any }))
          .filter(p => (p.stock ?? p.quantiteStock ?? 0) <= (p.low_stock_threshold ?? p.seuilStockBas ?? 10));

        setData({
          kpis: {
            totalRevenue,
            totalOrders: orders.length,
            activeSellers: sellersSnap.size,
            totalClients: clientsSnap.size,
            pendingRequests: requestsSnap.size,
            cancellationRate,
          },
          revenueByDay,
          recentOrders: orders.slice(0, 10),
          topSellers: [],
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
