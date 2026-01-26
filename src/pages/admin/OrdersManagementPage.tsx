import React, { useEffect, useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { adminApi } from "@/api/adminApi";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toast } from "sonner";
import {
  getOrderStatusInfo,
  OrderAdminSummaryResponse,
  OrderFilterModel,
  OrderStatus,
  PaginationMeta,
} from "@/types";
import { orderApi } from "@/api";
import { useNavigate } from "react-router-dom";

// Import các interface bạn đã định nghĩa
// (Giả sử bạn đã để chúng trong file types/api.ts)

const OrdersManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderAdminSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Quản lý Filter & Pagination
  const [filters, setFilters] = useState<OrderFilterModel>({
    page: 1,
    pageSize: 10,
    searchCode: "",
    status: undefined,
  });

  // Lưu trữ thông tin phân trang từ API trả về
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters.page, filters.status]); // Gọi lại khi đổi trang hoặc đổi filter status

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orderApi.getOrderByAdmin(filters);

      setOrders(result.data);
      setPagination(result.meta);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Cập nhật tìm kiếm (thường dùng nút hoặc nhấn Enter để tránh gọi API liên tục)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi tìm kiếm mới
    fetchOrders();
  };
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Quản lý đơn hàng</h1>

        {/* Thanh tìm kiếm và Lọc */}
        <form
          onSubmit={handleSearch}
          className="mb-6 flex flex-wrap items-end gap-4"
        >
          {/* Tìm kiếm mã đơn */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Mã đơn hoặc tên..."
                value={filters.searchCode || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchCode: e.target.value,
                  }))
                }
                className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Lọc Trạng thái */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                }))
              }
              className="w-[160px] rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả</option>
              {Object.entries(OrderStatus)
                .filter(([key, value]) => typeof value === "number")
                .map(([key, value]) => (
                  <option key={value} value={value}>
                    {getOrderStatusInfo(value as OrderStatus).label}
                  </option>
                ))}
            </select>
          </div>

          {/* Lọc Ngày bắt đầu */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 text-center">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.fromDate || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  fromDate: e.target.value,
                  page: 1,
                }))
              }
              className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Lọc Ngày kết thúc */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 text-center">
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.toDate || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  toDate: e.target.value,
                  page: 1,
                }))
              }
              className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button type="submit">Tìm kiếm</Button>
          {/* Nút Clear Filters */}
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setFilters({
                page: 1,
                pageSize: 10,
                searchCode: "",
                status: undefined,
                fromDate: "",
                toDate: "",
              })
            }
            className="text-xs text-gray-500"
          >
            Đặt lại
          </Button>
        </form>

        {/* Bảng dữ liệu */}
        <div className="rounded-lg bg-card shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Mã đơn</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Khách hàng
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Tổng tiền
                </th>
                <th className="px-6 py-4 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left font-semibold">Ngày tạo</th>
                <th className="px-6 py-4 text-center font-semibold">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground italic"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo = getOrderStatusInfo(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 font-medium text-blue-600">
                        #{order.orderCode}
                      </td>
                      <td className="px-6 py-4">{order.customerName}</td>
                      <td className="px-6 py-4 text-right font-bold">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate(`/admin/orders/${order.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
            <div className="text-sm text-muted-foreground">
              Hiển thị <b>{orders.length}</b> trên{" "}
              <b>{pagination.totalCount}</b> đơn hàng
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-sm font-medium">
                Trang {pagination.page} / {pagination.totalPages || 1}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrdersManagementPage;
