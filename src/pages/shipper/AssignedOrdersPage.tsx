import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { shipperApi } from '@/api/shipperApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const AssignedOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchAssignedOrders();
  }, [filterStatus]);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const data = await shipperApi.getAssignedOrders({
        status: filterStatus as any,
      });
      const orderList = Array.isArray(data) ? data : data?.data || [];
      setOrders(orderList);
    } catch (err) {
      console.error('Error fetching assigned orders:', err);
      toast.error(t('error.fetchFailed') || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'confirmed':
        return 'bg-info/10 text-info';
      case 'delivery':
        return 'bg-primary/10 text-primary';
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">{t('shipper.assignedOrders') || 'Assigned Orders'}</h1>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 focus:border-primary focus:outline-none"
          >
            <option value="">{t('common.allStatus') || 'All Status'}</option>
            <option value="pending">{t('orderStatus.pending')}</option>
            <option value="confirmed">{t('orderStatus.confirmed')}</option>
            <option value="delivery">{t('orderStatus.delivery')}</option>
            <option value="delivered">{t('orderStatus.delivered')}</option>
          </select>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              {t('common.noData') || 'No orders assigned'}
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-lg bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Order Info */}
                  <div>
                    <p className="text-sm text-muted-foreground">{t('common.orderId')}</p>
                    <p className="font-bold text-lg">#{order.id}</p>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <p className="text-sm text-muted-foreground">{t('common.customer')}</p>
                    <p className="font-medium">{order.customerName}</p>
                    {order.customerPhone && (
                      <Link to={`tel:${order.customerPhone}`}>
                        <Button variant="link" size="sm" className="h-auto p-0 text-sm mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.customerPhone}
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {t('common.deliveryAddress')}
                    </p>
                    <p className="text-sm font-medium line-clamp-2">{order.deliveryAddress}</p>
                  </div>

                  {/* Amount and Status */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('common.amount')}</p>
                      <p className="font-bold text-lg text-primary">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <Link to={`/shipper/orders/${order.id}`} className="flex-1">
                    <Button className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      {t('common.viewDetails')}
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
