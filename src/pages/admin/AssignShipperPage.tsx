import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { adminApi } from '@/api/adminApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

const AssignShipperPage: React.FC = () => {
  const { t } = useTranslation();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/admin/orders');
      return;
    }
    adminApi.orders
      .getDetail(orderId)
      .then(setOrder)
      .catch(() => {
        toast.error('Không tải được đơn hàng');
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate('/admin/orders')} variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back') ?? 'Quay lại'}
        </Button>

        {order ? (
          <div className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold">Đơn #{order.orderCode ?? orderId}</h2>
            <p className="text-muted-foreground mb-2">Khách: {order.customerName ?? order.receiverName}</p>
            <p className="text-muted-foreground mb-4">Tổng: {formatCurrency(order.totalAmount ?? order.total ?? 0)}</p>
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8">
              <Truck className="mb-4 h-14 w-14 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Chức năng phân công shipper đang được phát triển. Backend chưa có API assign shipper.
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Bạn có thể xác nhận đơn và bắt đầu chuẩn bị từ trang Quản lý đơn hàng.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-destructive/10 p-8 text-center">
            <p className="text-lg font-medium text-destructive">Không tìm thấy đơn hàng.</p>
            <Button onClick={() => navigate('/admin/orders')} className="mt-4">
              Về danh sách đơn
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AssignShipperPage;
