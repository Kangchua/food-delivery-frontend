import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Star,
  Activity,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import useTranslation from "@/hooks/useTranslation";
import { adminApi } from "@/api/adminApi";
import { UsersApi } from "@/api/usersApi";
import { formatCurrency } from "@/utils/formatters";
import { OrderStatus } from "@/types/enum";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [orderRes, prodList, usersRes] = await Promise.all([
          adminApi.orders.getAdminList({ page: 1, pageSize: 1 }),
          adminApi.products.getAll(),
          UsersApi.getAllUsers({ page: 1, pageSize: 1 }),
        ]);
        setTotalOrders(orderRes.meta?.totalCount ?? orderRes.total ?? 0);
        setTotalProducts(prodList.length);
        setTotalCustomers(usersRes.meta?.totalCount ?? 0);
        // Doanh thu: lấy tất cả đơn hàng đã giao thành công (status = Completed = 7)
        const completedOrders = await adminApi.orders.getAdminList({
          page: 1,
          pageSize: 999,
        });
        const completedSum = completedOrders.items
          .filter((o) => o.status === OrderStatus.Completed)
          .reduce((s, o) => s + o.totalAmount, 0);
        setTotalRevenue(completedSum > 0 ? completedSum : null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    {
      label: t("admin.totalOrders"),
      value: loading ? "..." : (totalOrders ?? 0).toLocaleString("vi-VN"),
      icon: Package,
      color: "bg-primary/10 text-primary",
      path: "/admin/orders",
    },
    {
      label: t("admin.totalRevenue"),
      value: loading
        ? "..."
        : totalRevenue != null
          ? formatCurrency(totalRevenue)
          : "—",
      icon: TrendingUp,
      color: "bg-primary/10 text-primary",
      path: "/admin/reports", // Điều hướng đến Reports
    },
    {
      label: t("admin.totalCustomers"),
      value: loading ? "..." : (totalCustomers ?? 0).toLocaleString("vi-VN"),
      icon: Users,
      color: "bg-primary/10 text-primary",
      path: "/admin/users",
    },
    {
      label: t("admin.totalProducts"),
      value: loading ? "..." : (totalProducts ?? 0).toLocaleString("vi-VN"),
      icon: ShoppingBag,
      color: "bg-primary/10 text-primary",
      path: "/admin/products",
    },
  ];

  const quickLinks = [
    {
      label: t("admin.orders") ?? "Đơn hàng",
      path: "/admin/orders",
      icon: Package,
    },
    {
      label: t("admin.products") ?? "Sản phẩm",
      path: "/admin/products",
      icon: ShoppingBag,
    },
    {
      label: t("admin.categories") ?? "Danh mục",
      path: "/admin/categories",
      icon: BarChart3,
    },
    {
      label: "Quản lý đánh giá ",
      path: "/admin/reviews",
      icon: Star,
    },
    {
      label: t("nav.users") ?? "Người dùng",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: t("admin.reports") ?? "Báo cáo",
      path: "/admin/reports",
      icon: BarChart3,
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t("admin.dashboard") ?? "Bảng điều khiển quản trị"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Chào mừng trở lại! Dưới đây là tóm tắt hoạt động của cửa hàng
            </p>
          </div>

          {/* KPI Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <button
                key={stat.label}
                onClick={() => navigate(stat.path)}
                className="group rounded-xl bg-card p-6 shadow-card transition-all hover:shadow-lg hover:scale-105"
              >
                <div className={`mb-3 inline-flex rounded-lg p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </button>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Links Section - Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Access */}
              <div className="rounded-xl bg-card p-6 shadow-card">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                  <Activity className="h-5 w-5 text-primary" />
                  Truy cập nhanh
                </h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {quickLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-primary/10 hover:border-primary"
                    >
                      <item.icon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-center text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Statistics Section */}
              <div className="rounded-xl bg-card p-6 shadow-card">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Thống kê chính
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm text-muted-foreground">
                      Tổng đơn hàng
                    </span>
                    <span className="font-bold text-foreground">
                      {totalOrders ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm text-muted-foreground">
                      Doanh thu
                    </span>
                    <span className="font-bold text-primary">
                      {totalRevenue != null ? formatCurrency(totalRevenue) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm text-muted-foreground">
                      Tổng sản phẩm
                    </span>
                    <span className="font-bold text-foreground">
                      {totalProducts ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Right */}
            <div className="space-y-6">
              {/* Help & Tips */}
              <div className="rounded-xl bg-card p-6 shadow-card">
                <h2 className="mb-4 flex items-center gap-2 font-bold text-foreground">
                  <Star className="h-5 w-5 text-primary" />
                  Hướng dẫn nhanh
                </h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="inline-block w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      Vào <strong className="text-foreground">Báo cáo</strong> để xem chi tiết doanh thu và xu hướng
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="inline-block w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      Vào <strong className="text-foreground">Đơn hàng</strong> để xác nhận và giao hàng
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="inline-block w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      Vào <strong className="text-foreground">Sản phẩm</strong> để quản lý kho
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="inline-block w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      Vào <strong className="text-foreground">Người dùng</strong> để quản lý khách hàng
                    </span>
                  </li>
                </ul>
              </div>

              {/* Alert Box */}
              <div className="rounded-xl bg-card p-6 shadow-card">
                <h3 className="mb-2 font-bold text-foreground">
                  ⚡ Cần chú ý
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Kiểm tra đơn hàng chờ xác nhận thường xuyên</li>
                  <li>• Cập nhật kho sản phẩm hết hàng</li>
                  <li>• Xem báo cáo doanh thu hàng ngày</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
