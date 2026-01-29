import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuth } from '@/context/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideBottomNav: propHideBottomNav }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAdminOrShipper = location.pathname.startsWith('/admin') || location.pathname.startsWith('/shipper');
  const hideBottomNav = propHideBottomNav ?? isAdminOrShipper;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={isAuthenticated && !hideBottomNav ? 'pb-20 md:pb-0' : ''}>
        {children}
      </main>
      {isAuthenticated && !hideBottomNav && <BottomNav />}
    </div>
  );
};

export default MainLayout;
