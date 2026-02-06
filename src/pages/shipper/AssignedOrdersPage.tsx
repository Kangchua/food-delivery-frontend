import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { OrderAdminSummaryResponse } from '@/types/order.type';
import { OrderStatus, getOrderStatusInfo } from '@/types/enum';
import { useOrderContext } from '@/context/OrderContext';

const AssignedOrdersPage: React.FC = () => {
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const { availableOrders, loading, fetchOrders, acceptOrder } = useOrderContext();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setAcceptingOrderId(orderId);
      await acceptOrder(orderId);
    } catch (err) {
      // Error already handled in context
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const filteredOrders = availableOrders;

  const getStatusColor = (status: OrderStatus) => {
    const info = getOrderStatusInfo(status);
    return info.color;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Đơn hàng</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          <button
            disabled
            className={`px-4 py-2 font-medium border-b-2 transition-colors border-orange-500 text-orange-600`}
          >
            Sẵn sàng để nhận ({availableOrders.length})
          </button>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              Hiện không có đơn hàng sẵn sàng để nhận
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="rounded-lg bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Order Info */}
                  <div>
                    <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                    <p className="font-bold text-lg">#{order.id}</p>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <p className="text-sm text-muted-foreground">Khách hàng</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>

                  {/* Order Code */}
                  <div>
                    <p className="text-sm text-muted-foreground">Mã giao hàng</p>
                    <p className="font-medium">{order.orderCode}</p>
                  </div>

                  {/* Amount and Status */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Số tiền</p>
                      <p className="font-bold text-lg text-primary">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${getStatusColor(order.status)}`}>
                        {getOrderStatusInfo(order.status).label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <Link to={`/shipper/orders/${order.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleAcceptOrder(order.id)}
                    disabled={acceptingOrderId === order.id}
                    className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    <Check className="h-4 w-4" />
                    {acceptingOrderId === order.id ? 'Đang nhận...' : 'Nhận đơn'}
                  </Button>
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
