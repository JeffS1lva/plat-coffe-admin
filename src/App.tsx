import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AdminLayout } from './layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { StaffPage } from './pages/StaffPage';

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="equipe" element={<StaffPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
