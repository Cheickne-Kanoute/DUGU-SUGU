import { Navigate, useSearchParams } from 'react-router-dom';

import { AuthScreen } from '@/components/AuthScreen';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const from = searchParams.get('from') || '/';
    return <Navigate to={from} replace />;
  }

  return <AuthScreen mode="register" />;
}
