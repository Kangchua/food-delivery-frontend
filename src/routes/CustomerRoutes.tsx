import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import { UserRole } from '@/types/enum';

// Customer Pages
import HomePage from '@/pages/customer/HomePage';
import MenuPage from '@/pages/customer/MenuPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrdersPage from '@/pages/customer/OrdersPage';
import OrderDetailPage from '@/pages/customer/OrderDetailPage';
import PaymentResultPage from '@/pages/customer/PaymentResultPage';
import ProfilePage from '@/pages/customer/ProfilePage';
import ProductDetailPage from '@/pages/customer/ProductDetailPage';
import AddressesManagementPage from '@/pages/customer/AddressesManagementPage';
import NotificationsPage from '@/pages/customer/NotificationsPage';
import SecurityPage from '@/pages/customer/SecurityPage';

const CustomerRoutes = () => {
  const location = useLocation();

  // Handle root-level routes (when accessed from /menu, /cart, etc.)
  const handleRootLevelRoutes = () => {
    const pathname = location.pathname;
    
    if (pathname === '/menu') return <MenuPage />;
    if (pathname === '/cart') return <CartPage />;
    if (pathname === '/checkout') return <CheckoutPage />;
    if (pathname === '/orders') return <OrdersPage />;
    if (pathname === '/profile') return <ProfilePage />;
    if (pathname === '/profile/addresses') return <AddressesManagementPage />;
    if (pathname === '/profile/notifications') return <NotificationsPage />;
    if (pathname === '/profile/security') return <SecurityPage />;
    if (pathname === '/payment-result') return <PaymentResultPage />;
    if (pathname.match(/^\/product\//)) return <ProductDetailPage />;
    if (pathname.match(/^\/orders\/[a-f0-9\-]+$/i)) return <OrderDetailPage />;
    
    return null;
  };

  const rootLevelRoute = handleRootLevelRoutes();
  if (rootLevelRoute) {
    return rootLevelRoute;
  }

  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={[UserRole.CUSTOMER]} />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="payment-result" element={<PaymentResultPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/addresses" element={<AddressesManagementPage />} />
        <Route path="profile/notifications" element={<NotificationsPage />} />
        <Route path="profile/security" element={<SecurityPage />} />
        <Route path="product/:productId" element={<ProductDetailPage />} />
        <Route path="*" element={<Navigate to="/customer" replace />} />
      </Route>
    </Routes>
  );
};

export default CustomerRoutes;
