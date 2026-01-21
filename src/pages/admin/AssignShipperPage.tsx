import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { adminApi } from '@/api/adminApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface Shipper {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  totalDeliveries?: number;
  averageRating?: number;
}

interface Order {
  id: number;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  deliveryAddress?: string;
}

const AssignShipperPage: React.FC = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [selectedShipperId, setSelectedShipperId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const fetchData = async () => {
    if (!orderId) {
      toast.error(t('error.invalidOrder') || 'Invalid order');
      navigate('/admin/orders');
      return;
    }

    try {
      setLoading(true);

      // Fetch order details
      try {
        const orderData = await adminApi.orders.getById(parseInt(orderId));
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        toast.error(t('error.fetchFailed') || 'Failed to fetch order');
      }

      // Fetch available shippers
      try {
        const shippersData = await adminApi.shippers.getAll();
        const shippersList = Array.isArray(shippersData) ? shippersData : shippersData?.data || [];
        // Filter only active shippers
        const activeShippers = shippersList.filter((s: Shipper) => s.isActive);
        setShippers(activeShippers);
      } catch (err) {
        console.error('Error fetching shippers:', err);
        toast.error(t('error.fetchFailed') || 'Failed to fetch shippers');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignShipper = async () => {
    if (!selectedShipperId || !orderId) {
      toast.error(t('validation.selectShipper') || 'Please select a shipper');
      return;
    }

    try {
      setAssigning(true);
      await adminApi.orders.assignShipper(parseInt(orderId), selectedShipperId);
      toast.success(t('admin.shipperAssigned') || 'Shipper assigned successfully');
      navigate('/admin/orders');
    } catch (err) {
      console.error('Error assigning shipper:', err);
      toast.error(t('error.assignFailed') || 'Failed to assign shipper');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Button onClick={() => navigate('/admin/orders')} variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <div className="rounded-lg bg-destructive/10 p-8 text-center">
            <p className="text-lg font-medium text-destructive">
              {t('error.orderNotFound') || 'Order not found'}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate('/admin/orders')} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Order Details */}
          <div className="md:col-span-1">
            <div className="rounded-lg bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold">{t('common.orderDetails')}</h2>
              
              <div className="space-y-3">
                <div className="border-b pb-3">
                  <p className="text-sm text-muted-foreground">{t('common.orderId')}</p>
                  <p className="font-bold">#{order.id}</p>
                </div>

                <div className="border-b pb-3">
                  <p className="text-sm text-muted-foreground">{t('common.customer')}</p>
                  <p className="font-bold">{order.customerName}</p>
                </div>

                <div className="border-b pb-3">
                  <p className="text-sm text-muted-foreground">{t('common.amount')}</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                </div>

                <div className="border-b pb-3">
                  <p className="text-sm text-muted-foreground">{t('common.status')}</p>
                  <span className="inline-block rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                    {order.status}
                  </span>
                </div>

                <div className="pb-3">
                  <p className="text-sm text-muted-foreground">{t('common.date')}</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                {order.deliveryAddress && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">{t('common.deliveryAddress')}</p>
                    <p className="text-sm">{order.deliveryAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipper Selection */}
          <div className="md:col-span-2">
            <div className="rounded-lg bg-card p-6 shadow-card">
              <h2 className="mb-6 text-lg font-bold">{t('admin.selectShipper')}</h2>

              {shippers.length === 0 ? (
                <div className="rounded-lg bg-warning/10 p-8 text-center">
                  <p className="text-warning">{t('admin.noAvailableShippers')}</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {shippers.map((shipper) => (
                    <div
                      key={shipper.id}
                      onClick={() => setSelectedShipperId(shipper.id)}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        selectedShipperId === shipper.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold">{shipper.name}</h3>
                            {selectedShipperId === shipper.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{shipper.email}</p>
                          <p className="text-sm text-muted-foreground">{shipper.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">{t('admin.deliveries')}</p>
                          <p className="font-bold">{shipper.totalDeliveries || 0}</p>
                          {shipper.averageRating && (
                            <>
                              <p className="text-xs text-muted-foreground">{t('admin.rating')}</p>
                              <p className="font-bold">{shipper.averageRating.toFixed(1)} ⭐</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 border-t pt-6">
                <Button
                  onClick={handleAssignShipper}
                  disabled={!selectedShipperId || assigning}
                  className="gradient-primary flex-1 gap-2"
                >
                  <Check className="h-4 w-4" />
                  {assigning ? t('common.assigning') : t('admin.assignShipper')}
                </Button>
                <Button
                  onClick={() => navigate('/admin/orders')}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignShipperPage;
