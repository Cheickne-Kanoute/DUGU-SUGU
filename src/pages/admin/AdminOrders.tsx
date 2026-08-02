import { useEffect, useState, useCallback } from 'react';
import { getOrders, type Order } from '@/lib/api/orders';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EyeIcon, PackageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  processing: { label: 'En cours', variant: 'outline' },
  shipped: { label: 'Expédiée', variant: 'default' },
  delivered: { label: 'Livrée', variant: 'default' },
  cancelled: { label: 'Annulée', variant: 'destructive' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filteredOrders = orders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Supervision des Commandes</h1>
        <p className="text-sm text-muted-foreground mt-1">Historique et gestion globale des commandes sur Dugu Sugu.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Filtrer par statut" />
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

          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Chargement...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Aucune commande trouvée.</div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Commande</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Acheteur</th>
                    <th className="px-4 py-3">Vendeur</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((o) => {
                    const st = statusConfig[o.status] || statusConfig.pending;
                    return (
                      <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-xs text-muted-foreground">
                          #{o.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {format(new Date(o.created_at || Date.now()), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </td>
                        <td className="px-4 py-3 font-medium">{o.buyer?.full_name || 'Client'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{o.seller?.full_name || 'Vendeur'}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{formatCurrency(o.total)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(o)}>
                            <EyeIcon className="mr-1 size-3.5" /> Détails
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Détails commande #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm pt-2">
              <div className="flex justify-between border-b pb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Acheteur (Client)</p>
                  <p className="font-semibold">{selectedOrder.buyer?.full_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Vendeur (Producteur)</p>
                  <p className="font-semibold">{selectedOrder.seller?.full_name}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-xs text-muted-foreground mb-1">Articles</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id || item.product_id} className="flex items-center justify-between gap-2 bg-muted/40 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <PackageIcon className="size-4 text-muted-foreground" />
                        <span>{item.product?.name || 'Produit'} (x{item.quantity})</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.quantity * item.price_at_time)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-emerald-600">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
