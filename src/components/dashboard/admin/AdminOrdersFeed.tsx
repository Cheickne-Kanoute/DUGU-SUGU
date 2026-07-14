import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";
import { OrderStatusBadge } from "../shared/OrderStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface AdminOrdersFeedProps {
  orders: any[];
}

export function AdminOrdersFeed({ orders }: AdminOrdersFeedProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="col-span-1 lg:col-span-8">
      <CardHeader>
        <DashboardSectionHeader
          title="Commandes Récentes"
          description="Flux en temps réel de toutes les transactions"
          action={
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors animate-in slide-in-from-top-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {order.buyer?.full_name || 'Client Inconnu'}
                    </span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-sm text-muted-foreground">
                      {order.seller?.full_name || 'Vendeur Inconnu'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(order.total))}
                  </span>
                  <OrderStatusBadge status={order.status} className="w-24 justify-center" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-center bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Aucune commande récente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
