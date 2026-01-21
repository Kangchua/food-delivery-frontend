import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, ChevronRight, MapPin, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import useTranslation from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: t('auth.logoutSuccess') });
    navigate('/');
  };

  const menuItems = [
    { icon: MapPin, label: 'Địa chỉ giao hàng', path: '/profile/addresses' },
    { icon: Bell, label: 'Thông báo', path: '/profile/notifications' },
    { icon: Shield, label: 'Bảo mật', path: '/profile/security' },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="mb-6 rounded-2xl bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-10 w-10 text-primary" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{user?.fullName}</h1>
              <p className="text-sm text-muted-foreground capitalize">
                {t(`roles.${user?.role}` as const)}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{user?.phone}</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="mb-6 rounded-2xl bg-card shadow-card">
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('auth.logout')}
        </Button>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
