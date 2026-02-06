import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { shipperApi } from '@/api/shipperApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { OrderAdminSummaryResponse } from '@/types/order.type';
import { OrderStatus, getOrderStatusInfo } from '@/types/enum';

const DeliveryHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderAdminSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchDeliveryHistory();
  }, [filterDate]);

  const fetchDeliveryHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await shipperApi.getHistory(user.id);
      const ordersData = response?.data || [];
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching delivery history:', err);
      toast.error('Không thể tải lịch sử giao hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">{t('shipper.deliveryHistory') || 'Delivery History'}</h1>

        {/* Date Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Lọc theo ngày</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        {/* History List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              {t('common.noData') || 'No deliveries in history'}
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-lg bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Order Code */}
                  <div>
                    <p className="text-sm text-muted-foreground">Mã giao hàng</p>
                    <p className="font-bold text-lg">#{order.orderCode}</p>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-sm text-muted-foreground">Khách hàng</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${getOrderStatusInfo(order.status).color}`}>
                      {getOrderStatusInfo(order.status).label}
                    </span>
                  </div>

                  {/* Amount & Action */}
                  <div className="flex flex-col justify-between md:items-end">
                    <p className="font-bold text-lg text-primary">{formatCurrency(order.totalAmount)}</p>
                    <Link to={`/shipper/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="gap-1 text-xs mt-2">
                        <Eye className="h-3 w-3" />
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">Tổng giao hàng</p>
              <p className="mt-2 text-3xl font-bold">{orders.length}</p>
            </div>

            <div className="rounded-lg bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">Tổng thu nhập</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {formatCurrency(orders.reduce((sum, o) => sum + (typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : o.totalAmount || 0), 0))}
              </p>
            </div>


          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DeliveryHistoryPage;
