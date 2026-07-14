import { useDashboardSeller } from "@/hooks/useDashboardSeller";
import { DashboardSkeleton } from "../shared/DashboardSkeleton";
import { SellerKPIs } from "./SellerKPIs";
import { SellerRevenueChart } from "./SellerRevenueChart";
import { SellerOrdersFeed } from "./SellerOrdersFeed";
import { SellerLowStock } from "./SellerLowStock";
import { SellerQuickActions } from "./SellerQuickActions";

export default function SellerDashboard() {
  const { data, isLoading, error } = useDashboardSeller();

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
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 gap-4">
        <SellerKPIs data={data.kpis} />
      </div>

      {/* Chart & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SellerRevenueChart data={data.revenueByDay} />
        <SellerQuickActions />
      </div>

      {/* Feed & Low Stock Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SellerOrdersFeed orders={data.recentOrders} />
        <SellerLowStock products={data.lowStockProducts} />
      </div>
    </div>
  );
}
