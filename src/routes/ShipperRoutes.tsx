import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import { UserRole } from '@/types/enum';

import ShipperDashboard from '@/pages/shipper/ShipperDashboard';
import AssignedOrdersPage from '@/pages/shipper/AssignedOrdersPage';
import DeliveryDetailPage from '@/pages/shipper/DeliveryDetailPage';
import DeliveryHistoryPage from '@/pages/shipper/DeliveryHistoryPage';
import ProfilePage from '@/pages/shipper/ProfilePage';
import ShipperEarningsPage from '@/pages/shipper/ShipperEarningsPage'; 

const ShipperRoutes = () => {
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={[UserRole.SHIPPER]} />}>
        <Route index element={<ShipperDashboard />} />
        
        {/* Quản lý đơn hàng */}
        <Route path="orders" element={<AssignedOrdersPage />} />
        <Route path="orders/:orderId" element={<DeliveryDetailPage />} />
        <Route path="history" element={<DeliveryHistoryPage />} />
        
        {/* Thống kê thu nhập */}
        <Route path="earnings" element={<ShipperEarningsPage />} />

        {/* Thông tin cá nhân */}
        <Route path="profile" element={<ProfilePage />} />

        <Route path="*" element={<Navigate to="/shipper" replace />} />
      </Route>
    </Routes>
  );
};

export default ShipperRoutes;