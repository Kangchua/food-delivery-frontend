import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  MapPin, Phone, Package, ArrowLeft, 
  CheckCircle2, Navigation, AlertCircle 
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

const DeliveryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // 1. Mock Data để làm FE (có thể xóa để gắn API thật)
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    // Giả lập gọi API lấy chi tiết đơn hàng
    const fetchOrderDetail = async () => {
      setLoading(true);
      setTimeout(() => {
        setOrder({
          id: id,
          customerName: "Nguyễn Văn A",
          phone: "0901234567",
          address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
          totalAmount: 155000,
          status: "Shipping",
          items: [
            { name: "Cơm Gà Hải Nam", quantity: 2, price: 60000 },
            { name: "Trà Chanh", quantity: 1, price: 35000 }
          ],
          note: "Giao đến cổng bảo vệ, gọi trước 5 phút."
        });
        setLoading(false);
      }, 800)
    };
    fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = (newStatus: string) => {
    toast.success(`Đã cập nhật đơn hàng thành: ${newStatus}`);
    setOrder({ ...order, status: newStatus });
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <MainLayout>
      <div className="container mx-auto max-w-2xl px-4 py-6">
        {/* Nút quay lại */}
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>

        <div className="space-y-6">
          {/* Card Trạng thái & Thông tin chính */}
          <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-primary">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-xl font-bold">Đơn hàng #{id?.slice(0, 8)}</h1>
                <p className="text-gray-500 text-sm">Ngày đặt: 29/01/2026</p>
              </div>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                {order.status}
              </span>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <p className="font-semibold">Địa chỉ giao hàng</p>
                  <p className="text-gray-600">{order.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold">Liên hệ</p>
                  <p className="text-gray-600">{order.customerName} - {order.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiết món ăn */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="flex items-center gap-2 font-bold mb-4">
              <Package className="h-5 w-5 text-primary" /> Chi tiết món ăn
            </h2>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg text-primary">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
            {order.note && (
              <div className="mt-4 bg-yellow-50 p-3 rounded-lg flex gap-2 text-sm text-yellow-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p><b>Ghi chú:</b> {order.note}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              className="h-14 text-lg bg-blue-600 hover:bg-blue-700"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`)}
            >
              <Navigation className="mr-2 h-5 w-5" /> Chỉ đường
            </Button>
            
            {order.status === 'Shipping' ? (
              <Button 
                className="h-14 text-lg bg-green-600 hover:bg-green-700"
                onClick={() => handleUpdateStatus('Completed')}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Hoàn thành
              </Button>
            ) : (
              <Button disabled className="h-14 text-lg">Đã hoàn tất</Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeliveryDetailPage;