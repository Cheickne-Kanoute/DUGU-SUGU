import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/hooks/useCart';
import { createOrder } from '@/lib/api/orders';
import { createPaiement } from '@/lib/api/paiements';
import { createLivraison } from '@/lib/api/livraisons';
import { sendOrderConfirmationEmail } from '@/lib/api/email';
import { toast } from 'sonner';
import { MapPin, Phone, User, CheckCircle2, CreditCard } from 'lucide-react';

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { items, totalPrice, clearCart, isLoadingCart } = useCart();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    modePaiement: 'livraison' as 'livraison' | 'mobile_money' | 'virement'
  });

  useEffect(() => {
    if (isLoadingCart) return;

    if (!isAuthenticated) {
      navigate('/login');
    } else if (items.length === 0) {
      navigate('/cart');
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || `${user.prenom || ''} ${user.nom || ''}`.trim(),
        phone: user.phone || '',
        address: user.address || user.location || ''
      }));
    }
  }, [isAuthenticated, items.length, navigate, user, isLoadingCart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Veuillez remplir tous les champs de livraison');
      return;
    }

    setIsLoading(true);

    try {
      // Group items by seller
      const itemsBySeller = items.reduce((acc, item) => {
        if (!item.product) return acc;
        const sellerId = item.product.seller_id || item.product.vendeurId || 'default';
        if (!acc[sellerId]) {
          acc[sellerId] = [];
        }
        acc[sellerId].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      // Create order, paiement, & livraison per seller
      const orderPromises = Object.entries(itemsBySeller).map(async ([sellerId, sellerItems]) => {
        const sellerTotal = sellerItems.reduce((sum, item) => {
          return sum + ((item.product?.price || 0) * item.quantity);
        }, 0);

        const orderData = {
          buyer_id: user!.id,
          acheteurId: user!.id,
          seller_id: sellerId,
          vendeurId: sellerId,
          status: 'pending' as const,
          statut: 'pending' as const,
          total: sellerTotal,
          shipping_address: `Nom: ${formData.fullName} | Tél: ${formData.phone} | Adresse: ${formData.address}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const orderItemsData = sellerItems.map(item => ({
          product_id: item.product!.id,
          produitId: item.product!.id,
          quantity: item.quantity,
          quantite: item.quantity,
          price_at_time: item.product!.price,
          prixAuMoment: item.product!.price,
        }));

        const order = await createOrder(orderData as any, orderItemsData as any);

        await createPaiement({
          order_id: order.id,
          montant: sellerTotal,
          mode_paiement: formData.modePaiement,
          statut_paiement: 'en_attente',
        });

        await createLivraison({
          order_id: order.id,
          adresse_livraison: formData.address,
          statut_livraison: 'en_attente',
        });

        // 4. Send email notification
        if (user?.email) {
          sendOrderConfirmationEmail(user.email, order.id, sellerTotal).catch(() => {});
        }

        return order;
      });

      await Promise.all(orderPromises);

      toast.success('Votre commande et paiement ont été enregistrés !');
      clearCart();
      navigate('/dashboard/purchases');
    } catch (error: any) {
      console.error('Erreur lors de la commande:', error);
      toast.error(error?.message || 'Une erreur est survenue lors de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px]">
      <div className="max-w-[1024px] mx-auto px-6 py-8">
        <h1 className="text-2xl lg:text-[32px] font-bold text-[#1a1a1a] mb-8">Finaliser la Commande</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formulaire de livraison & paiement */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-semibold text-[#1a1a1a]">Informations de Livraison</h2>
              
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Nom et Prénom (Acheteur)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888877]">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-[#f8f6f0] border border-[#e0dec8] rounded-xl text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
                      placeholder="Amadou Coulibaly"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Numéro de Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888877]">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-[#f8f6f0] border border-[#e0dec8] rounded-xl text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
                      placeholder="+223 00 00 00 00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                    Adresse de livraison
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none text-[#888877]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-[#f8f6f0] border border-[#e0dec8] rounded-xl text-[#1a1a1a] resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
                      placeholder="Bamako, Quartier, Rue, Porte..."
                    />
                  </div>
                </div>

                {/* Mode de Paiement (PFE Diagramme de classe: modePaiement) */}
                <div className="pt-4 border-t border-[#e0dec8]">
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">
                    Mode de Paiement (PFE)
                  </label>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.modePaiement === 'livraison' ? 'border-[#166534] bg-[#f0fdf4]' : 'border-[#e0dec8] bg-white'}`}>
                      <input
                        type="radio"
                        name="modePaiement"
                        value="livraison"
                        checked={formData.modePaiement === 'livraison'}
                        onChange={() => setFormData({ ...formData, modePaiement: 'livraison' })}
                        className="text-[#166534] focus:ring-[#166534]"
                      />
                      <CreditCard className="w-5 h-5 text-[#166534]" />
                      <div>
                        <p className="font-medium text-sm text-[#1a1a1a]">Paiement à la livraison (Espèces)</p>
                        <p className="text-xs text-[#888877]">Réglez au livreur à la réception des produits</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.modePaiement === 'mobile_money' ? 'border-[#166534] bg-[#f0fdf4]' : 'border-[#e0dec8] bg-white'}`}>
                      <input
                        type="radio"
                        name="modePaiement"
                        value="mobile_money"
                        checked={formData.modePaiement === 'mobile_money'}
                        onChange={() => setFormData({ ...formData, modePaiement: 'mobile_money' })}
                        className="text-[#166534] focus:ring-[#166534]"
                      />
                      <Phone className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm text-[#1a1a1a]">Mobile Money (Orange Money / Moov Money)</p>
                        <p className="text-xs text-[#888877]">Paiement direct par transfert mobile</p>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Résumé de commande */}
          <div className="lg:w-[380px] shrink-0">
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 lg:sticky lg:top-[88px]">
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Résumé de la Commande</h3>

              <div className="max-h-[240px] overflow-y-auto mb-4 pr-2 space-y-3">
                {items.map((item) => item.product && (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={item.product.images?.[0] || ""} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">{item.product.name}</p>
                      <p className="text-xs text-[#888877]">Qté: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[#166534]">
                      {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e0dec8] pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#555544]">Sous-total</span>
                  <span className="font-medium text-[#1a1a1a]">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555544]">Mode de paiement</span>
                  <span className="text-[#166534] font-medium capitalize">{formData.modePaiement.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="border-t border-[#e0dec8] my-4 pt-4">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-[#1a1a1a]">Total à payer</span>
                  <span className="text-xl font-bold text-[#166534]">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <div className="bg-[#e8f5e9] rounded-xl p-4 mb-6 flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
                <p className="text-sm text-[#166534] leading-relaxed">
                  Commande et paiement enregistrés selon le workflow du PFE.
                </p>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isLoading}
                className="w-full h-[52px] rounded-full bg-[#166534] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#14532d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Validation en cours...' : 'Confirmer la Commande'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
