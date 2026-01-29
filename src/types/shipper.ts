// Định nghĩa cấu trúc User từ Backend trả về
export interface ShipperUser {
    id: string;
    userId: string;
    user: { // Thông tin lồng nhau như Backend trả về
        fullName: string;
        email: string;
        isActive: boolean;
    };
}

// Định nghĩa lịch sử đơn hàng
export interface OrderStatusHistory {
    id: string;
    orderId: string;
    status: number;
    changedAt: string;
    note?: string;
}