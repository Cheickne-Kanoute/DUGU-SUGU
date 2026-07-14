import { AppShell } from '@/components/app-shell';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
