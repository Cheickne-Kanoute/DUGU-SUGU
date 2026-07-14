import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";
import { OrderStatusBadge } from "../shared/OrderStatusBadge";

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
      const { error } = await ((supabase.from("orders") as any)
        .update({ status: "shipped" })
        .eq("id", orderId));

      if (error) throw error;

      setLocalOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: "shipped" } : order
        )
      );
    } catch (err) {
      console.error("Erreur lors de la mise a jour :", err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-8">
      <CardHeader>
        <DashboardSectionHeader
          title="Mes dernieres commandes"
          description="Les transactions recentes de votre boutique"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/orders">Voir toutes</Link>
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {localOrders.length > 0 ? (
          <div className="space-y-4">
            {localOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">
                    {order.buyer?.full_name || "Client inconnu"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(order.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(order.total))}
                  </span>
                  <div className="flex flex-col items-end gap-2">
                    <OrderStatusBadge status={order.status} className="w-24 justify-center" />
                    {(order.status === "pending" || order.status === "processing") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs"
                        onClick={() => handleMarkShipped(order.id)}
                        disabled={updating === order.id}
                      >
                        {updating === order.id ? "Mise a jour..." : "Marquer expedie"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg bg-muted/20 py-8 text-center">
            <p className="text-sm text-muted-foreground">Aucune commande recente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
