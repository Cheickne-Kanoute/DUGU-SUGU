import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";
import { AlertTriangleIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AdminLowStockProps {
  products: any[];
}

export function AdminLowStock({ products }: AdminLowStockProps) {
  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <DashboardSectionHeader
          title="Alertes de Stock"
          description="Produits nécessitant réapprovisionnement"
        />
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => {
              // Calculate percentage based on threshold (capped at 100% just in case)
              // If threshold is 0, we avoid div by 0
              const max = product.low_stock_threshold || 10;
              const pct = Math.min(100, Math.max(0, (product.stock / max) * 100));
              const isCritical = product.stock === 0;

              return (
                <div key={product.id} className="flex flex-col space-y-2 p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.seller?.full_name}</p>
                    </div>
                    {isCritical && (
                      <AlertTriangleIcon className="h-4 w-4 text-destructive animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={isCritical ? "text-destructive font-bold" : "text-amber-600 font-medium"}>
                      {product.stock} restants
                    </span>
                    <span className="text-muted-foreground">
                      Seuil: {product.low_stock_threshold}
                    </span>
                  </div>
                  <Progress value={pct} className={`h-1.5 ${isCritical ? 'bg-destructive/20 [&>div]:bg-destructive' : 'bg-amber-500/20 [&>div]:bg-amber-500'}`} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">
              Aucun stock critique
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
