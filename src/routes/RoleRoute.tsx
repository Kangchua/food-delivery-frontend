import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/enum';

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  console.log('DEBUG - RoleRoute check:', { 
    userRole: user.role, 
    allowedRoles, 
    isAllowed: allowedRoles.includes(user.role),
    path: location.pathname 
  });

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects: Record<UserRole, string> = {
      [UserRole.CUSTOMER]: '/customer',
      [UserRole.SHIPPER]: '/shipper',
      [UserRole.ADMIN]: '/admin',
    };
    console.log('DEBUG - RoleRoute redirecting to:', roleRedirects[user.role]);
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleRoute;
