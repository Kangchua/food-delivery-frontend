import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TrendingUp, DollarSign, Package, Star, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const ShipperEarningsPage = () => {
  // Mock Data để làm FE (có thể xóa để gắn API thật)
  const stats = {
    today: 450000,
    week: 2850000,
    totalOrders: 156,
    rating: 4.9,
    bonus: 200000
  };

  const weeklyData = [
    { day: 'T2', amount: 400000 },
    { day: 'T3', amount: 350000 },
    { day: 'T4', amount: 500000 },
    { day: 'T5', amount: 450000 }, // Hôm nay
    { day: 'T6', amount: 0 },
    { day: 'T7', amount: 0 },
    { day: 'CN', amount: 0 },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Thu nhập của bạn</h1>

        {/* Tổng quan thu nhập - Card màu Cam nổi bật */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg mb-6">
          <p className="text-orange-100 text-sm mb-1">Tổng thu nhập tuần này</p>
          <h2 className="text-3xl font-bold mb-4">{formatCurrency(stats.week)}</h2>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-orange-100 text-xs">Hôm nay</p>
              <p className="font-bold">{formatCurrency(stats.today)}</p>
            </div>
            <div>
              <p className="text-orange-100 text-xs">Tiền thưởng</p>
              <p className="font-bold">{formatCurrency(stats.bonus)}</p>
            </div>
          </div>
        </div>

        {/* Biểu đồ cột đơn giản (CSS Pure) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" /> Biểu đồ tuần
            </h3>
            <span className="text-xs text-gray-400">Đơn vị: VNĐ</span>
          </div>
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                <div 
                  className={`w-full rounded-t-md transition-all duration-500 ${item.amount > 0 ? 'bg-orange-400' : 'bg-gray-100'}`}
                  style={{ height: `${(item.amount / 600000) * 100}%` }}
                ></div>
                <span className="text-[10px] text-gray-400 font-medium">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Thống kê chi tiết */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center text-blue-500 mb-3">
              <Package className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
            <p className="text-xs text-gray-500 font-medium">Tổng đơn hàng</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="bg-yellow-50 w-10 h-10 rounded-xl flex items-center justify-center text-yellow-500 mb-3">
              <Star className="h-5 w-5 fill-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.rating}</p>
            <p className="text-xs text-gray-500 font-medium">Đánh giá sao</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShipperEarningsPage;