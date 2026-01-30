import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Star, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { ReportChart } from '@/components/admin/ReportChart';
import { StatisticsCard } from '@/components/admin/StatisticsCard';
import { adminApi } from '@/api/adminApi';
import { ReviewApi } from '@/api/reviewApi';
import { formatCurrency } from '@/utils/formatters';
import { OrderStatus } from '@/types/enum';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderTrendData {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
}

interface RevenueData {
  period: string;
  revenue: number;
}

interface ReviewData {
  stars: number;
  count: number;
}

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statistics
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  // Review Statistics
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsByStars, setReviewsByStars] = useState<ReviewData[]>([]);

  // Chart Data
  const [orderTrend, setOrderTrend] = useState<OrderTrendData[]>([]);
  const [revenueByStatus, setRevenueByStatus] = useState<
    { name: string; value: number }[]
  >([]);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch orders data
        const orderRes = await adminApi.orders.getAdminList({
          page: 1,
          pageSize: 999,
        });

        if (orderRes.items) {
          const orders = orderRes.items;
          const total = orders.length;
          const completed = orders.filter(
            (o) => o.status === OrderStatus.Completed
          ).length;
          const revenue = orders
            .filter((o) => o.status === OrderStatus.Completed)
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

          setTotalOrders(total);
          setCompletedOrders(completed);
          setTotalRevenue(revenue);
          setAvgOrderValue(total > 0 ? revenue / completed : 0);

          // Process order trend data (group by date)
          const trendMap = new Map<string, any>();
          orders.forEach((order) => {
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('vi-VN')
              : 'Unknown';
            if (!trendMap.has(dateStr)) {
              trendMap.set(dateStr, {
                date: dateStr,
                total: 0,
                completed: 0,
                cancelled: 0,
              });
            }
            const data = trendMap.get(dateStr);
            data.total += 1;
            if (order.status === OrderStatus.Completed) data.completed += 1;
            if (order.status === OrderStatus.Cancelled) data.cancelled += 1;
          });
          setOrderTrend(Array.from(trendMap.values()).slice(-7)); // Last 7 days

          // Revenue by status
          const statusMap = new Map<string, number>();
          const statusLabels: Record<number, string> = {
            1: 'Chờ xác nhận',
            3: 'Đã xác nhận',
            4: 'Đang chuẩn bị',
            6: 'Đang giao',
            7: 'Hoàn thành',
            8: 'Hủy',
          };

          orders.forEach((order) => {
            const label = statusLabels[order.status] || `Status ${order.status}`;
            statusMap.set(label, (statusMap.get(label) || 0) + order.totalAmount);
          });
          setRevenueByStatus(
            Array.from(statusMap.entries()).map(([name, value]) => ({
              name,
              value,
            }))
          );
        }

        // Fetch review data
        const reviewReport = await ReviewApi.getReviewReport();
        setTotalReviews(reviewReport.totalReviews || 0);
        setAvgRating(reviewReport.averageRating || 0);

        // Convert star counts to chart data
        const starsData: ReviewData[] = [];
        for (let i = 5; i >= 1; i--) {
          starsData.push({
            stars: i,
            count: reviewReport.starCounts?.[i] || 0,
          });
        }
        setReviewsByStars(starsData);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Lỗi tải dữ liệu báo cáo';
        setError(errorMsg);
        console.error('Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            {t('admin.reports') ?? 'Báo cáo'}
          </h1>
          <p className="text-muted-foreground">
            Tổng hợp thống kê bán hàng, doanh thu và đánh giá khách hàng
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Key Statistics */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Thống kê chính</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatisticsCard
              title="Tổng đơn hàng"
              value={loading ? '...' : totalOrders.toLocaleString('vi-VN')}
              icon={BarChart3}
              color="text-blue-500"
            />
            <StatisticsCard
              title="Doanh thu"
              value={loading ? '...' : formatCurrency(totalRevenue)}
              icon={TrendingUp}
              color="text-green-500"
            />
            <StatisticsCard
              title="Đơn hàng hoàn thành"
              value={loading ? '...' : completedOrders.toLocaleString('vi-VN')}
              icon={BarChart3}
              color="text-emerald-500"
              subtitle={`${totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%`}
            />
            <StatisticsCard
              title="Giá trị đơn hàng TB"
              value={
                loading ? '...' : avgOrderValue > 0 ? formatCurrency(avgOrderValue) : '—'
              }
              icon={TrendingUp}
              color="text-purple-500"
            />
          </div>
        </div>

        {/* Review Statistics */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Thống kê đánh giá</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatisticsCard
              title="Tổng đánh giá"
              value={loading ? '...' : totalReviews.toLocaleString('vi-VN')}
              icon={Star}
              color="text-amber-500"
            />
            <StatisticsCard
              title="Đánh giá trung bình"
              value={loading ? '...' : avgRating.toFixed(1)}
              icon={Star}
              color="text-amber-500"
              subtitle="/ 5 sao"
            />
            <StatisticsCard
              title="Đánh giá ẩn"
              value={loading ? '...' : 0}
              icon={AlertCircle}
              color="text-red-500"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Order Trend */}
          <ReportChart
            title="Xu hướng đơn hàng (7 ngày gần nhất)"
            data={orderTrend.map((item) => ({
              name: item.date,
              total: item.total,
              completed: item.completed,
              cancelled: item.cancelled,
            }))}
            type="line"
            xAxisDataKey="name"
            height={300}
            multipleDataKeys={['total', 'completed', 'cancelled']}
          />

          {/* Reviews by Stars */}
          <ReportChart
            title="Phân bố đánh giá"
            data={reviewsByStars.map((item) => ({
              name: `${item.stars} sao`,
              value: item.count,
            }))}
            type="bar"
            xAxisDataKey="name"
            dataKey="value"
            color="#fbbf24"
            height={300}
          />

          {/* Revenue by Status */}
          {revenueByStatus.length > 0 && (
            <ReportChart
              title="Doanh thu theo trạng thái đơn hàng"
              data={revenueByStatus}
              type="pie"
              dataKey="value"
              xAxisDataKey="name"
              height={300}
            />
          )}

          {/* Additional insights */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Thông tin khác</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Tỉ lệ hoàn thành:</span>
                <span className="font-semibold">
                  {totalOrders > 0
                    ? `${Math.round((completedOrders / totalOrders) * 100)}%`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">
                  Đánh giá trung bình:
                </span>
                <span className="font-semibold">
                  {avgRating.toFixed(2)} ⭐
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">
                  Tổng khách hàng đánh giá:
                </span>
                <span className="font-semibold">
                  {totalReviews.toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-muted-foreground">
          <p>
            💡 Dữ liệu được cập nhật từ tất cả các đơn hàng và đánh giá trong
            hệ thống
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
