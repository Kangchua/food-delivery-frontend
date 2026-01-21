import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute, AdminRoutes, ShipperRoutes, CustomerRoutes } from "@/routes";
import { UserRole } from "@/types/enum";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Root redirect component
const RootRedirect = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If not authenticated, go to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // If authenticated, redirect based on role
  console.log('DEBUG - RootRedirect:', { user: user.email, role: user.role });
  switch (user.role) {
    case UserRole.ADMIN:
      return <Navigate to="/admin" replace />;
    case UserRole.SHIPPER:
      return <Navigate to="/shipper" replace />;
    case UserRole.CUSTOMER:
    default:
      return <Navigate to="/customer" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <BrowserRouter>
            <Routes>
              {/* Root route - redirect based on auth status and role */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Auth Routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              
              {/* Customer Routes - Protected */}
              <Route path="/customer/*" element={
                <ProtectedRoute>
                  <CustomerRoutes />
                </ProtectedRoute>
              } />
              
              {/* Shipper Routes - Protected */}
              <Route path="/shipper/*" element={
                <ProtectedRoute>
                  <ShipperRoutes />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes - Protected */}
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminRoutes />
                </ProtectedRoute>
              } />
              
              {/* Root level customer routes (for /menu, /cart, etc.) */}
              <Route path="/menu" element={
                <ProtectedRoute>
                  <CustomerRoutes />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CustomerRoutes />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CustomerRoutes />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <CustomerRoutes />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <CustomerRoutes />
                </ProtectedRoute>
              } />
              <Route path="/product/:productId" element={
                <ProtectedRoute>
                  <CustomerRoutes />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
