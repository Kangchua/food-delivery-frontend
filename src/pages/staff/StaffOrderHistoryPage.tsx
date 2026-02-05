import React, { useEffect, useState } from 'react';
import { Search, Calendar, TrendingUp, Package, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import staffApi from '@/api/staffApi';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface CompletedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: number;
  createdAt: string;
}

const StaffOrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState('30');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCompletedOrders();
  }, [dayFilter]);

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      const days = parseInt(dayFilter) || 30;
      const response = await staffApi.getCompletedOrders(days);

      if (response.isSuccess && response.data) {
        setOrders(response.data.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          items: order.items || [],
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        })));
      }
    } catch (error: any) {
      console.error('Failed to fetch completed orders:', error);
      toast.error('Không thể tải lịch sử đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 6:
        return { label: 'Đang giao', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 7:
        return { label: 'Hoàn tất', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' };
      case 8:
        return { label: 'Đã hủy', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' };
      default:
        return { label: 'Không xác định', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  // Filter and calculate stats
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search);
    const matchesStatus = statusFilter === 'all' || order.status.toString() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Only count completed orders (status 7) for revenue
  const completedOrders = filteredOrders.filter(o => o.status === 7);

  const stats = {
    total: filteredOrders.length,
    completed: completedOrders.length,
    cancelled: filteredOrders.filter(o => o.status === 8).length,
    revenue: completedOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    avgOrderValue: completedOrders.length > 0 ? Math.round(completedOrders.reduce((sum, o) => sum + o.totalAmount, 0) / completedOrders.length) : 0
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Lịch sử đơn hàng</h1>
          <p className="text-muted-foreground">Xem các đơn hàng đã hoàn tất hoặc bị hủy</p>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-card border shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng đơn</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-primary/30" />
            </div>
          </div>

          <div className="rounded-lg bg-card border shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoàn tất</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600/30" />
            </div>
          </div>

          <div className="rounded-lg bg-card border shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã hủy</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600/30" />
            </div>
          </div>

          <div className="rounded-lg bg-card border shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doanh thu</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600/30" />
            </div>
          </div>

          <div className="rounded-lg bg-card border shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trung bình</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600/30" />
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm mã đơn, tên khách hoặc số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="7">7 ngày</option>
            <option value="30">30 ngày</option>
            <option value="90">90 ngày</option>
            <option value="180">6 tháng</option>
            <option value="365">1 năm</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="7">Hoàn tất</option>
            <option value="8">Đã hủy</option>
            <option value="6">Đang giao</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-lg bg-card border p-8 text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-20" />
              Không có đơn hàng nào phù hợp
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className="rounded-lg bg-card border shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      {/* Header with order code and status */}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color} ${statusInfo.bg}`}>
                          <StatusIcon className="h-4 w-4" />
                          {statusInfo.label}
                        </div>
                        <span className="text-sm text-muted-foreground ml-auto sm:ml-0">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      {/* Customer info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Khách hàng</p>
                          <p className="font-medium">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Số điện thoại</p>
                          <p className="font-medium">{order.customerPhone}</p>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-2">Các món hàng:</p>
                        <div className="bg-background/50 rounded p-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm py-1">
                              <div>
                                <span className="font-medium">{item.productName}</span>
                                <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                              </div>
                              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total amount */}
                      <div className="flex justify-end items-center gap-4 pt-3 border-t">
                        <span className="text-sm text-muted-foreground">Tổng cộng:</span>
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 rounded-lg bg-card border shadow-sm p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tóm tắt trong khoảng thời gian đã chọn
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Số đơn hàng</p>
                <p className="text-2xl font-bold">{filteredOrders.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trung bình/đơn</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.avgOrderValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ hoàn tất</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredOrders.length > 0 ? ((stats.completed / filteredOrders.length) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StaffOrderHistoryPage;
