import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { Package, TrendingUp, Clock, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shipperApi } from '@/api/shipperApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface DashboardStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  deliveryInProgress: number;
  earningToday: number;
  averageRating: number;
}

interface RecentOrder {
  id: number;
  customerName: string;
  deliveryAddress: string;
  status: string;
  totalAmount: number;
}

const ShipperDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      try {
        const dashboardData = await shipperApi.getDashboard();
        setStats(dashboardData);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      }

      // Fetch recent assigned orders
      try {
        const ordersData = await shipperApi.getAssignedOrders();
        const ordersList = (Array.isArray(ordersData) ? ordersData : ordersData?.data || []).slice(0, 5);
        setRecentOrders(ordersList);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      toast.error(t('error.fetchFailed') || 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const defaultStats: DashboardStats = {
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    deliveryInProgress: 0,
    earningToday: 0,
    averageRating: 0,
  };

  const displayStats = stats || defaultStats;

  const statCards = [
    {
      label: t('shipper.pendingDeliveries') || 'Pending',
      value: displayStats.pendingDeliveries,
      icon: Clock,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: t('shipper.inProgress') || 'In Progress',
      value: displayStats.deliveryInProgress,
      icon: Package,
      color: 'bg-info/10 text-info',
    },
    {
      label: t('shipper.completedToday') || 'Completed Today',
      value: displayStats.completedDeliveries,
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
    },
    {
      label: t('shipper.earningToday') || 'Earning Today',
      value: formatCurrency(displayStats.earningToday),
      icon: TrendingUp,
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">{t('shipper.dashboard') || 'Delivery Dashboard'}</h1>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              {statCards.map((stat) => (
                <div key={stat.label} className={`rounded-xl p-6 shadow-card ${stat.color}`}>
                  <div className="mb-3 inline-block rounded-lg bg-white/20 p-3">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-75">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Overall Stats */}
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-card p-6 shadow-card">
                <h3 className="mb-3 font-bold">{t('shipper.totalDeliveries') || 'Total Deliveries'}</h3>
                <p className="text-4xl font-bold text-primary">{displayStats.totalDeliveries}</p>
                <p className="text-sm text-muted-foreground">
                  {t('shipper.completed')}: {displayStats.completedDeliveries}
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-card">
                <h3 className="mb-3 font-bold">{t('shipper.rating') || 'Your Rating'}</h3>
                <p className="text-4xl font-bold text-warning">
                  {displayStats.averageRating.toFixed(1)} ⭐
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('shipper.basedonDeliveries', { count: displayStats.totalDeliveries })}
                </p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="rounded-lg bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t('shipper.recentOrders') || 'Recent Orders'}</h2>
                <Link to="/shipper/orders">
                  <Button size="sm" variant="outline">
                    {t('common.viewAll')}
                  </Button>
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="flex min-h-48 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 opacity-50" />
                    <p>{t('shipper.noRecentOrders') || 'No recent orders'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-bold">Order #{order.id}</p>
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                            order.status === 'pending' ? 'bg-warning/10 text-warning' :
                            order.status === 'delivery' ? 'bg-info/10 text-info' :
                            'bg-success/10 text-success'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {order.deliveryAddress}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                        </div>
                        <Link to={`/shipper/orders/${order.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link to="/shipper/orders">
                <Button className="gradient-primary w-full">
                  {t('shipper.viewAllOrders') || 'View All Orders'}
                </Button>
              </Link>
              <Link to="/shipper/history">
                <Button variant="outline" className="w-full">
                  {t('shipper.deliveryHistory') || 'Delivery History'}
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                {t('shipper.contactSupport') || 'Contact Support'}
              </Button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ShipperDashboard;
