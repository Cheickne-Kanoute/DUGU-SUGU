import { Navigate, useSearchParams } from 'react-router-dom';

import { AuthScreen } from '@/components/AuthScreen';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();

  if (isAuthenticated && user) {
    const from = searchParams.get('from');
    if (from) {
      return <Navigate to={from} replace />;
    }
    const defaultRedirect = user.role === 'admin' ? '/admin/overview' : '/dashboard';
    return <Navigate to={defaultRedirect} replace />;
  }

  return <AuthScreen mode="register" />;
}
