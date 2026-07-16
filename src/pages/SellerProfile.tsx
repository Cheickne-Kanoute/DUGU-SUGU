import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, ShoppingCart, MessageCircle, Minus, Plus, Package } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { getSellerById, type Profile } from '@/lib/api/profiles';
import { getProducts, type Product } from '@/lib/api/products';
import { Button } from '@/components/ui/button';

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  
  const [seller, setSeller] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cartItemByProductId = new Map(cartItems.map((item) => [item.product_id, item]));

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [sellerData, productsData] = await Promise.all([
          getSellerById(id),
          getProducts({ sellerId: id })
        ]);
        setSeller(sellerData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load seller details', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px] flex items-center justify-center">
        <div className="text-center text-[#888877]">Chargement du profil...</div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Vendeur non trouvé</h2>
          <Link to="/sellers" className="text-[#166534] hover:underline mt-4 inline-block">
            Voir tous les producteurs
          </Link>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const whatsappUrl = seller.phone
    ? `https://wa.me/${seller.phone.replace(/\D/g, '')}`
    : null;

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
    toast.success('Produit ajouté au panier');
  };

  const handleIncreaseQuantity = (productId: string) => {
    const cartItem = cartItemByProductId.get(productId);
    if (!cartItem) {
      handleAddToCart(productId);
      return;
    }
    void updateQuantity(cartItem.id, cartItem.quantity + 1);
  };

  const handleDecreaseQuantity = (productId: string) => {
    const cartItem = cartItemByProductId.get(productId);
    if (!cartItem) return;
    void updateQuantity(cartItem.id, cartItem.quantity - 1);
  };

  return (
    <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#166534] to-[#22c55e] relative" />
          <div className="px-8 pb-10 flex flex-col items-center text-center">
            {/* Avatar avec initiales */}
            <div className="relative -mt-16 mb-4 flex-shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-[#e8f5e9] flex items-center justify-center overflow-hidden mx-auto">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[#166534]">{getInitials(seller.full_name)}</span>
                )}
              </div>
            </div>

            {/* Nom et Badge */}
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1a1a1a]">{seller.full_name}</h1>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#166534] text-white">
                Vendeur Vérifié
              </span>
            </div>
            
            {seller.bio && (
              <p className="text-[15px] text-[#555544] max-w-[500px] mt-4">{seller.bio}</p>
            )}

            {/* Infos et Stats */}
            <div className="flex flex-wrap justify-center items-center gap-6 mt-6 pt-6 border-t border-[#f0efe8] w-full max-w-lg text-sm">
              <div className="flex items-center gap-2 text-[#555544]">
                <MapPin className="w-4 h-4 text-[#888877]" />
                <span>{seller.location || 'Localisation non spécifiée'}</span>
              </div>

              {seller.phone && (
                <div className="flex items-center gap-2 text-[#555544]">
                  <Phone className="w-4 h-4 text-[#888877]" />
                  <span>{seller.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[#555544]">
                <Package className="w-4 h-4 text-[#888877]" />
                <span className="font-semibold">{seller.product_count} Produits</span>
              </div>
            </div>

            {/* Bouton WhatsApp */}
            <div className="mt-8">
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  Contacter via WhatsApp
                </a>
              ) : (
                <button
                  onClick={() => toast.info('Numéro non disponible')}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#166534] text-white font-medium hover:bg-[#14532d] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contacter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Produits de {seller.full_name}</h2>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <p className="text-[#888877]">Aucun produit disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => {
                const cartItem = cartItemByProductId.get(product.id);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 group"
                  >
                    <Link to={`/product/${product.id}`} className="block overflow-hidden">
                      <img
                        src={product.images?.[0] || ""}
                        alt={product.name}
                        className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-base font-semibold text-[#1a1a1a] line-clamp-1">{product.name}</h3>
                      </Link>
                      <p className="text-lg font-bold text-[#166534] mt-2">{product.price.toLocaleString('fr-FR')} FCFA</p>
                      {cartItem ? (
                        <div className="mt-3 flex items-center justify-between rounded-full border border-[#e0dec8] bg-[#f8f6f0] px-3 py-2">
                          <span className="text-xs text-[#888877]">Dans le panier</span>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              className="border-[#e0dec8] bg-white"
                              onClick={() => handleDecreaseQuantity(product.id)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="min-w-8 text-center text-sm font-medium">{cartItem.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              className="border-[#e0dec8] bg-white"
                              onClick={() => handleIncreaseQuantity(product.id)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : null}
                      {!cartItem ? (
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#166534] text-white text-sm font-medium hover:bg-[#14532d] transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Ajouter au panier
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
