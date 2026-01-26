import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types/enum"; // Đảm bảo bạn có enum này
import { OrderStatusHistoryResponse } from "@/types";

interface OrderTimelineProps {
  statusHistory?: OrderStatusHistoryResponse[];
}

// 2. Cập nhật Config để hỗ trợ cả Enum số (0, 1, 2...)
const statusConfig: Record<string | number, { label: string; color: string }> =
  {
    [OrderStatus.Pending]: { label: "Chờ xác nhận", color: "bg-yellow-500" },
    [OrderStatus.WaitingCustomerDecision]: {
      label: "Chờ khác xác nhận",
      color: "bg-yellow-700",
    },
    [OrderStatus.Confirmed]: { label: "Đã xác nhận", color: "bg-blue-500" },
    [OrderStatus.Preparing]: { label: "Đang chuẩn bị", color: "bg-blue-500" },
    [OrderStatus.ReadyForPickup]: {
      label: "Sẵn sàng giao",
      color: "bg-blue-500",
    },
    [OrderStatus.Shipping]: { label: "Đang giao", color: "bg-purple-500" },
    [OrderStatus.Completed]: { label: "Đã giao", color: "bg-green-500" },
    [OrderStatus.Cancelled]: { label: "Đã hủy", color: "bg-red-500" },
  };

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  statusHistory = [],
}) => {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic py-4">
        Chưa có cập nhật trạng thái
      </div>
    );
  }

  // Sắp xếp: Cái nào mới nhất (thời gian lớn nhất) cho lên đầu
  const displayHistory = [...statusHistory].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );

  return (
    <div className="space-y-0">
      {displayHistory.map((item, index) => {
        const config = statusConfig[item.status as keyof typeof statusConfig];
        const isLatest = index === 0; // Phần tử đầu tiên sau khi sort là mới nhất
        const isLastItem = index === displayHistory.length - 1;

        return (
          <div key={index} className="flex gap-4">
            {/* Cột Timeline (Dấu chấm và đường kẻ) */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                  config?.color || "bg-gray-300",
                  isLatest && "ring-4 ring-primary/20 scale-110",
                )}
              >
                {isLatest ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <Circle className="h-4 w-4 text-white opacity-70" />
                )}
              </div>

              {!isLastItem && (
                <div className="w-0.5 flex-1 min-h-[40px] bg-gray-200 my-1 border-l-2 border-dashed border-gray-200" />
              )}
            </div>

            {/* Nội dung trạng thái */}
            <div className="pb-8 flex-1">
              <div className="flex justify-between items-start">
                <p
                  className={cn(
                    "font-bold text-base",
                    isLatest ? "text-primary" : "text-slate-600",
                  )}
                >
                  {config?.label || `Trạng thái: ${item.status}`}
                </p>
                <span className="text-[11px] font-medium text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                  {new Date(item.changedAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                {new Date(item.changedAt).toLocaleDateString("vi-VN")}
                {item.changedBy && (
                  <span className="ml-1 opacity-70">
                    • bởi {item.changedBy}
                  </span>
                )}
              </p>

              {item.note && (
                <div className="mt-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic relative">
                  <span className="absolute -top-2 left-3 bg-slate-50 px-1 text-[10px] text-slate-400 font-bold uppercase">
                    Ghi chú
                  </span>
                  "{item.note}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
