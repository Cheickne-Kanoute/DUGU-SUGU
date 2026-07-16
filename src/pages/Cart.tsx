import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function Cart() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  if (user && user.role !== 'client') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    
    if (!isAuthenticated) {
      toast.info('Veuillez vous connecter pour passer commande');
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  return (
    <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px]">
      <div className="max-w-[960px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl lg:text-[32px] font-bold text-[#1a1a1a]">Votre Panier</h1>
          <span className="text-[#888877]">({totalItems} article{totalItems > 1 ? 's' : ''})</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <ShoppingBag className="w-16 h-16 text-[#e0dec8] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#1a1a1a]">Votre panier est vide</h2>
            <p className="text-sm text-[#888877] mt-2">Ajoutez des produits pour commencer vos achats</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-[#166534] text-white font-semibold hover:bg-[#14532d] transition-colors"
            >
              Explorer les Produits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {items.map(item => {
                if (!item.product) return null;
                
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                  >
                    <Link to={`/product/${item.product.id}`} className="shrink-0">
                      <img
                        src={item.product.images?.[0] || ""}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="text-base font-semibold text-[#1a1a1a] truncate">{item.product.name}</h3>
                      </Link>
                      <p className="text-[12px] text-[#888877] mt-1">{item.product.seller?.full_name}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-[#e0dec8] flex items-center justify-center text-[#1a1a1a] hover:bg-[#f8f6f0] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-[#e0dec8] flex items-center justify-center text-[#1a1a1a] hover:bg-[#f8f6f0] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-[#166534]">
                        {(item.product.price * item.quantity).toLocaleString()} FCFA
                      </p>
                      <p className="text-[12px] text-[#888877]">{item.product.price.toLocaleString()} FCFA / {item.product.unit}</p>
                    </div>
                    <button
                      onClick={() => { removeItem(item.id); toast.success('Article retiré'); }}
                      className="shrink-0 p-2 text-[#888877] hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}

              <button
                onClick={() => { clearCart(); toast.success('Panier vidé'); }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Vider le panier
              </button>
            </div>

            {/* Summary */}
            <div className="lg:w-[360px] shrink-0">
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 sticky top-[88px]">
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Résumé</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#555544]">Sous-total</span>
                    <span className="font-medium text-[#1a1a1a]">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555544]">Livraison</span>
                    <span className="text-[#888877]">Calculée à l'étape suivante</span>
                  </div>
                </div>

                <div className="border-t border-[#e0dec8] my-4 pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-[#1a1a1a]">Total</span>
                    <span className="text-xl font-bold text-[#166534]">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full h-[52px] rounded-full bg-[#166534] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#14532d] transition-colors"
                >
                  Passer la Commande
                </button>

                <Link
                  to="/products"
                  className="block text-center text-sm text-[#166534] hover:underline mt-4"
                >
                  Continuer les Achats
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
