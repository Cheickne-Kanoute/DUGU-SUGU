import { KPICard } from "../shared/KPICard";
import { 
  BanknoteIcon, 
  ShoppingCartIcon, 
  StoreIcon, 
  UsersIcon, 
  UserPlusIcon, 
  RefreshCcwIcon 
} from "lucide-react";

interface AdminKPIsProps {
  data: {
    totalRevenue: number;
    totalOrders: number;
    activeSellers: number;
    totalClients: number;
    pendingRequests: number;
    cancellationRate: number;
  };
}

export function AdminKPIs({ data }: AdminKPIsProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF', // Assuming CFA for Senegal, can be adjusted
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <div className="col-span-1 md:col-span-1 lg:col-span-2">
        <KPICard
          label="Chiffre d'affaires"
          value={formatCurrency(data.totalRevenue)}
          icon={<BanknoteIcon />}
          variant="revenue"
          hint="Total des ventes réalisées"
        />
      </div>
      
      <div className="col-span-1 md:col-span-1 lg:col-span-2">
        <KPICard
          label="Commandes"
          value={data.totalOrders.toLocaleString('fr-FR')}
          icon={<ShoppingCartIcon />}
          variant="orders"
          hint="Total des commandes passées"
        />
      </div>
      
      <div className="col-span-1 md:col-span-1 lg:col-span-2">
        <KPICard
          label="Vendeurs Actifs"
          value={data.activeSellers.toLocaleString('fr-FR')}
          icon={<StoreIcon />}
          variant="positive"
          hint="Vendeurs inscrits sur la plateforme"
        />
      </div>
      
      <div className="col-span-1 md:col-span-1 lg:col-span-2">
        <KPICard
          label="Clients"
          value={data.totalClients.toLocaleString('fr-FR')}
          icon={<UsersIcon />}
          variant="default"
          hint="Acheteurs inscrits"
        />
      </div>
      
      <div className="col-span-1 md:col-span-1 lg:col-span-2">
        <KPICard
          label="Demandes Vendeur"
          value={data.pendingRequests.toLocaleString('fr-FR')}
          icon={<UserPlusIcon />}
          variant={data.pendingRequests > 0 ? "warning" : "default"}
          hint="Demandes en attente"
          badge={data.pendingRequests > 0 ? { text: "Nouveau", pulse: true } : undefined}
        />
      </div>
      
      <div className="col-span-1 md:col-span-1 lg:col-span-2">
        <KPICard
          label="Taux d'annulation"
          value={`${data.cancellationRate.toFixed(1)}%`}
          icon={<RefreshCcwIcon />}
          variant={data.cancellationRate > 10 ? "danger" : "default"}
          hint="Commandes annulées / total"
        />
      </div>
    </>
  );
}
