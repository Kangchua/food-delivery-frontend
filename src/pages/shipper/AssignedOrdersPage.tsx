import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { shipperApi } from '@/api/shipperApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { OrderAdminSummaryResponse } from '@/types/order.type';
import { OrderStatus, getOrderStatusInfo } from '@/types/enum';

const AssignedOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderAdminSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const response = await shipperApi.getAssignedOrders();
      const ordersData = response?.data || [];
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching assigned orders:', err);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };


  const filteredOrders = orders.filter(order => {
    if (!filterStatus) return true;
    return order.status.toString() === filterStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    const info = getOrderStatusInfo(status);
    return info.color;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">{t('shipper.assignedOrders') || 'Assigned Orders'}</h1>

        {/* Status Filter */}
        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 focus:border-primary focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={OrderStatus.Pending.toString()}>{getOrderStatusInfo(OrderStatus.Pending).label}</option>
            <option value={OrderStatus.Confirmed.toString()}>{getOrderStatusInfo(OrderStatus.Confirmed).label}</option>
            <option value={OrderStatus.Shipping.toString()}>{getOrderStatusInfo(OrderStatus.Shipping).label}</option>
            <option value={OrderStatus.Completed.toString()}>{getOrderStatusInfo(OrderStatus.Completed).label}</option>
          </select>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              {filterStatus ? 'Không có đơn hàng phù hợp với bộ lọc' : 'Không có đơn hàng được giao'}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="rounded-lg bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Order Info */}
                  <div>
                    <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                    <p className="font-bold text-lg">#{order.id}</p>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <p className="text-sm text-muted-foreground">Khách hàng</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>

                  {/* Order Code */}
                  <div>
                    <p className="text-sm text-muted-foreground">Mã giao hàng</p>
                    <p className="font-medium">{order.orderCode}</p>
                  </div>

                  {/* Amount and Status */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Số tiền</p>
                      <p className="font-bold text-lg text-primary">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${getStatusColor(order.status)}`}>
                        {getOrderStatusInfo(order.status).label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <Link to={`/shipper/orders/${order.id}`} className="flex-1">
                    <Button className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignedOrdersPage;
