import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export default function ClientFavoritesPage() {
  const { favorites, isLoading, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
    toast.success('Produit ajouté au panier');
  };

  const handleRemoveFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    try {
      await toggleFavorite(productId);
      toast.success('Produit retiré des favoris');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-[#888877]">Chargement de vos favoris...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes Favoris</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retrouvez ici tous les produits que vous avez sauvegardés.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#e0dec8]/50 p-12 text-center">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#1a1a1a]">Aucun favori</h3>
          <p className="text-sm text-[#888877] mt-2 mb-6">Vous n'avez pas encore ajouté de produit à vos favoris.</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#166534] text-white text-sm font-semibold hover:bg-[#14532d] transition-colors"
          >
            Explorer les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fav) => {
            const product = fav.product;
            if (!product) return null;

            return (
              <div
                key={fav.id}
                className="bg-white rounded-xl shadow-sm border border-[#e0dec8]/50 overflow-hidden flex flex-col h-full"
              >
                <Link to={`/product/${product.id}`} className="block shrink-0 overflow-hidden relative">
                  <img
                    src={product.images?.[0] || ""}
                    alt={product.name}
                    className="w-full h-40 sm:h-48 object-cover transition-transform hover:scale-105 duration-500"
                  />
                  <button
                    onClick={(e) => handleRemoveFavorite(e, product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full text-gray-600 transition-colors shadow-sm z-10"
                    title="Retirer des favoris"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500 transition-colors" />
                  </button>
                </Link>
                <div className="p-3.5 flex flex-col flex-1">
                  <div className="mb-auto">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#e8f5e9] text-[#166534] mb-2">
                      {product.category_id}
                    </span>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-sm sm:text-base font-semibold text-[#1a1a1a] line-clamp-2 leading-snug">{product.name}</h3>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-2.5 mb-2">
                      <span className="text-base sm:text-lg font-bold text-[#166534]">{product.price.toLocaleString('fr-FR')} FCFA</span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 shrink-0">
                        {product.seller?.avatar_url ? (
                          <img src={product.seller.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#166534] flex items-center justify-center text-white text-[9px] font-bold">
                            {(product.seller?.full_name || 'V')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-[#555544] line-clamp-1">{product.seller?.full_name || 'Vendeur'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#166534] text-white text-sm font-semibold hover:bg-[#14532d] transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
