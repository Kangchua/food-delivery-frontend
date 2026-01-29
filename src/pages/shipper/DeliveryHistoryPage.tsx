import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Search, Calendar, Filter, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';

const DeliveryHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Mock Data để làm FE (có thể xóa để gắn API thật)
  const mockHistory = [
    { id: 'ORD8812', date: '29/01/2026', customer: 'Lê Thùy Chi', amount: 125000, status: 'Completed' },
    { id: 'ORD8815', date: '28/01/2026', customer: 'Trần Minh Tâm', amount: 45000, status: 'Cancelled' },
    { id: 'ORD8820', date: '28/01/2026', customer: 'Hoàng Nam', amount: 230000, status: 'Completed' },
  ];

  // Hàm xử lý màu sắc theo tone Cam chủ đạo
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': 
        return 'bg-orange-50 text-orange-600 border-orange-100'; // Dùng tone Cam nhạt thay vì Xanh lá nếu muốn đồng bộ tuyệt đối
      case 'Cancelled': 
        return 'bg-gray-50 text-gray-500 border-gray-100'; 
      default: 
        return 'bg-blue-50 text-blue-500 border-blue-100';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử giao hàng</h1>

        {/* Thanh tìm kiếm & Lọc - Viền cam khi focus */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm mã đơn, tên khách..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-gray-200 text-gray-600">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Danh sách đơn hàng */}
        <div className="space-y-4">
          {mockHistory.map((order) => (
            <div 
              key={order.id} 
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Mã đơn</span>
                  <p className="font-bold text-gray-800">#{order.id}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(order.status)}`}>
                  {order.status === 'Completed' ? 'THÀNH CÔNG' : 'ĐÃ HỦY'}
                </div>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-orange-400" />
                    {order.date}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Khách: {order.customer}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-400">Tổng tiền</p>
                  <p className="font-bold text-orange-600">{formatCurrency(order.amount)}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex justify-center group-hover:text-orange-500 transition-colors">
                 <span className="text-xs font-medium flex items-center">
                    Xem chi tiết <ChevronRight className="h-3 w-3 ml-1" />
                 </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default DeliveryHistoryPage;