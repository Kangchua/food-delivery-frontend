import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { toast } from 'sonner';
import staffApi from '@/api/staffApi';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const initializeStaffProfile = async () => {
    try {
      const response = await staffApi.initializeStaff();
      console.log('Staff initialized:', response);
      // Retry fetching stats after initialization
      fetchStats();
    } catch (error) {
      console.error('Failed to initialize staff:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getStats();
      
      if (response?.isSuccess && response?.data) {
        const data = response.data;
        console.log('Stats data:', data);
        setStats([
          {
            label: 'Đơn hàng hôm nay',
            value: data.totalOrdersToday || 0,
            icon: <LayoutDashboard className="h-6 w-6" />,
            color: 'text-blue-600',
          },
          {
            label: 'Đang chuẩn bị',
            value: data.preparingCount || 0,
            icon: <Clock className="h-6 w-6" />,
            color: 'text-orange-600',
          },
          {
            label: 'Sẵn sàng giao',
            value: data.readyCount || 0,
            icon: <CheckCircle className="h-6 w-6" />,
            color: 'text-green-600',
          },
          {
            label: 'Vấn đề',
            value: data.issueCount || 0,
            icon: <AlertCircle className="h-6 w-6" />,
            color: 'text-red-600',
          },
        ]);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      // Check if it's a 400 error (staff not found) and try to initialize
      if (error?.response?.status === 400) {
        console.log('Staff profile not found. Attempting to initialize...');
        await initializeStaffProfile();
        return;
      }
      toast.error('Không thể tải dữ liệu thống kê');
      // Set default mock data on error
      setStats([
        {
          label: 'Đơn hàng hôm nay',
          value: 0,
          icon: <LayoutDashboard className="h-6 w-6" />,
          color: 'text-blue-600',
        },
        {
          label: 'Đang chuẩn bị',
          value: 0,
          icon: <Clock className="h-6 w-6" />,
          color: 'text-orange-600',
        },
        {
          label: 'Sẵn sàng giao',
          value: 0,
          icon: <CheckCircle className="h-6 w-6" />,
          color: 'text-green-600',
        },
        {
          label: 'Vấn đề',
          value: 0,
          icon: <AlertCircle className="h-6 w-6" />,
          color: 'text-red-600',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bảng điều khiển nhân viên</h1>
          <p className="text-muted-foreground mt-1">
            Chào mừng! Dưới đây là tình trạng đơn hàng hôm nay của bạn.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg bg-card border shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="rounded-lg bg-card border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Hành động nhanh</h3>
            <div className="flex flex-col gap-2">
              <Button className="gradient-primary w-full">
                Xem danh sách chuẩn bị
              </Button>
              <Button variant="outline" className="w-full">
                Kiểm tra tồn kho
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-card border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Thông tin ngày hôm nay</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Giờ mở cửa:</span>
                <span className="ml-2 font-medium">8:00 - 22:00</span>
              </p>
              <p>
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className="ml-2 font-medium text-green-600">Đang hoạt động</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 shadow-sm p-6">
          <h3 className="font-semibold mb-2">💡 Mẹo</h3>
          <p className="text-sm text-muted-foreground">
            Hãy thường xuyên kiểm tra danh sách đơn hàng chuẩn bị để cập nhật tiến độ nấu
            ăn. Nhân viên giao hàng sẽ chờ đợi các đơn sẵn sàng tại phần "Sẵn sàng giao".
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffDashboard;
