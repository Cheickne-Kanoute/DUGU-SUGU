import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingCart, X, Minus, Plus, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getProducts, type Product } from '@/lib/api/products';
import { getCategories, type Category } from '@/lib/api/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: cartItems, addToCart, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const cartItemByProductId = useMemo(
    () => new Map(cartItems.map((item) => [item.product_id, item])),
    [cartItems]
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedProducts, loadedCategories] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Update URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (category !== 'all') params.category = category;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params, { replace: true });
  }, [category, searchQuery, setSearchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== 'all') {
      result = result.filter(p => p.category_id === category);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category_id.toLowerCase().includes(q)
      );
    }

    // Default sorting: newest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [category, searchQuery, products]);

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
    toast.success('Produit ajouté au panier');
  };

  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); // Prevent navigating to product detail
    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter des favoris');
      return;
    }
    
    try {
      const isFav = await toggleFavorite(productId);
      if (isFav) {
        toast.success('Produit ajouté aux favoris');
      } else {
        toast.success('Produit retiré des favoris');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification des favoris');
    }
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

  const clearFilters = () => {
    setCategory('all');
    setSearchQuery('');
  };

  const hasActiveFilters = category !== 'all' || searchQuery;

  return (
    <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px]">
      {/* Page Header */}
      <div className="">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h1 className="text-3xl lg:text-[40px] font-bold text-[#166534]">Tous les Produits</h1>
          <p className="text-[#888877] text-sm mt-3">
            Explorez notre catalogue de produits agricoles frais
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          {/* Search Input */}
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888877]" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 bg-white border-[#e0dec8] focus-visible:ring-[#166534]"
            />
          </div>

          {/* Category Select */}
          <div className="w-full sm:w-[250px]">
            <Select value={category} onValueChange={(val) => setCategory(val || "")}>
              <SelectTrigger className="h-11 bg-white border-[#e0dec8] focus:ring-[#166534]">
                <SelectValue placeholder="Toutes les Catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les Catégories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto sm:ml-auto">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            )}
            <span className="text-sm font-medium text-[#555544] whitespace-nowrap">
              {filteredProducts.length} produit(s)
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-[#166534] font-medium">Chargement des produits...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-[#888877] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1a1a1a]">Aucun produit trouvé</h3>
            <p className="text-sm text-[#888877] mt-2">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const cartItem = cartItemByProductId.get(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm border border-[#e0dec8]/50 overflow-hidden flex flex-col h-full"
                >
                  <Link to={`/product/${product.id}`} className="block shrink-0 overflow-hidden relative">
                    <img
                      src={product.images?.[0] || ""}
                      alt={product.name}
                      className="w-full h-40 sm:h-48 object-cover transition-transform hover:scale-105 duration-500"
                    />
                    {(!user || user.role === 'client') && (
                      <button
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full text-gray-600 transition-colors shadow-sm z-10"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                        />
                      </button>
                    )}
                  </Link>
                  <div className="p-3.5 flex flex-col flex-1">
                    <div className="mb-auto">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#e8f5e9] text-[#166534] mb-2">
                        {product.categories?.name || product.category_id}
                      </span>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-sm sm:text-base font-semibold text-[#1a1a1a] line-clamp-2 leading-snug">{product.name}</h3>
                      </Link>
                      
                      <div className="flex items-center justify-between mt-2.5 mb-2">
                        <span className="text-base sm:text-lg font-bold text-[#166534]">{product.price.toLocaleString()} FCFA</span>
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
                    
                    {(!user || user.role === 'client') && (
                      <div className="mt-2">
                        {cartItem ? (
                          <div className="flex items-center justify-between rounded-full border border-[#e0dec8] bg-[#f8f6f0] px-3 py-2">
                            <span className="text-xs font-medium text-[#555544]">Au panier</span>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-xs"
                                className="w-7 h-7 rounded-full border-[#e0dec8] bg-white"
                                onClick={() => handleDecreaseQuantity(product.id)}
                              >
                                <Minus className="w-3 h-3 text-[#1a1a1a]" />
                              </Button>
                              <span className="min-w-6 text-center text-sm font-semibold">{cartItem.quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-xs"
                                className="w-7 h-7 rounded-full border-[#e0dec8] bg-white text-[#166534]"
                                onClick={() => handleIncreaseQuantity(product.id)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#166534] text-white text-sm font-semibold hover:bg-[#14532d] transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Ajouter au panier
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
