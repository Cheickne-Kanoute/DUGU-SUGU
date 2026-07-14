import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { Leaf } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRole, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f0]">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-[#166534] mx-auto animate-pulse" />
          <p className="mt-4 text-[#888877] font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`${redirectTo}?from=${location.pathname}`} replace />;
  }

  if (user?.is_blocked) {
    return <Navigate to="/unauthorized?reason=blocked" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (user && !roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
