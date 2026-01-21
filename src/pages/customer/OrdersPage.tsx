import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import OrderStatusBadge from '@/components/common/OrderStatusBadge';
import { SkeletonText } from '@/components/common/Skeleton';
import { orderApi } from '@/api/orderApi';
import { useAuth } from '@/context/AuthContext';
import useTranslation from '@/hooks/useTranslation';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Order } from '@/api/orderApi';

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getAll();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user?.id]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          {t('order.title')}
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card p-6 shadow-card">
                <SkeletonText lines={4} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t('order.noOrders')}</p>
            <Link to="/menu" className="mt-4">
              <span className="text-primary hover:underline">
                Đặt hàng ngay
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block rounded-xl bg-card p-4 shadow-card transition-all hover:shadow-lg md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-foreground">
                        #{order.orderNumber}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(order.total)}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <img
                        key={index}
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-10 w-10 rounded-full border-2 border-card object-cover"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <p className="flex-1 text-sm text-muted-foreground">
                    {order.items.length} sản phẩm
                  </p>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
