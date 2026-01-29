import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Package, TrendingUp, Clock, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import shipperApi from '@/api/shipperApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

// 1. Interface chuẩn cho Dashboard
interface DashboardStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  deliveryInProgress: number;
  earningToday: number;
  averageRating: number;
}

// 2. Hàm bổ trợ - Đã được đưa ra ngoài để tối ưu và không bị mờ
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-600';
    case 'Cancelled': return 'bg-red-100 text-red-600';
    case 'Shipping': return 'bg-blue-100 text-blue-600';
    case 'Pending': return 'bg-yellow-100 text-yellow-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const ShipperDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi API thật
        const [statsRes, ordersRes] = await Promise.all([
          shipperApi.getDashboard(),
          shipperApi.getAssignedOrders()
        ]);

        setStats(statsRes);
        const ordersList = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || []);
        setRecentOrders(ordersList.slice(0, 5));

      } catch (err) {
        console.error('Lỗi Dashboard:', err);
        toast.error('Không thể tải dữ liệu bảng điều khiển.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Giá trị mặc định
  const displayStats = stats || {
    totalDeliveries: 0, completedDeliveries: 0, pendingDeliveries: 0,
    deliveryInProgress: 0, earningToday: 0, averageRating: 5
  };

  const statCards = [
    { label: 'Chờ lấy hàng', value: displayStats.pendingDeliveries, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Đang giao', value: displayStats.deliveryInProgress, icon: Package, color: 'bg-blue-100 text-blue-700' },
    { label: 'Hoàn thành', value: displayStats.completedDeliveries, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { label: 'Thu nhập hôm nay', value: formatCurrency(displayStats.earningToday), icon: TrendingUp, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Bảng điều khiển Shipper</h1>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              {statCards.map((stat) => (
                <div key={stat.label} className={`rounded-xl p-6 shadow-sm ${stat.color}`}>
                  <div className="mb-3 inline-block rounded-lg bg-white/50 p-3">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-80">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Đơn hàng mới gán</h2>
                <Link to="/shipper/orders">
                  <Button size="sm" variant="outline">Xem tất cả</Button>
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-400">Không có đơn hàng nào.</div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold">Đơn #{order.id?.toString().slice(0, 8)}</p>
                          
                          {/* ĐÃ SỬA: Gọi hàm getStatusColor ở đây để nó hết mờ và hiển thị màu chuẩn */}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          
                        </div>
                        <p className="text-sm text-gray-600">{order.customerName || 'Khách lẻ'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                        <Link to={`/shipper/orders/${order.id}`}>
                          <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ShipperDashboard;