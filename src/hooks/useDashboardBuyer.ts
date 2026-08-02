import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    if (!user) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchBuyerData() {
      setIsLoading(true);
      setError(null);

      try {
        const [ordersSnap, favoritesSnap] = await Promise.all([
          getDocs(query(collection(db, 'commandes'), where('buyer_id', '==', user!.id))),
          getDocs(query(collection(db, 'favoris'), where('user_id', '==', user!.id))),
        ]);

        if (!isMounted) return;

        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
        let totalSpent = 0;
        let activeOrders = 0;

        orders.forEach((order: any) => {
          const status = order.status || order.statut;
          if (status !== 'cancelled') {
            totalSpent += Number(order.total) || 0;
          }
          if (['pending', 'processing', 'shipped'].includes(status)) {
            activeOrders++;
          }
        });

        setData({
          kpis: {
            totalSpent,
            activeOrders,
            favoritesCount: favoritesSnap.size,
          },
          recentOrders: orders.slice(0, 10),
          favorites: favoritesSnap.docs.map(d => ({ id: d.id, ...d.data() as any })),
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
