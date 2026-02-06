import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { shipperApi } from '@/api/shipperApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { OrderDetailResponse } from '@/types/order.type';
import { OrderStatus, getOrderStatusInfo } from '@/types/enum';

const DeliveryDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPickup, setConfirmingPickup] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [accepting, setAccepting] = useState(false);
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
      const response = await shipperApi.getOrderById(orderId!);
      const orderData = response?.data || null;
      setOrder(orderData);
    } catch (err) {
      console.error('Error fetching order:', err);
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!order) return;

    try {
      setConfirmingPickup(true);
      await shipperApi.confirmPickup(order.orderId);
      toast.success('Xác nhận lấy hàng thành công');
      fetchOrderDetail();
    } catch (err) {
      console.error('Error confirming pickup:', err);
      toast.error('Xác nhận lấy hàng thất bại');
    } finally {
      setConfirmingPickup(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!order) return;

    try {
      setAccepting(true);
      await shipperApi.acceptOrder(order.orderId);
      toast.success('Đã nhận đơn hàng thành công');
      fetchOrderDetail();
    } catch (err) {
      console.error('Error accepting order:', err);
      toast.error('Nhận đơn hàng thất bại');
    } finally {
      setAccepting(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;

    try {
      setConfirming(true);
      await shipperApi.deliverySuccess(order.orderId);
      toast.success('Xác nhận giao hàng thành công');
      fetchOrderDetail();
    } catch (err) {
      console.error('Error confirming delivery:', err);
      toast.error('Xác nhận giao hàng thất bại');
    } finally {
      setConfirming(false);
    }
  };

  const handleReportIssue = async () => {
    if (!order || !issueReason) {
      toast.error('Vui lòng nhập lý do giao hàng thất bại');
      return;
    }

    try {
      setConfirming(true);
      await shipperApi.deliveryFailed(order.orderId, issueReason);
      toast.success('Đã báo cáo vấn đề giao hàng');
      setShowIssueForm(false);
      fetchOrderDetail();
    } catch (err) {
      console.error('Error reporting issue:', err);
      toast.error('Báo cáo vấn đề thất bại');
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
              Không tìm thấy đơn hàng
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isDelivered = order?.currentStatus === OrderStatus.Completed;

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
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.orderCode}</h1>
                <span className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                  isDelivered 
                    ? 'bg-success/10 text-success' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {getOrderStatusInfo(order.currentStatus).label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ngày đặt hàng: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>

            {/* Customer Info */}
            <div className="rounded-lg bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold">Thông tin khách hàng</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Tên khách hàng</p>
                  <p className="font-medium">{order.receiverName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <a href={`tel:${order.receiverPhone}`} className="text-primary hover:underline">
                    {order.receiverPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-lg bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </h2>
              <p className="text-lg font-medium">{order.shippingAddress}</p>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="rounded-lg bg-card p-6 shadow-card">
                <h2 className="mb-4 text-lg font-bold">Sản phẩm</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.totalPrice)}</p>
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
              <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
            </div>

            {/* Actions */}
            {order.currentStatus === OrderStatus.ReadyForPickup && !order.shipperId && (
              <div className="space-y-3">
                <Button
                  onClick={handleAcceptOrder}
                  disabled={accepting}
                  className="gradient-primary w-full gap-2"
                >
                  <Check className="h-4 w-4" />
                  {accepting ? 'Đang nhận...' : 'Nhận đơn hàng'}
                </Button>
              </div>
            )}

            {order.currentStatus === OrderStatus.ReadyForPickup && order.shipperId && (
              <div className="space-y-3">
                <Button
                  onClick={handleConfirmPickup}
                  disabled={confirmingPickup}
                  className="gradient-primary w-full gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {confirmingPickup ? 'Đang xác nhận...' : 'Xác nhận lấy hàng'}
                </Button>
              </div>
            )}

            {order.currentStatus === OrderStatus.Shipping && (
              <div className="space-y-3">
                <Button
                  onClick={handleConfirmDelivery}
                  disabled={confirming}
                  className="gradient-primary w-full gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {confirming ? 'Đang xác nhận...' : 'Xác nhận giao hàng'}
                </Button>

                <Button
                  onClick={() => setShowIssueForm(!showIssueForm)}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Báo cáo vấn đề
                </Button>

                {showIssueForm && (
                  <div className="rounded-lg bg-warning/10 p-4 space-y-3">
                    <label className="block text-sm font-medium">Mô tả vấn đề giao hàng</label>
                    <textarea
                      value={issueReason}
                      onChange={(e) => setIssueReason(e.target.value)}
                      placeholder="Nhập lý do giao hàng thất bại..."
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
                <p className="font-bold text-success">Giao hàng đã hoàn thành</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeliveryDetailPage;
