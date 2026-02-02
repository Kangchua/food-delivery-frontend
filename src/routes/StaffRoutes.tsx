import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import { UserRole } from '@/types/enum';

// Staff Pages
import StaffDashboard from '@/pages/staff/StaffDashboard';
import StaffOrdersPage from '@/pages/staff/StaffOrdersPage';
import StaffInventoryPage from '@/pages/staff/StaffInventoryPage';

const StaffRoutes = () => {
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={[UserRole.STAFF]} />}>
        <Route index element={<StaffDashboard />} />
        <Route path="orders" element={<StaffOrdersPage />} />
        <Route path="inventory" element={<StaffInventoryPage />} />
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Route>
    </Routes>
  );
};

export default StaffRoutes;
