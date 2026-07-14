import { useDashboardBuyer } from "@/hooks/useDashboardBuyer";
import { DashboardSkeleton } from "../shared/DashboardSkeleton";
import { BuyerKPIs } from "./BuyerKPIs";
import { BuyerOrderHistory } from "./BuyerOrderHistory";
import { BuyerFavorites } from "./BuyerFavorites";
import { BuyerQuickActions } from "./BuyerQuickActions";

export default function BuyerDashboard() {
  const { data, isLoading, error } = useDashboardBuyer();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
        <p className="font-semibold">Erreur lors du chargement de vos données</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-1">
      {/* KPIs Row - 3 equal columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BuyerKPIs data={data.kpis} />
      </div>

      {/* Quick Actions Row - full width */}
      <BuyerQuickActions />

      {/* History & Favorites Row - 2/3 + 1/3 split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BuyerOrderHistory orders={data.recentOrders} />
        </div>
        <div className="lg:col-span-1">
          <BuyerFavorites favorites={data.favorites} />
        </div>
      </div>
    </div>
  );
}
