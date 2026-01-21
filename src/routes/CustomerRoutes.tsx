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
    if (pathname === '/payment-result') return <PaymentResultPage />;
    if (pathname.match(/^\/product\/\d+$/)) return <ProductDetailPage />;
    if (pathname.match(/^\/orders\/\d+$/)) return <OrderDetailPage />;
    
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
        <Route path="product/:productId" element={<ProductDetailPage />} />
        <Route path="*" element={<Navigate to="/customer" replace />} />
      </Route>
    </Routes>
  );
};

export default CustomerRoutes;
