import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DashboardSectionHeader } from "../shared/DashboardSectionHeader";

interface BuyerFavoritesProps {
  favorites: any[];
}

export function BuyerFavorites({ favorites }: BuyerFavoritesProps) {
  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <DashboardSectionHeader
          title="Mes Favoris"
          description="Produits que vous avez aimés"
        />
      </CardHeader>
      <CardContent>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {favorites.map((fav) => (
              <a 
                href={`#/product/${fav.product?.id}`}
                key={fav.id} 
                className="group relative flex flex-col border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="aspect-square bg-muted w-full relative">
                  {fav.product?.image ? (
                    <img 
                      src={fav.product.image} 
                      alt={fav.product.name} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-bold text-xl">
                      IMG
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {fav.product?.name || 'Produit inconnu'}
                  </p>
                  <p className="text-[10px] font-bold mt-1 text-muted-foreground">
                    {fav.product?.price ? `${fav.product.price} XOF` : '-'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg h-[240px]">
            <p className="text-sm font-medium text-muted-foreground">
              Aucun favori pour le moment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
