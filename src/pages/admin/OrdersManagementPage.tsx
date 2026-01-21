import React, { useEffect, useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { adminApi } from '@/api/adminApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

interface DetailModal {
  isOpen: boolean;
  order: Order | null;
}

const OrdersManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<DetailModal>({ isOpen: false, order: null });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.orders.getAll({
        status: statusFilter || undefined,
      });
      const orderList = Array.isArray(data) ? data : data?.data || [];
      // Filter by search if provided
      const filtered = search
        ? orderList.filter(o => 
            o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
            o.id.toString().includes(search)
          )
        : orderList;
      setOrders(filtered);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error(t('error.fetchFailed') || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(true);
      await adminApi.orders.updateStatus(orderId, newStatus);
      toast.success(t('admin.statusUpdated') || 'Status updated');
      fetchOrders();
      setDetail({ isOpen: false, order: null });
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(t('error.updateFailed') || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm(t('admin.confirmCancelOrder') || 'Are you sure?')) return;

    try {
      setUpdating(true);
      await adminApi.orders.cancelOrder(orderId, 'Cancelled by admin');
      toast.success(t('admin.orderCancelled') || 'Order cancelled');
      fetchOrders();
      setDetail({ isOpen: false, order: null });
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error(t('error.cancelFailed') || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'confirmed':
        return 'bg-info/10 text-info';
      case 'preparing':
        return 'bg-blue-100/10 text-blue-600';
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
        <h1 className="mb-6 text-2xl font-bold">{t('admin.ordersManagement') || 'Orders Management'}</h1>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 focus:border-primary focus:outline-none"
          >
            <option value="">{t('common.allStatus') || 'All Status'}</option>
            <option value="pending">{t('orderStatus.pending')}</option>
            <option value="confirmed">{t('orderStatus.confirmed')}</option>
            <option value="preparing">{t('orderStatus.preparing')}</option>
            <option value="delivery">{t('orderStatus.delivery')}</option>
            <option value="delivered">{t('orderStatus.delivered')}</option>
            <option value="cancelled">{t('orderStatus.cancelled')}</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="rounded-lg bg-card shadow-card overflow-hidden">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              {t('common.noData') || 'No orders found'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.orderId')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.customer')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.amount')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.status')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.date')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm font-medium">#{order.id}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium">{order.customerName || '-'}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetail({ isOpen: true, order })}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {t('common.view')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Detail Modal */}
        {detail.isOpen && detail.order && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="max-h-[90vh] max-w-2xl w-full overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{t('common.orderDetails')} #{detail.order.id}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDetail({ isOpen: false, order: null })}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="mb-2 font-bold">{t('common.customerInfo')}</h3>
                  <p><span className="text-muted-foreground">{t('common.name')}:</span> {detail.order.customerName}</p>
                  <p><span className="text-muted-foreground">{t('common.email')}:</span> {detail.order.customerEmail}</p>
                </div>

                {/* Order Items */}
                {detail.order.items && detail.order.items.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h3 className="mb-3 font-bold">{t('common.items')}</h3>
                    <div className="space-y-2">
                      {detail.order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.productName} x {item.quantity}
                          </span>
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="rounded-lg bg-primary/10 p-4">
                  <p className="flex justify-between text-lg font-bold">
                    <span>{t('common.total')}:</span>
                    <span>{formatCurrency(detail.order.totalAmount)}</span>
                  </p>
                </div>

                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t('common.status')}</label>
                  <select
                    defaultValue={detail.order.status}
                    onChange={(e) => {
                      if (e.target.value !== detail.order?.status) {
                        handleUpdateStatus(detail.order!.id, e.target.value);
                      }
                    }}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  >
                    <option value="pending">{t('orderStatus.pending')}</option>
                    <option value="confirmed">{t('orderStatus.confirmed')}</option>
                    <option value="preparing">{t('orderStatus.preparing')}</option>
                    <option value="delivery">{t('orderStatus.delivery')}</option>
                    <option value="delivered">{t('orderStatus.delivered')}</option>
                    <option value="cancelled">{t('orderStatus.cancelled')}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => handleCancelOrder(detail.order!.id)}
                  variant="destructive"
                  disabled={updating || detail.order.status === 'cancelled'}
                  className="flex-1"
                >
                  {t('admin.cancelOrder')}
                </Button>
                <Button
                  onClick={() => setDetail({ isOpen: false, order: null })}
                  variant="outline"
                  className="flex-1"
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersManagementPage;
