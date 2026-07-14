import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSectionHeader } from "@/components/dashboard/shared/DashboardSectionHeader";
import { OrderStatusBadge } from "@/components/dashboard/shared/OrderStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { getOrders, updateOrderStatus, type Order } from "@/lib/api/orders";
import { toast } from "sonner";
import { Loader2Icon, PackageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const data = await getOrders({ sellerId: user.id });
        setOrders(data || []);
      } catch (err: any) {
        toast.error(err.message || "Impossible de charger les commandes");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  const handleUpdateStatus = async (orderId: string, newStatus: "shipped" | "cancelled" | "delivered") => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // Mettre à jour la commande sélectionnée si la modale est ouverte
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      toast.success(newStatus === "cancelled" ? "Commande annulée" : "Statut mis à jour");
    } catch (err: any) {
      toast.error(err.message || "Erreur de mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes commandes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez vos commandes, consultez les détails et expédiez les produits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <DashboardSectionHeader
            title="Commandes récentes"
            description="Historique complet des commandes pour votre boutique"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {order.buyer?.full_name || "Client inconnu"}
                      </span>
                      <Badge variant="outline" className="text-[11px]">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>Total: {formatCurrency(Number(order.total))}</span>
                      <span>Commande #{order.id.slice(0, 8)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <OrderStatusBadge status={order.status} className="w-24 justify-center" />
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Détails
                    </Button>

                    {(order.status === "pending" || order.status === "processing") && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, "cancelled")}
                          disabled={updatingId === order.id}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleUpdateStatus(order.id, "shipped")}
                          disabled={updatingId === order.id}
                        >
                          {updatingId === order.id ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Expédier"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
              Aucune commande pour le moment.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[550px]">
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
                <h4 className="font-semibold mb-3">Informations Client</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Nom:</span> {selectedOrder.buyer?.full_name || 'Inconnu'}</p>
                  <p><span className="text-muted-foreground">Email:</span> {selectedOrder.buyer?.email}</p>
                  <p><span className="text-muted-foreground">Téléphone:</span> {selectedOrder.buyer?.phone || 'Non renseigné'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Adresse de livraison</h4>
                <div className="bg-muted p-3 rounded-md text-sm">
                  {selectedOrder.shipping_address || 'Non spécifiée'}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Articles commandés</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover rounded" />
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
                <span className="font-bold text-lg">Total à recevoir</span>
                <span className="font-bold text-xl text-emerald-600">{formatCurrency(Number(selectedOrder.total))}</span>
              </div>

              {/* Actions dans la modale */}
              {(selectedOrder.status === "pending" || selectedOrder.status === "processing") && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")}
                    disabled={updatingId === selectedOrder.id}
                  >
                    Annuler la commande
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                    disabled={updatingId === selectedOrder.id}
                  >
                    {updatingId === selectedOrder.id ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Marquer comme expédiée
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
