import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOrders, type Order } from "@/lib/api/orders";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardSectionHeader } from "@/components/dashboard/shared/DashboardSectionHeader";
import { OrderStatusBadge } from "@/components/dashboard/shared/OrderStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ReceiptIcon, Loader2Icon, PackageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ClientOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      try {
        const data = await getOrders({ buyerId: user.id });
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardSectionHeader
        title="Mes Commandes"
        description="Retrouvez l'historique complet de vos achats sur la plateforme."
      />

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ReceiptIcon className="size-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune commande</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Vous n'avez pas encore passé de commande. Explorez nos produits pour trouver ce qu'il vous faut !
              </p>
              <Button asChild>
                <a href="/products">Parcourir les produits</a>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendeur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: fr })}
                    </TableCell>
                    <TableCell>
                      {order.seller?.full_name || 'Inconnu'}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(Number(order.total))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Détails de la commande</span>
              <span className="text-sm text-muted-foreground font-normal">
                #{selectedOrder?.id.slice(0, 8)}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de la commande</p>
                  <p>{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Informations Vendeur</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Nom:</span> {selectedOrder.seller?.full_name}</p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedOrder.seller?.email}</p>
                  <p><span className="text-muted-foreground">Téléphone:</span> {selectedOrder.seller?.phone || 'Non renseigné'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Adresse de livraison fournie</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  {selectedOrder.shipping_address}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Articles commandés</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                        {item.product?.images && item.product.images.length > 0 ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover rounded" />
                        ) : (
                          <PackageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product?.name || 'Produit inconnu'}</p>
                        <p className="text-xs text-muted-foreground">Qté: {item.quantity} × {formatCurrency(item.price_at_time)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(item.quantity * item.price_at_time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <span className="font-bold text-lg">Total payé</span>
                <span className="font-bold text-xl text-primary">{formatCurrency(Number(selectedOrder.total))}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
