import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import { UserRole } from '@/types/enum';

// Shipper Pages
import ShipperDashboard from '@/pages/shipper/ShipperDashboard';
import AssignedOrdersPage from '@/pages/shipper/AssignedOrdersPage';
import DeliveryDetailPage from '@/pages/shipper/DeliveryDetailPage';
import DeliveryHistoryPage from '@/pages/shipper/DeliveryHistoryPage';
import NotificationsPage from '@/pages/shipper/NotificationsPage';
import ProfilePage from '@/pages/shipper/ProfilePage';

const ShipperRoutes = () => {
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={[UserRole.SHIPPER]} />}>
        <Route index element={<ShipperDashboard />} />
        <Route path="orders" element={<AssignedOrdersPage />} />
        <Route path="orders/:orderId" element={<DeliveryDetailPage />} />
        <Route path="history" element={<DeliveryHistoryPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/shipper" replace />} />
      </Route>
    </Routes>
  );
};

export default ShipperRoutes;
