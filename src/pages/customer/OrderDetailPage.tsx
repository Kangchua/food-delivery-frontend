import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Phone, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import OrderStatusBadge from '@/components/common/OrderStatusBadge';
import { OrderTimeline } from '@/components/customer/OrderTimeline';
import { orderApi } from '@/api/orderApi';
import useTranslation from '@/hooks/useTranslation';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/api/orderApi';

const OrderDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const data = await orderApi.getById(id);
        setOrder(data);
      } catch (error: any) {
        toast({ 
          title: error instanceof Error ? error.message : 'Không thể tải đơn hàng',
          variant: 'destructive' 
        });
        navigate('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate, toast]);

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;

    setIsSubmitting(true);
    try {
      const updated = await orderApi.cancel(order.id);
      setOrder(updated);
      toast({ title: 'Đơn hàng đã được hủy' });
    } catch (error: any) {
      toast({ 
        title: error instanceof Error ? error.message : 'Lỗi khi hủy đơn',
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-muted" />
            <div className="h-64 rounded bg-muted" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/orders')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">#{order.orderNumber}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          {order.status === 'pending' && (
            <Button 
              variant="destructive"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Hủy đơn'}
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Timeline */}
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h2 className="mb-4 font-bold">Trạng thái đơn hàng</h2>
              <OrderTimeline statusHistory={order.statusHistory} />
            </div>

            {/* Items */}
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <Package className="h-5 w-5" />
                Chi tiết đơn hàng
              </h2>
              <div className="space-y-3 border-b border-border pb-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.productId}</p>
                      <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 py-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí giao hàng</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giảm giá</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <MapPin className="h-5 w-5" />
                Địa chỉ giao hàng
              </h2>
              <p className="text-sm">{order.deliveryAddress}</p>
            </div>

            {/* Customer Info */}
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h2 className="mb-4 font-bold">Người nhận</h2>
              <p className="font-medium">{order.customerName}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {order.customerPhone}
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h2 className="mb-2 font-bold">Thanh toán</h2>
              <p className="text-sm text-muted-foreground capitalize">
                {order.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng'}
                {order.paymentMethod === 'momo' && 'Ví MoMo'}
                {order.paymentMethod === 'vnpay' && 'VNPay'}
                {order.paymentMethod === 'bank' && 'Chuyển khoản ngân hàng'}
              </p>
            </div>

            {/* Note */}
            {order.note && (
              <div className="rounded-xl bg-card p-6 shadow-card">
                <h2 className="mb-2 font-bold">Ghi chú</h2>
                <p className="text-sm text-muted-foreground">{order.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetailPage;
