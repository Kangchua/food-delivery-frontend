import React, { useState, useEffect } from 'react';
import { shipperApi } from '@/api/shipperApi';
import { toast } from 'sonner';
import { Package, MapPin, ChevronRight, Loader2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';


interface Order {
  id: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customerName?: string;
}

const AssignedOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Mock Data để ông anh test giao diện (Anh xóa phần này khi gắn API thật nhé)
  const mockOrders: Order[] = [
    {
      id: "ORD-8821",
      deliveryAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
      totalAmount: 155000,
      status: "PENDING",
      createdAt: "2024-03-20T10:30:00Z"
    },
    {
      id: "ORD-9952",
      deliveryAddress: "456 Nguyễn Huệ, Quận 1, TP.HCM",
      totalAmount: 210000,
      status: "SHIPPING",
      createdAt: "2024-03-20T11:15:00Z"
    }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Gọi API thật
        const response = await shipperApi.getAssignedOrders();
        // Nếu API chưa có data thì dùng tạm Mock
        setOrders(Array.isArray(response) ? response : mockOrders);
      } catch (err) {
        console.error('Error:', err);
        setOrders(mockOrders); // Lỗi thì hiện Mock để vẫn có cái mà xem
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-orange-100 text-orange-600';
      case 'SHIPPING': return 'bg-blue-100 text-blue-600';
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
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Đơn hàng mới</h1>
        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {orders.length} đơn
        </span>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có đơn hàng nào được gán</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id}
              onClick={() => navigate(`/shipper/orders/${order.id}`)}
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 hover:border-orange-200 transition-all cursor-pointer active:scale-95"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                   <div className="bg-orange-100 p-2 rounded-xl">
                      <Package className="h-4 w-4 text-orange-600" />
                   </div>
                   <span className="text-sm font-bold text-gray-800">#{order.id.slice(-4)}</span>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600 line-clamp-2">{order.deliveryAddress}</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-medium">Tổng thanh toán</span>
                  <p className="font-bold text-lg text-orange-600">{formatCurrency(order.totalAmount)}</p>
                </div>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                  Chi tiết <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedOrdersPage;