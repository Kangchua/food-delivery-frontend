import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { shipperApi } from '@/api/shipperApi';
import { toast } from 'sonner';
import { Package, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';

// 1. Định nghĩa Interface chuẩn
interface Order {
  id: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customerName?: string;
}

const AssignedOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const data = await shipperApi.getAssignedOrders();
      // Đảm bảo data là mảng để không bị lỗi .map()
      const orderList = Array.isArray(data) ? data : data?.data || [];
      setOrders(orderList);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Không thể tải đơn hàng được gán.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-orange-100 text-orange-600';
      case 'shipping': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Đơn hàng được gán</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Hiện tại bạn chưa có đơn hàng nào được gán.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id}
              onClick={() => navigate(`/shipper/orders/${order.id}`)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-500 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">#{order.id.slice(0, 8)}</span>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600 line-clamp-2">{order.deliveryAddress}</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <p className="font-bold text-lg text-gray-900">{formatCurrency(order.totalAmount)}</p>
                <div className="flex items-center text-orange-500 text-sm font-bold group-hover:translate-x-1 transition-transform">
                  Chi tiết <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedOrdersPage;