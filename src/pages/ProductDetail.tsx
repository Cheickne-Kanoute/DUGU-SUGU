import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Truck, Calendar, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getProductById, type Product } from '@/lib/api/products';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px] flex items-center justify-center">
        <div className="text-center text-[#888877]">Chargement du produit...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Produit non trouvé</h2>
          <Link to="/products" className="text-[#166534] hover:underline mt-4 inline-block">
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  // We skip relatedProducts for now or we could fetch them
  const relatedProducts: Product[] = [];
  const categoryName = product.categories?.name || product.category_id;
  const cartItem = cartItems.find((item) => item.product_id === product.id);
  const activeQuantity = cartItem?.quantity ?? quantity;

  const handleAddToCart = () => {
    addToCart(product.id, activeQuantity);
    toast.success(`${activeQuantity} x ${product.name} ajouté au panier`);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter des favoris');
      return;
    }
    
    try {
      const isFav = await toggleFavorite(product.id);
      if (isFav) {
        toast.success('Produit ajouté aux favoris');
      } else {
        toast.success('Produit retiré des favoris');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification des favoris');
    }
  };

  const handleOrder = () => {
    addToCart(product.id, activeQuantity);
    toast.success('Produit ajouté au panier');
    navigate('/cart');
  };

  return (
    <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-[#888877] mb-6">
          <Link to="/" className="hover:text-[#166534]">Accueil</Link>
          {' > '}
          <Link to="/products" className="hover:text-[#166534]">Produits</Link>
          {' > '}
          <Link to={`/products?category=${product.category_id}`} className="hover:text-[#166534]">{categoryName}</Link>
          {' > '}
          <span className="text-[#1a1a1a]">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left - Image */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>

          {/* Right - Info */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[12px] font-medium bg-[#e8f5e9] text-[#166534]">
              {categoryName}
            </span>

            <div className="flex justify-between items-start mt-4">
              <h1 className="text-2xl lg:text-[32px] font-bold text-[#1a1a1a] pr-4">{product.name}</h1>
              <button
                onClick={handleToggleFavorite}
                className="shrink-0 p-3 bg-white border border-[#e0dec8] hover:bg-[#f8f6f0] rounded-full text-gray-600 transition-colors shadow-sm"
              >
                <Heart 
                  className={`w-6 h-6 transition-colors ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </button>
            </div>

            {/* Seller */}
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                {product.seller?.avatar_url && (
                  <img src={product.seller.avatar_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-sm text-[#1a1a1a]">{product.seller?.full_name}</span>
              <Link to={`/seller/${product.seller_id}`} className="text-sm text-[#166534] hover:underline">
                Voir le profil
              </Link>
            </div>

            {/* Price */}
            <div className="text-3xl lg:text-4xl font-bold text-[#166534] mt-6">
              {product.price.toLocaleString()} FCFA
              <span className="text-base font-normal text-[#888877] ml-2">/ {product.unit}</span>
            </div>

            {/* Description */}
            <p className="text-[15px] text-[#555544] leading-relaxed mt-6">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="mt-6">
              <label className="text-sm font-medium text-[#1a1a1a] mb-2 block">Quantité</label>
              {cartItem ? (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-[#e0dec8] bg-white px-4 py-3">
                  <span className="text-sm text-[#555544]">Déjà dans le panier</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e0dec8] text-[#1a1a1a] hover:bg-[#f8f6f0] transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="min-w-10 text-center text-sm font-medium">{cartItem.quantity}</span>
                    <button
                      onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e0dec8] text-[#1a1a1a] hover:bg-[#f8f6f0] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center border border-[#e0dec8] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#1a1a1a] hover:bg-[#f8f6f0] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-14 h-10 text-center text-sm border-x border-[#e0dec8] outline-none"
                    min={1}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-[#1a1a1a] hover:bg-[#f8f6f0] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-6">
              {!cartItem ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full h-[52px] rounded-full bg-[#166534] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#14532d] transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au Panier
                </button>
              ) : null}
              <button
                onClick={handleOrder}
                className="w-full h-[52px] rounded-full border-2 border-[#166534] bg-white text-[#166534] font-semibold flex items-center justify-center gap-2 hover:bg-[#f8f6f0] transition-colors"
              >
                Commander Maintenant
              </button>
            </div>

            {/* Product Details Table */}
            <div className="mt-8 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { icon: <Calendar className="w-4 h-4" />, label: 'Disponibilité', value: `${product.stock} ${product.unit} en stock` },
                    { icon: <Truck className="w-4 h-4" />, label: 'Livraison', value: 'Disponible' },
                  ].map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? 'bg-[#f8f6f0]' : 'bg-white'}>
                      <td className="px-5 py-3 flex items-center gap-2 text-[#888877]">
                        {row.icon}
                        {row.label}
                      </td>
                      <td className="px-5 py-3 text-[#1a1a1a] font-medium text-right">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-8">Produits Similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 group"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-[#1a1a1a] line-clamp-1">{p.name}</h3>
                    <p className="text-lg font-bold text-[#166534] mt-2">{p.price.toLocaleString()} FCFA</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
