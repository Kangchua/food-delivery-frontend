import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { orderApi } from "@/api/orderApi";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";
import { OrderDetailResponse, OutOfStockRequest } from "@/types";

const OrderOutOfStockPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho form
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const data = await orderApi.getByOrderId(id);
        setOrder(data);
      } catch (error: any) {
        toast.error("Không thể tải thông tin đơn hàng");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((item) => item !== productId)
        : [...prev, productId],
    );
  };

  const handleSubmit = async () => {
    if (!order) return;

    // Validate: Ít nhất 1 món bị loại bỏ nhưng không được loại bỏ tất cả
    if (selectedProductIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một món hết hàng");
      return;
    }
    if (selectedProductIds.length === order.items.length) {
      toast.error(
        "Không thể báo hết hàng cho toàn bộ món ăn (Vui lòng chọn Hủy đơn)",
      );
      return;
    }
    if (!note.trim()) {
      toast.error("Vui lòng nhập ghi chú lý do hết hàng");
      return;
    }

    setIsSubmitting(true);
    try {
      const request: OutOfStockRequest = {
        removedProductIds: selectedProductIds,
        note: note.trim(),
      };
      await orderApi.outOfStockByAdmin(order.orderId, request);
      toast.success("Đã cập nhật trạng thái hết hàng");
      navigate(`/admin/orders/${order.orderId}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Đang tải...</div>;
  if (!order) return null;

  return (
    <MainLayout>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-black">
            Xử lý hết hàng #{order.orderCode}
          </h1>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Chọn các món đã hết hàng
            </h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  onClick={() => toggleProduct(item.productId)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedProductIds.includes(item.productId)
                      ? "border-red-500 bg-red-50"
                      : "border-transparent bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <img
                    src={item.productImage}
                    className="h-16 w-16 rounded-xl object-cover"
                    alt=""
                  />
                  <div className="flex-1">
                    <p className="font-bold">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  {selectedProductIds.includes(item.productId) ? (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Hết hàng
                    </div>
                  ) : (
                    <CheckCircle2 className="text-muted-foreground/30" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="mb-3 font-bold">Ghi chú cho khách hàng</h2>
            <textarea
              className="w-full min-h-[120px] rounded-2xl border bg-muted/20 p-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Ví dụ: Món Gà rán hiện đã hết, quán xin lỗi vì sự bất tiện này..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button
            className="w-full h-14 rounded-full text-lg font-bold shadow-lg shadow-primary/20"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận cập nhật đơn hàng"}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderOutOfStockPage;
