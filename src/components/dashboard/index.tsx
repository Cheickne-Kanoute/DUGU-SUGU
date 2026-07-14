import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import SellerDashboard from "./seller/SellerDashboard";
import BuyerDashboard from "./buyer/BuyerDashboard";

export default function DashboardWrapper() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'seller':
      return <SellerDashboard />;
    case 'client':
    default:
      return <BuyerDashboard />;
  }
}
