import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingCartIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, PackageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  buyer: { id: string; full_name: string; email: string };
  seller: { id: string; full_name: string };
  items?: {
    id: string;
    quantity: number;
    price_at_time: number;
    product: { id: string; name: string; images: string[] };
  }[];
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  processing: { label: 'En cours', variant: 'outline' },
  shipped: { label: 'Expédiée', variant: 'default' },
  delivered: { label: 'Livrée', variant: 'default' },
  cancelled: { label: 'Annulée', variant: 'destructive' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const limit = 20;

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`${API_BASE}/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalPages = Math.ceil(total / limit);
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Commandes</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} commande(s) au total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v || 'all'); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="processing">En cours</SelectItem>
            <SelectItem value="shipped">Expédiée</SelectItem>
            <SelectItem value="delivered">Livrée</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">ID Commande</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Vendeur</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Montant</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td colSpan={7} className="p-4"><div className="h-10 bg-muted animate-pulse rounded" /></td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <ShoppingCartIcon className="size-8 mx-auto mb-2 opacity-40" />
                      Aucune commande trouvée
                    </td>
                  </tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="p-4 font-mono text-xs">{o.id.split('-')[0]}...</td>
                    <td className="p-4 text-muted-foreground">
                      {format(new Date(o.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{o.buyer?.full_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{o.buyer?.email || '—'}</p>
                    </td>
                    <td className="p-4 text-muted-foreground">{o.seller?.full_name || '—'}</td>
                    <td className="p-4 font-medium text-right">{formatCurrency(o.total)}</td>
                    <td className="p-4">
                      <Badge variant={statusConfig[o.status].variant}>
                        {statusConfig[o.status].label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(o)}>
                        <EyeIcon className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground">Page {page} sur {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commande {selectedOrder?.id.split('-')[0]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {selectedOrder && (
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border border-border/50">
                <div>
                  <p className="text-muted-foreground mb-1">Date de commande</p>
                  <p className="font-medium">{format(new Date(selectedOrder.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Statut</p>
                  <Badge variant={statusConfig[selectedOrder.status].variant}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Client</p>
                  <p className="font-medium">{selectedOrder.buyer?.full_name || '—'}</p>
                  <p className="text-muted-foreground text-xs">{selectedOrder.buyer?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Vendeur</p>
                  <p className="font-medium">{selectedOrder.seller?.full_name || '—'}</p>
                </div>
              </div>
            )}

            {selectedOrder?.items && selectedOrder.items.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Articles commandés</h3>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="size-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border/50">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PackageIcon className="size-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.product?.name || 'Produit inconnu'}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantité: {item.quantity} × {formatCurrency(item.price_at_time)}
                      </p>
                    </div>
                    <div className="font-semibold whitespace-nowrap">
                      {formatCurrency(item.quantity * item.price_at_time)}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t border-border font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                  <span>Total de la commande</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun article trouvé pour cette commande.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
