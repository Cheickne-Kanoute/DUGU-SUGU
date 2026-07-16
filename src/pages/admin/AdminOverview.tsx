import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UsersIcon, ShoppingCartIcon, PackageIcon, StoreIcon, TrendingUpIcon, ClipboardListIcon, AlertCircleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingRequests: number;
}

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);

        const [
          { count: totalUsers, error: usersErr },
          { count: totalSellers, error: sellersErr },
          { count: totalProducts, error: productsErr },
          { count: totalOrders, error: ordersErr },
          { data: revenueData, error: revenueErr },
          { count: pendingRequests, error: pendingErr },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total').not('total', 'is', null),
          supabase.from('seller_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        const firstError = usersErr || sellersErr || productsErr || ordersErr || revenueErr || pendingErr;
        if (firstError) throw firstError;

        const totalRevenue = (revenueData ?? []).reduce(
          (sum: number, row: { total: number }) => sum + (row.total ?? 0),
          0
        );

        setStats({
          totalUsers: totalUsers ?? 0,
          totalSellers: totalSellers ?? 0,
          totalProducts: totalProducts ?? 0,
          totalOrders: totalOrders ?? 0,
          totalRevenue,
          pendingRequests: pendingRequests ?? 0,
        });
      } catch (err) {
        console.error('Erreur stats admin:', err);
        setError('Impossible de charger les statistiques. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);

  const kpiCards = [
    { title: 'Utilisateurs', value: stats?.totalUsers ?? '—', icon: <UsersIcon className="size-5 text-blue-400" />, color: 'from-blue-500/10 to-blue-500/5' },
    { title: 'Vendeurs', value: stats?.totalSellers ?? '—', icon: <StoreIcon className="size-5 text-emerald-400" />, color: 'from-emerald-500/10 to-emerald-500/5' },
    { title: 'Produits', value: stats?.totalProducts ?? '—', icon: <PackageIcon className="size-5 text-amber-400" />, color: 'from-amber-500/10 to-amber-500/5' },
    { title: 'Commandes', value: stats?.totalOrders ?? '—', icon: <ShoppingCartIcon className="size-5 text-purple-400" />, color: 'from-purple-500/10 to-purple-500/5' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vue d'ensemble</h1>
        <p className="text-sm text-muted-foreground mt-1">Bienvenue, {user?.full_name}. Voici l'état de la plateforme.</p>
      </div>

      {/* Bandeau d'erreur */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircleIcon className="size-4 shrink-0" />
          <span>{typeof error === 'string' ? error : (error?.message || JSON.stringify(error))}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className={`bg-gradient-to-br ${kpi.color} border-border/50`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">{kpi.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue + Pending Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chiffre d'affaires total</CardTitle>
            <TrendingUpIcon className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-10 w-40 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-primary">
                {stats ? formatCurrency(stats.totalRevenue) : '—'}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Total de toutes les commandes</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Demandes vendeur</CardTitle>
            <ClipboardListIcon className="size-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              {loading ? (
                <div className="h-10 w-10 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">{stats?.pendingRequests ?? '—'}</p>
              )}
              {!loading && stats && stats.pendingRequests > 0 && (
                <Badge variant="destructive" className="mb-1">En attente</Badge>
              )}
            </div>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/admin/seller-requests">Gérer les demandes →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Gérer les utilisateurs', to: '/admin/users', icon: <UsersIcon className="size-4" /> },
          { label: 'Gérer les catégories', to: '/admin/categories', icon: <PackageIcon className="size-4" /> },
          { label: 'Voir les produits', to: '/admin/products', icon: <StoreIcon className="size-4" /> },
        ].map((link) => (
          <Button key={link.to} variant="outline" className="gap-2 justify-start" asChild>
            <Link to={link.to}>
              {link.icon}
              {link.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
