import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package, Search } from 'lucide-react';
import { getSellers, type Profile } from '@/lib/api/profiles';

export default function Sellers() {
  const [sellers, setSellers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSellers() {
      try {
        const data = await getSellers();
        setSellers(data);
      } catch (error) {
        console.error('Failed to load sellers', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSellers();
  }, []);

  return (
    <div className="relative z-10 bg-[#f8f6f0] min-h-screen pt-[72px]">
      {/* Header */}
      <div className="">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h1 className="text-3xl lg:text-[40px] text-primary">Nos Producteurs</h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-[600px] mx-auto">
            Découvrez les producteurs agricoles de confiance au Mali et achetez directement leurs produits frais.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-10">
        {isLoading ? (
          <div className="text-center py-20 text-primary">Chargement des producteurs...</div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary">Aucun produit trouvé</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map(seller => (
              <Link
                key={seller.id}
                to={`/seller/${seller.id}`}
                className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 group"
              >
                {/* Cover */}
                <div className="h-24 bg-gradient-to-r from-[#166534] to-[#22c55e] relative">
                  <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md bg-[#e8f5e9] flex items-center justify-center">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-[#166534]">
                          {seller.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-12 pb-6 px-6">
                  <h3 className="text-lg font-semibold text-[#1a1a1a]">{seller.full_name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#888877]" />
                    <span className="text-[12px] text-[#888877]">{seller.location || 'Localisation non spécifiée'}</span>
                  </div>

                  <p className="text-[13px] text-[#555544] mt-3 line-clamp-2">{seller.bio}</p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0efe8]">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#166534]" />
                      <span className="text-sm font-medium text-[#1a1a1a]">{seller.product_count} produits</span>
                    </div>
                    <span className="text-sm font-medium text-[#166534] group-hover:underline">Voir le profil &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
