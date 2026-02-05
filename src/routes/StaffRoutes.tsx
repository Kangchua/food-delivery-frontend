import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import { UserRole } from '@/types/enum';

// Staff Pages
import StaffDashboard from '@/pages/staff/StaffDashboard';
import StaffOrdersPage from '@/pages/staff/StaffOrdersPage';
import StaffOrderHistoryPage from '@/pages/staff/StaffOrderHistoryPage';
import StaffReviewsPage from '@/pages/staff/StaffReviewsPage';

const StaffRoutes = () => {
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={[UserRole.STAFF]} />}>
        <Route index element={<StaffDashboard />} />
        <Route path="orders" element={<StaffOrdersPage />} />
        <Route path="history" element={<StaffOrderHistoryPage />} />
        <Route path="reviews" element={<StaffReviewsPage />} />
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Route>
    </Routes>
  );
};

export default StaffRoutes;
