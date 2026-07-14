import { KPICard } from "../shared/KPICard";
import { BanknoteIcon, ShoppingCartIcon, PackageSearchIcon } from "lucide-react";

interface SellerKPIsProps {
  data: {
    myRevenue: number;
    myOrders: number;
    pendingOrders: number;
    myRating: number;
  };
}

export function SellerKPIs({ data }: SellerKPIsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <div className="col-span-1 md:col-span-1 lg:col-span-4">
        <KPICard
          label="Mon Chiffre d'affaires"
          value={formatCurrency(data.myRevenue)}
          icon={<BanknoteIcon />}
          variant="revenue"
        />
      </div>
      
      <div className="col-span-1 md:col-span-1 lg:col-span-4">
        <KPICard
          label="Mes Commandes"
          value={data.myOrders.toLocaleString('fr-FR')}
          icon={<ShoppingCartIcon />}
          variant="orders"
        />
      </div>
      
      <div className="col-span-1 md:col-span-1 lg:col-span-4">
        <KPICard
          label="À Traiter"
          value={data.pendingOrders.toLocaleString('fr-FR')}
          icon={<PackageSearchIcon />}
          variant={data.pendingOrders > 0 ? "warning" : "default"}
          badge={data.pendingOrders > 0 ? { text: "Action req", pulse: true } : undefined}
        />
      </div>
    </>
  );
}
