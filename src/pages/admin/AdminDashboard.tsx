import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { Package, Users, ShoppingBag, TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { label: t('admin.totalOrders'), value: '1,234', icon: Package, color: 'bg-primary/10 text-primary' },
    { label: t('admin.totalRevenue'), value: formatCurrency(45600000), icon: TrendingUp, color: 'bg-success/10 text-success' },
    { label: t('admin.totalCustomers'), value: '856', icon: Users, color: 'bg-info/10 text-info' },
    { label: t('admin.totalProducts'), value: '128', icon: ShoppingBag, color: 'bg-warning/10 text-warning' },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">{t('admin.dashboard')}</h1>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card p-6 shadow-card">
              <div className={`mb-3 inline-flex rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('admin.ordersByStatus')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('orderStatus.pending')}</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('orderStatus.confirmed')}</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('orderStatus.preparing')}</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('orderStatus.delivered')}</span>
                <span className="font-medium">45</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 font-bold">{t('admin.recentOrders')}</h2>
            <p className="text-muted-foreground text-center py-8">Hiển thị đơn hàng gần đây...</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
