import { Link } from "react-router-dom";
import { AlertTriangleIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";

interface SellerLowStockProps {
  products: any[];
}

export function SellerLowStock({ products }: SellerLowStockProps) {
  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <DashboardSectionHeader
          title="Alertes de stock"
          description="Produits a reapprovisionner"
        />
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => {
              const max = product.low_stock_threshold || 10;
              const pct = Math.min(100, Math.max(0, (product.stock / max) * 100));
              const isCritical = product.stock === 0;

              return (
                <div
                  key={product.id}
                  className="flex flex-col space-y-2 rounded-lg border p-3 transition-colors hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <p className="flex-1 pr-2 text-sm font-medium line-clamp-1">
                      {product.name}
                    </p>
                    {isCritical && (
                      <AlertTriangleIcon className="h-4 w-4 flex-shrink-0 text-destructive animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={isCritical ? "font-bold text-destructive" : "font-medium text-amber-600"}>
                      {product.stock} restants
                    </span>
                    <span className="text-muted-foreground">
                      Seuil: {product.low_stock_threshold}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-1.5 ${isCritical ? "bg-destructive/20 [&>div]:bg-destructive" : "bg-amber-500/20 [&>div]:bg-amber-500"}`}
                  />
                </div>
              );
            })}
            <Button variant="outline" className="w-full text-xs" asChild>
              <Link to="/dashboard/products">Gerer l'inventaire</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted/20 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">Stock optimal</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Aucun produit n'est sous son seuil
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
