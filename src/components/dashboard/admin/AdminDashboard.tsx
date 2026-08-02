import { useDashboardAdmin } from "@/hooks/useDashboardAdmin";
import { DashboardSkeleton } from "../shared/DashboardSkeleton";
import { AdminKPIs } from "./AdminKPIs";
import { AdminRevenueChart } from "./AdminRevenueChart";
import { AdminSellersTable } from "./AdminSellersTable";
import { AdminOrdersFeed } from "./AdminOrdersFeed";
import { AdminLowStock } from "./AdminLowStock";

export default function AdminDashboard() {
  const { data, isLoading, error } = useDashboardAdmin();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
        <p className="font-semibold">Erreur lors du chargement des données</p>
        <p className="text-sm mt-1">{typeof error === 'string' ? error : (error as any)?.message || 'Erreur inconnue'}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 gap-4">
        <AdminKPIs data={data.kpis} />
      </div>

      {/* Chart & Sellers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AdminRevenueChart data={data.revenueByDay} />
        <AdminSellersTable topSellers={data.topSellers} />
      </div>

      {/* Feed & Low Stock Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AdminOrdersFeed orders={data.recentOrders} />
        <AdminLowStock products={data.lowStockProducts} />
      </div>
    </div>
  );
}
