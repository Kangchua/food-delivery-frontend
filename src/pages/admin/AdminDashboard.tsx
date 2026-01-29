import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Star,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import useTranslation from "@/hooks/useTranslation";
import { adminApi } from "@/api/adminApi";
import { formatCurrency } from "@/utils/formatters";
import { OrderStatus } from "@/types/enum";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [orderRes, prodList] = await Promise.all([
          adminApi.orders.getAdminList({ page: 1, pageSize: 1 }),
          adminApi.products.getAll(),
        ]);
        setTotalOrders(orderRes.meta?.totalCount ?? orderRes.total ?? 0);
        setTotalProducts(prodList.length);
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
      color: "bg-success/10 text-success",
      path: "/admin/orders",
    },
    {
      label: t("admin.totalCustomers"),
      value: "—",
      icon: Users,
      color: "bg-info/10 text-info",
      path: "/admin/users",
    },
    {
      label: t("admin.totalProducts"),
      value: loading ? "..." : (totalProducts ?? 0).toLocaleString("vi-VN"),
      icon: ShoppingBag,
      color: "bg-warning/10 text-warning",
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
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">
          {t("admin.dashboard") ?? "Bảng điều khiển"}
        </h1>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.path}
              className="rounded-xl bg-card p-6 shadow-card transition-shadow hover:shadow-lg"
            >
              <div className={`mb-3 inline-flex rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t("admin.ordersByStatus") ?? "Truy cập nhanh"}
            </h2>
            <div className="space-y-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 font-bold">
              {t("admin.recentOrders") ?? "Hướng dẫn"}
            </h2>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>
                Vào <strong>Đơn hàng</strong> để xác nhận, bắt đầu chuẩn bị hoặc
                hủy đơn.
              </li>
              <li>
                Vào <strong>Sản phẩm</strong> để thêm/sửa/tạm dừng món.
              </li>
              <li>
                Vào <strong>Danh mục</strong> để quản lý nhóm món ăn.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
