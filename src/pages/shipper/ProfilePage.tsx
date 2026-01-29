import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  User, 
  Phone, 
  Truck, 
  ChevronRight, 
  LogOut, 
  ShieldCheck,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ShipperProfilePage = () => {
  // 1. Mock Data để làm FE (có thể xóa để gắn API thật)
  const [shipperInfo, setShipperInfo] = useState({
    fullName: "Nguyễn Văn Shipper",
    phoneNumber: "0901 234 567",
    email: "shipper.test@gmail.com",
    vehicleType: "Xe máy (Yamaha Exciter)",
    licensePlate: "59-X3 123.45",
    isAvailable: true, // Trạng thái sẵn sàng nhận đơn trong DB
  });

  const handleToggleStatus = () => {
    setShipperInfo(prev => ({ ...prev, isAvailable: !prev.isAvailable }));
    const statusText = !shipperInfo.isAvailable ? "Sẵn sàng nhận đơn" : "Đã nghỉ ngơi";
    toast.info(`Trạng thái: ${statusText}`);
  };

  const handleLogout = () => {
    toast.error("Đã đăng xuất tài khoản");
    // logic đăng xuất ở đây
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-md px-4 py-8">
        {/* Header: Ảnh đại diện & Tên (Dùng màu Cam thương hiệu) */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-500 shadow-inner">
              <User className="h-12 w-12 text-orange-600" />
            </div>
            <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white ${shipperInfo.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">{shipperInfo.fullName}</h2>
          <p className="text-gray-500 text-sm">Đối tác Shipper chuyên nghiệp</p>
        </div>

        {/* Card Trạng thái hoạt động (Dữ liệu IsAvailable từ BE) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 mb-6 flex justify-between items-center transition-all">
          <div>
            <p className="font-bold text-gray-800">Trạng thái làm việc</p>
            <p className="text-xs text-gray-500">Bật để bắt đầu nhận đơn hàng mới</p>
          </div>
          <button 
            onClick={handleToggleStatus}
            className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${shipperInfo.isAvailable ? 'bg-orange-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${shipperInfo.isAvailable ? 'left-8' : 'left-1'}`} />
          </button>
        </div>

        {/* Thông tin phương tiện (Khớp với LicensePlate, VehicleType trong BE) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 bg-orange-50/50 border-b border-orange-100">
            <p className="text-sm font-bold text-orange-700 flex items-center gap-2">
              <Truck className="h-4 w-4" /> Phương tiện di chuyển
            </p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Loại xe</span>
              <span className="font-medium text-gray-800">{shipperInfo.vehicleType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Biển số xe</span>
              <span className="font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">{shipperInfo.licensePlate}</span>
            </div>
          </div>
        </div>

        {/* Cài đặt & Hỗ trợ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="divide-y divide-gray-50">
            <div className="flex items-center justify-between p-4 hover:bg-orange-50 cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400 group-hover:text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Hỗ trợ tổng đài</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex items-center justify-between p-4 hover:bg-orange-50 cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gray-400 group-hover:text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Chính sách & Pháp lý</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </div>
        </div>

        {/* Nút Đăng xuất */}
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="w-full h-12 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <LogOut className="h-5 w-5 mr-2" /> Đăng xuất tài khoản
        </Button>
      </div>
    </MainLayout>
  );
};

export default ShipperProfilePage;