import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight, Loader2 } from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { orderApi } from "@/api/orderApi";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { OrderItemSummary } from "@/types";
import { toast } from "sonner";

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderItemSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastOrderRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore) {
            setPage((p) => p + 1);
          }
        },
        { threshold: 0.8 },
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore],
  );

  const fetchOrders = async (pageNum: number) => {
    try {
      setIsLoading(true);
      const res = await orderApi.getHistory(pageNum, 10);
      setOrders((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
      setHasMore(res.meta.page < res.meta.totalPages);
      toast.success("Tải lịch sử đơn hàng thành công.");
    } catch (err) {
      console.error("Fetch orders failed", err);
      toast.error(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Lịch sử đơn hàng</h1>

        <div className="space-y-4">
          {orders.map((order, i) => {
            const isLast = i === orders.length - 1;
            return (
              <div
                key={order.orderId}
                ref={isLast ? lastOrderRef : null}
                className="pb-2"
              >
                <Link
                  to={`/orders/${order.orderId}`}
                  className="block rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-base font-bold text-slate-700">
                          #{order.orderCode}
                        </span>
                        <div className="scale-110 origin-left">
                          <OrderStatusBadge status={order.currentStatus} />
                        </div>
                      </div>

                      <p className="text-sm font-medium text-muted-foreground">
                        Đặt hàng: {formatDate(order.createdAt)}
                      </p>

                      {order.estimatedDeliveryTime && (
                        <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
                          Dự kiến: {formatDate(order.estimatedDeliveryTime)}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">
                        {formatCurrency(order.totalAmount + order.shippingFee)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Phí ship: {formatCurrency(order.shippingFee)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground font-medium">
                    <span>Xem chi tiết đơn hàng</span>
                    <ChevronRight className="h-5 w-5 text-primary" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!hasMore && orders.length > 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Hết đơn hàng
          </p>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="py-20 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p>Chưa có đơn hàng</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
