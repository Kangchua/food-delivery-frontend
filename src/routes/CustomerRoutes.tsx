import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import RoleRoute from "./RoleRoute";
import { UserRole } from "@/types/enum";
import { useAuth } from "@/context/AuthContext";

// Customer Pages
import HomePage from "@/pages/customer/HomePage";
import MenuPage from "@/pages/customer/MenuPage";
import CartPage from "@/pages/customer/CartPage";
import CheckoutPage from "@/pages/customer/CheckoutPage";
import OrdersPage from "@/pages/customer/OrdersPage";
import OrderDetailPage from "@/pages/customer/OrderDetailPage";
import PaymentResultPage from "@/pages/customer/PaymentResultPage";
import ProfilePage from "@/pages/customer/ProfilePage";
import ProductDetailPage from "@/pages/customer/ProductDetailPage";
import AddressesManagementPage from "@/pages/customer/AddressesManagementPage";
import NotificationsPage from "@/pages/customer/NotificationsPage";
import SecurityPage from "@/pages/customer/SecurityPage";
import ReviewHistoryPage from "@/pages/customer/ReviewPage";

const CustomerRoutes = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Handle root-level routes (when accessed from /menu, /cart, etc.)
  const handleRootLevelRoutes = () => {
    const pathname = location.pathname;

    // Routes restricted to customers only
    if (pathname === "/menu" && user?.role !== UserRole.ADMIN)
      return <MenuPage />;
    if (pathname === "/cart" && user?.role !== UserRole.ADMIN)
      return <CartPage />;
    if (pathname.match(/^\/product\//) && user?.role !== UserRole.ADMIN)
      return <ProductDetailPage />;

    if (pathname === "/checkout") return <CheckoutPage />;
    if (pathname === "/profile") return <ProfilePage />;
    if (pathname === "/profile/addresses") return <AddressesManagementPage />;
    if (pathname === "/profile/notifications") return <NotificationsPage />;
    if (pathname === "/profile/security") return <SecurityPage />;
    if (pathname === "/payment-result") return <PaymentResultPage />;

    return null;
  };

  const rootLevelRoute = handleRootLevelRoutes();
  if (rootLevelRoute) {
    return rootLevelRoute;
  }
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={[UserRole.CUSTOMER]} />}>
        {/* Trang chủ */}
        <Route index element={<HomePage />} />

        {/* Các Route phẳng - Không để trong group để khớp với App.tsx */}
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-result" element={<PaymentResultPage />} />

        {/* Xử lý /orders và /orders/:id */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/review" element={<ReviewHistoryPage />} />

        {/* Xử lý Profile */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/profile/addresses"
          element={<AddressesManagementPage />}
        />
        <Route path="/profile/notifications" element={<NotificationsPage />} />
        <Route path="/profile/security" element={<SecurityPage />} />

        {/* Xử lý Sản phẩm */}
        <Route path="/product/:productId" element={<ProductDetailPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default CustomerRoutes;
