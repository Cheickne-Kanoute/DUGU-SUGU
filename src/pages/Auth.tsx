import { Navigate, useSearchParams } from 'react-router-dom';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const target = tab === 'register' ? '/register' : '/login';

  return <Navigate to={`${target}${searchParams.get('from') ? `?from=${encodeURIComponent(searchParams.get('from')!)}` : ''}`} replace />;
}
