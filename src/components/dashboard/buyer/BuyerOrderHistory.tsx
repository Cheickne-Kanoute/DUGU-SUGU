import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";
import { OrderStatusBadge } from "../shared/OrderStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ReceiptIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface BuyerOrderHistoryProps {
  orders: any[];
}

export function BuyerOrderHistory({ orders }: BuyerOrderHistoryProps) {
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
          title="Historique d'Achats"
          description="Vos commandes récentes"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/purchases">Tout voir</Link>
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center shrink-0 text-muted-foreground">
                    <ReceiptIcon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">
                      Vendeur: {order.seller?.full_name || 'Inconnu'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(Number(order.total))}
                  </span>
                  <OrderStatusBadge status={order.status} className="w-24 justify-center" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Vous n'avez passé aucune commande</p>
            <Button variant="link" className="mt-2 text-primary" asChild>
              <Link to="/products">Découvrir nos produits</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
