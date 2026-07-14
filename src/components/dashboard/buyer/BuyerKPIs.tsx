import { KPICard } from "../shared/KPICard";
import { BanknoteIcon, PackageIcon, HeartIcon } from "lucide-react";

interface BuyerKPIsProps {
  data: {
    totalSpent: number;
    activeOrders: number;
    favoritesCount: number;
  };
}

export function BuyerKPIs({ data }: BuyerKPIsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <div>
        <KPICard
          label="Mes Achats Totaux"
          value={formatCurrency(data.totalSpent)}
          icon={<BanknoteIcon />}
          variant="revenue"
        />
      </div>
      
      <div>
        <KPICard
          label="Commandes en cours"
          value={data.activeOrders.toLocaleString('fr-FR')}
          icon={<PackageIcon />}
          variant="orders"
        />
      </div>
      
      <div>
        <KPICard
          label="Favoris"
          value={data.favoritesCount.toLocaleString('fr-FR')}
          icon={<HeartIcon className="text-red-500" />}
          variant="default"
        />
      </div>
    </>
  );
}
