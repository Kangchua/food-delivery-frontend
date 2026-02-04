import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Package, TrendingUp, Clock, CheckCircle, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shipperApi } from '@/api/shipperApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

// Import đúng Enum từ file định nghĩa của bạn
import { OrderStatus, getOrderStatusInfo } from '@/types/enum';
import { OrderAdminSummaryResponse } from '@/types/order.type';

interface DashboardStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  deliveryInProgress: number;
  earningToday: number;
  averageRating: number;
}

const ShipperDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderAdminSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [statsRes, ordersRes] = await Promise.all([
        shipperApi.getDashboard(),
        shipperApi.getAssignedOrders()
      ]);
      
      // Handle different response structures from axios
      const statsData = statsRes?.data || null;
      const ordersData = ordersRes?.data || [];
      
      setStats(statsData);
      setRecentOrders(ordersData?.slice(0, 5) || []); // Chỉ lấy 5 đơn gần nhất
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    { label: 'Chờ lấy', value: stats?.pendingDeliveries || 0, icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Đang giao', value: stats?.deliveryInProgress || 0, icon: Package, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Hoàn thành', value: stats?.completedDeliveries || 0, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Thu nhập', value: formatCurrency(stats?.earningToday || 0), icon: TrendingUp, color: 'bg-orange-50 text-orange-600 border-orange-100' },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bảng điều khiển</h1>
            <p className="text-gray-500 text-sm">Chào mừng trở lại, Shipper!</p>
          </div>
          <Button 
            onClick={fetchDashboardData} 
            variant="outline" 
            size="sm" 
            disabled={loading}
            className="rounded-full px-4"
          >
             Làm mới
          </Button>
        </header>

        {loading ? (
          <div className="flex h-80 flex-col items-center justify-center space-y-4">
             <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
             <p className="text-gray-400 text-sm animate-pulse">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat) => (
                <div key={stat.label} className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${stat.color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white/50 rounded-lg">
                        <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xl font-black">{stat.value}</p>
                  <p className="text-[11px] font-bold uppercase opacity-70 tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Orders Section */}
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />
                  Đơn hàng mới nhận
                </h2>
                <Link to="/shipper/orders" className="text-xs font-bold text-orange-600 hover:underline">
                  Xem tất cả
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed">
                  <AlertCircle className="mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-400 font-medium">Bạn chưa được phân công đơn nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    // Ensure status is converted to enum if it's a number
                    const orderStatus = typeof order.status === 'number' ? order.status : parseInt(order.status as any);
                    const statusInfo = getOrderStatusInfo(orderStatus);
                    return (
                      <div key={order.id} className="group flex items-center justify-between p-4 border border-gray-50 rounded-xl hover:border-orange-100 hover:bg-orange-50/30 transition-all">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-sm">#{order.orderCode}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase text-white ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">{order.customerName}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-orange-600">{formatCurrency(order.totalAmount)}</p>
                          </div>
                          <Link to={`/shipper/orders/${order.id}`}>
                            <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-orange-500 group-hover:text-white transition-all">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ShipperDashboard;