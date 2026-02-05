import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, ClipboardList, User, Truck, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import useTranslation from '@/hooks/useTranslation';

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const { itemCount } = useCart();

  interface NavLink {
    path: string;
    icon: typeof Home;
    label: string;
    badge?: number;
  }

  const customerLinks: NavLink[] = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/cart', icon: ShoppingCart, label: t('nav.cart'), badge: itemCount },
    { path: '/orders', icon: ClipboardList, label: t('nav.orders') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  const shipperLinks: NavLink[] = [
    { path: '/shipper', icon: Truck, label: t('nav.deliveries') },
    { path: '/shipper/history', icon: ClipboardList, label: t('nav.history') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  const adminLinks: NavLink[] = [
    { path: '/admin', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/admin/orders', icon: ClipboardList, label: t('nav.orders') },
    { path: '/admin/products', icon: ShoppingCart, label: t('nav.products') },
    { path: '/admin/users', icon: User, label: t('nav.users') ?? "Khách hàng" },
  ];

  const staffLinks: NavLink[] = [
    { path: '/staff', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/staff/orders', icon: ClipboardList, label: t('nav.orders') },
    { path: '/staff/history', icon: ClipboardList, label: 'Lịch sử' },
    { path: '/staff/reviews', icon: ClipboardList, label: 'Đánh giá' },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  const links = user?.role === 'admin' 
    ? adminLinks 
    : user?.role === 'shipper' 
    ? shipperLinks 
    : user?.role === 'staff'
    ? staffLinks
    : customerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'relative flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {link.badge && link.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </div>
              <span className="font-medium">{link.label}</span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
