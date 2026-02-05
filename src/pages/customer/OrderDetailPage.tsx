import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  Clock,
  ArrowLeft,
  CreditCard,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import OrderStatusBadge from "@/components/common/OrderStatusBadge";
import { OrderTimeline } from "@/components/customer/OrderTimeline";
import { orderApi } from "@/api/orderApi";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toast } from "sonner";
import {
  OrderDetailResponse,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<number, string> = {
      [PaymentMethod.Cash]: "Tiền mặt",
      [PaymentMethod.Card]: "Thẻ ngân hàng",
      [PaymentMethod.Momo]: "Ví MoMo",
    };
    return labels[method] || "Không xác định";
  };
  const getPaymentStatusLabel = (status: PaymentStatus) => {
    const labels: Record<number, { text: string; color: string }> = {
      [PaymentStatus.Unpaid]: {
        text: "Chưa thanh toán",
        color: "text-red-600",
      },
      [PaymentStatus.Paid]: { text: "Đã thanh toán", color: "text-green-600" },
      [PaymentStatus.Refunded]: {
        text: "Đã hoàn tiền",
        color: "text-orange-600",
      },
    };
    return (
      labels[status] || { text: "Không xác định", color: "text-slate-600" }
    );
  };

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const data = await orderApi.getByOrderId(id);
        setOrder(data);
      } catch (error: any) {
        toast.error(error.message || "Không thể tải đơn hàng");
        navigate("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const handleConfirmCancel = async (inputValue?: string) => {
    if (!order) return;
    setIsSubmitting(true);
    try {
      const reason = inputValue || "Người dùng yêu cầu hủy";
      const result = await orderApi.cancel(order.orderId, reason);
      if (result) {
        toast.success("Đơn hàng đã được hủy thành công");
      }
      // Refresh dữ liệu
      const updated = await orderApi.getByOrderId(order.orderId);
      setOrder(updated);
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi hủy đơn");
    } finally {
      setIsSubmitting(false);
    }
  };
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    isAccepted: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    isAccepted: true,
    title: "",
    description: "",
  });
  const handleDecision = async (inputValue?: string) => {
    if (!order) return;
    setIsSubmitting(true);
    try {
      const note =
        inputValue ||
        (modalConfig.isAccepted
          ? "Người dùng tiếp tục đơn hàng."
          : "Người dùng không tiếp tục đơn hàng.");
      await orderApi.respondProposal(
        order.orderId,
        modalConfig.isAccepted,
        note,
      );
      toast.success(
        modalConfig.isAccepted
          ? "Đơn hàng được tiếp tục."
          : "Đơn hàng đã bị hủy.",
      );
      const updated = await orderApi.getByOrderId(order.orderId);
      setOrder(updated);
    } catch (error: any) {
      toast.error(error.message || "Lỗi xử lý");
    } finally {
      setIsSubmitting(false);
      setModalConfig((prev) => ({ ...prev, isOpen: false }));
    }
  };
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground italic">
              Đang tải chi tiết đơn hàng...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) return null;

  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/orders")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">
                  #{order.orderCode}
                </h1>
                <OrderStatusBadge status={order.currentStatus} />
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {(order.currentStatus === OrderStatus.Pending ||
            order.currentStatus === OrderStatus.Confirmed) && (
            <>
              <Button
                variant="destructive"
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isSubmitting}
                className="rounded-full px-8 shadow-lg shadow-red-100"
              >
                {isSubmitting ? "Đang xử lý..." : "Hủy đơn hàng"}
              </Button>
              <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Xác nhận hủy đơn hàng"
                description="Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này. Lưu ý: Hành động này không thể hoàn tác."
                showInput={true}
                inputPlaceholder="Nhập lý do hủy (ví dụ: Thay đổi địa chỉ, Đặt trùng...)"
              />
            </>
          )}

          {order.currentStatus === OrderStatus.WaitingCustomerDecision && (
            <div className="flex gap-4">
              <Button
                onClick={() =>
                  setModalConfig({
                    isOpen: true,
                    isAccepted: true,
                    title: "Xác nhận tiếp tục đơn hàng",
                    description:
                      "Đơn hàng của bạn sẽ tiếp tục với các món còn lại.",
                  })
                }
                disabled={isSubmitting}
                className="rounded-full px-8 bg-green-600 hover:bg-green-700"
              >
                Tiếp tục đơn hàng
              </Button>
              <Button
                onClick={() =>
                  setModalConfig({
                    isOpen: true,
                    isAccepted: false,
                    title: "Xác nhận không tiếp tục",
                    description: "Đơn hàng sẽ bị hủy hoàn toàn.",
                  })
                }
                variant="destructive"
                disabled={isSubmitting}
                className="rounded-full px-8"
              >
                Không tiếp tục
              </Button>
              <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() =>
                  setModalConfig((prev) => ({ ...prev, isOpen: false }))
                }
                onConfirm={handleDecision}
                title={modalConfig.title}
                description={modalConfig.description}
                showInput={true}
                inputPlaceholder="Thêm ghi chú cho cửa hàng..."
              />
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cột trái: Timeline & Items */}
          <div className="space-y-8 lg:col-span-2">
            {/* Timeline */}
            <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
              <div className="border-b bg-muted/30 px-6 py-4">
                <h2 className="flex items-center gap-2 font-bold">
                  <Clock className="h-5 w-5 text-primary" /> Trạng thái hành
                  trình
                </h2>
              </div>
              <div className="p-6">
                <OrderTimeline statusHistory={order.statusHistories} />
              </div>
            </div>

            {/* Danh sách món ăn */}
            <div className="rounded-3xl border bg-card shadow-sm">
              <div className="border-b bg-muted/30 px-6 py-4">
                <h2 className="flex items-center gap-2 font-bold">
                  <Package className="h-5 w-5 text-primary" /> Chi tiết món ăn
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 py-2"
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-20 w-20 rounded-2xl border object-cover shadow-sm"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.unitPrice)} x {item.quantity}
                        </p>
                        {item.isRemoved && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                            {item.removeReason}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Phần tính tiền */}
                <div className="mt-6 space-y-3 border-t pt-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Phí giao hàng</span>
                    <span>{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black text-primary border-t pt-3">
                    <span>Tổng thanh toán</span>
                    <span>
                      {formatCurrency(order.totalAmount + order.shippingFee)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin giao hàng & Thanh toán */}
          <div className="space-y-6">
            {/* Địa chỉ */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
                <MapPin className="h-5 w-5 text-primary" /> Giao tới
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="mt-1 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-bold">{order.receiverName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.receiverPhone}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-muted/50 p-4 text-sm italic">
                  {order.shippingAddress}
                </div>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
                <CreditCard className="h-5 w-5 text-primary" /> Thanh toán
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phương thức:</span>
                  <span className="font-bold uppercase text-slate-600">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span
                    className={`font-bold ${getPaymentStatusLabel(order.paymentStatus).color}`}
                  >
                    {getPaymentStatusLabel(order.paymentStatus).text}
                  </span>
                </div>
              </div>
            </div>

            {/* Lý do hủy nếu có */}
            {order.cancelReason && (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
                <h2 className="mb-2 font-bold text-red-700">Lý do hủy đơn</h2>
                <p className="text-sm text-red-600 italic">
                  "{order.cancelReason}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetailPage;
