import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { updateOrderStatus } from "@/lib/api/orders";
import { createLivraison } from "@/lib/api/livraisons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";
import { OrderStatusBadge } from "../shared/OrderStatusBadge";
import { toast } from "sonner";

interface SellerOrdersFeedProps {
  orders: any[];
}

export function SellerOrdersFeed({ orders }: SellerOrdersFeedProps) {
  const [localOrders, setLocalOrders] = useState(orders);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(value);

  const handleMarkShipped = async (orderId: string) => {
    try {
      setUpdating(orderId);
      await updateOrderStatus(orderId, 'shipped');
      await createLivraison({ order_id: orderId, statut_livraison: 'en_cours' });

      setLocalOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: "shipped" } : order
        )
      );
      toast.success("Commande expédiée (Livraison en cours)");
    } catch (err: any) {
      console.error("Erreur lors du changement de statut:", err);
      toast.error("Impossible de modifier le statut de la commande");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <DashboardSectionHeader
          title="Commandes récents"
          description="Aperçu des dernières commandes nécessitant votre attention"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/orders">Tout voir →</Link>
            </Button>
          }
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {localOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucune commande récente.
          </p>
        ) : (
          localOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card text-card-foreground hover:border-primary/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {formatDistanceToNow(new Date(order.created_at || order.dateCommande || new Date()), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Client: {order.buyer?.full_name || "Client"}</span>
                  <span>•</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(Number(order.total))}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <OrderStatusBadge status={order.status || order.statut} />
                
                {(order.status === "pending" || order.statut === "pending" || order.status === "processing") && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating === order.id}
                    onClick={() => handleMarkShipped(order.id)}
                    className="h-8 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  >
                    {updating === order.id ? "Mise à jour..." : "Expédier"}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
