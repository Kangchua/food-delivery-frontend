import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { shipperApi } from '@/api/shipperApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface HistoryOrder {
  id: number;
  customerName: string;
  deliveryAddress: string;
  totalAmount: number;
  deliveredAt: string;
  createdAt: string;
  deliveryTime?: number; // in minutes
}

const DeliveryHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchDeliveryHistory();
  }, [filterDate]);

  const fetchDeliveryHistory = async () => {
    try {
      setLoading(true);
      const data = await shipperApi.getDeliveryHistory();
      let historyList = Array.isArray(data) ? data : data?.data || [];

      // Filter by date if provided
      if (filterDate) {
        const filterDateObj = new Date(filterDate);
        historyList = historyList.filter((order: HistoryOrder) => {
          const deliveryDate = new Date(order.deliveredAt || order.createdAt);
          return deliveryDate.toDateString() === filterDateObj.toDateString();
        });
      }

      setOrders(historyList);
    } catch (err) {
      console.error('Error fetching delivery history:', err);
      toast.error(t('error.fetchFailed') || 'Failed to fetch delivery history');
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryTime = (createdAt: string, deliveredAt?: string) => {
    const start = new Date(createdAt);
    const end = new Date(deliveredAt || new Date());
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">{t('shipper.deliveryHistory') || 'Delivery History'}</h1>

        {/* Date Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t('common.filterByDate')}</label>
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
            orders.map((order) => {
              const deliveryTime = calculateDeliveryTime(order.createdAt, order.deliveredAt);
              return (
                <div key={order.id} className="rounded-lg bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
                  <div className="grid gap-4 md:grid-cols-5">
                    {/* Order ID */}
                    <div>
                      <p className="text-sm text-muted-foreground">{t('common.orderId')}</p>
                      <p className="font-bold text-lg">#{order.id}</p>
                    </div>

                    {/* Customer */}
                    <div>
                      <p className="text-sm text-muted-foreground">{t('common.customer')}</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <p className="text-sm text-muted-foreground">{t('common.deliveryAddress')}</p>
                      <p className="text-sm font-medium line-clamp-2">{order.deliveryAddress}</p>
                    </div>

                    {/* Delivery Time */}
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {t('shipper.deliveryTime')}
                      </p>
                      <p className="font-medium">{deliveryTime}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.deliveredAt || order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Amount & Action */}
                    <div className="flex flex-col justify-between md:items-end">
                      <p className="font-bold text-lg text-primary">{formatCurrency(order.totalAmount)}</p>
                      <Link to={`/shipper/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 text-xs mt-2">
                          <Eye className="h-3 w-3" />
                          {t('common.view')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        {orders.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">{t('shipper.totalDeliveries')}</p>
              <p className="mt-2 text-3xl font-bold">{orders.length}</p>
            </div>

            <div className="rounded-lg bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">{t('shipper.totalEarnings')}</p>
              <p className="mt-2 text-3xl font-bold text-success">
                {formatCurrency(orders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </p>
            </div>

            <div className="rounded-lg bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">{t('shipper.averageTime')}</p>
              <p className="mt-2 text-3xl font-bold">
                {Math.round(
                  orders.reduce((sum, o) => {
                    const start = new Date(o.createdAt);
                    const end = new Date(o.deliveredAt || o.createdAt);
                    return sum + (end.getTime() - start.getTime());
                  }, 0) / orders.length / (1000 * 60)
                )}{' '}
                min
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DeliveryHistoryPage;
