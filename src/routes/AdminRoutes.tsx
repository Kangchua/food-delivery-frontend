import { Routes, Route, Navigate } from "react-router-dom";
import RoleRoute from "./RoleRoute";
import { UserRole } from "@/types/enum";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UsersManagementPage from "@/pages/admin/UsersManagementPage";
import ProductsManagementPage from "@/pages/admin/ProductsManagementPage";
import CategoriesManagementPage from "@/pages/admin/CategoriesManagementPage";
import OrdersManagementPage from "@/pages/admin/OrdersManagementPage";
import ShippersManagementPage from "@/pages/admin/ShippersManagementPage";
import AssignShipperPage from "@/pages/admin/AssignShipperPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import OrderDetailPageAdmin from "@/pages/admin/OrderDetailPage";
import OrderOutOfStockPage from "@/pages/admin/OrderOutOfStockPage";
import AdminReviewsPage from "@/pages/admin/ReviewManagementPage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<RoleRoute allowedRoles={[UserRole.ADMIN]} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="products" element={<ProductsManagementPage />} />
        <Route path="categories" element={<CategoriesManagementPage />} />
        <Route path="orders" element={<OrdersManagementPage />} />
        <Route path="orders/:id" element={<OrderDetailPageAdmin />} />
        <Route
          path="orders/:id/out-of-stock"
          element={<OrderOutOfStockPage />}
        />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="shippers" element={<ShippersManagementPage />} />
        <Route path="assign-shipper/:orderId" element={<AssignShipperPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
