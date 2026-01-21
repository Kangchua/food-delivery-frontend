import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { shipperApi } from '@/api/shipperApi';
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
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

const DeliveryDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [notes, setNotes] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueReason, setIssueReason] = useState('');

  useEffect(() => {
    if (!orderId) {
      navigate('/shipper/orders');
      return;
    }
    fetchOrderDetail();
  }, [orderId, navigate]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const data = await shipperApi.getOrderDetail(parseInt(orderId!));
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      toast.error(t('error.fetchFailed') || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;

    try {
      setConfirming(true);
      await shipperApi.confirmDelivery(order.id, notes || undefined);
      toast.success(t('shipper.deliveryConfirmed') || 'Delivery confirmed');
      navigate('/shipper/orders');
    } catch (err) {
      console.error('Error confirming delivery:', err);
      toast.error(t('error.confirmFailed') || 'Failed to confirm delivery');
    } finally {
      setConfirming(false);
    }
  };

  const handleReportIssue = async () => {
    if (!order || !issueReason) {
      toast.error(t('validation.issueDescriptionRequired'));
      return;
    }

    try {
      setConfirming(true);
      await shipperApi.reportIssue(order.id, issueReason);
      toast.success(t('shipper.issueReported') || 'Issue reported');
      setShowIssueForm(false);
      fetchOrderDetail();
    } catch (err) {
      console.error('Error reporting issue:', err);
      toast.error(t('error.reportFailed') || 'Failed to report issue');
    } finally {
      setConfirming(false);
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
          <Button onClick={() => navigate('/shipper/orders')} variant="ghost" className="mb-6">
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

  const isDelivered = order.status?.toLowerCase() === 'delivered';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate('/shipper/orders')} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Header with Status */}
            <div className="rounded-lg bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('common.orderDetails')} #{order.id}</h1>
                <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                  isDelivered 
                    ? 'bg-success/10 text-success' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('common.orderedOn')}: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Customer Info */}
            <div className="rounded-lg bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold">{t('common.customerInfo')}</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.name')}</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.email')}</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.phone')}</p>
                  <a href={`tel:${order.customerPhone}`} className="text-primary hover:underline">
                    {order.customerPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-lg bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('common.deliveryAddress')}
              </h2>
              <p className="text-lg font-medium">{order.deliveryAddress}</p>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="rounded-lg bg-card p-6 shadow-card">
                <h2 className="mb-4 text-lg font-bold">{t('common.items')}</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Total Amount */}
            <div className="rounded-lg bg-primary/10 p-6">
              <p className="text-sm text-muted-foreground mb-1">{t('common.totalAmount')}</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
            </div>

            {/* Actions */}
            {!isDelivered && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('shipper.deliveryNotes')}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('shipper.noteForCustomer')}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleConfirmDelivery}
                  disabled={confirming}
                  className="gradient-primary w-full gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {confirming ? t('common.confirming') : t('shipper.confirmDelivery')}
                </Button>

                <Button
                  onClick={() => setShowIssueForm(!showIssueForm)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  {t('shipper.reportIssue')}
                </Button>

                {showIssueForm && (
                  <div className="rounded-lg bg-warning/10 p-4 space-y-3">
                    <label className="block text-sm font-medium">{t('shipper.issueDescription')}</label>
                    <textarea
                      value={issueReason}
                      onChange={(e) => setIssueReason(e.target.value)}
                      placeholder={t('shipper.describeProblem')}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReportIssue}
                        disabled={confirming || !issueReason}
                        size="sm"
                        className="gradient-primary flex-1"
                      >
                        {t('common.submit')}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowIssueForm(false);
                          setIssueReason('');
                        }}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isDelivered && (
              <div className="rounded-lg bg-success/10 p-6 text-center">
                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
                <p className="font-bold text-success">{t('shipper.deliveryCompleted')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeliveryDetailPage;
