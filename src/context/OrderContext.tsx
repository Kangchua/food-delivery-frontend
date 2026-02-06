import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { OrderAdminSummaryResponse } from '@/types/order.type';
import { shipperApi } from '@/api/shipperApi';
import { toast } from 'sonner';

interface OrderContextType {
  availableOrders: OrderAdminSummaryResponse[];
  assignedOrders: OrderAdminSummaryResponse[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  failOrder: (orderId: string, reason: string) => Promise<void>;
  setAvailableOrders: (orders: OrderAdminSummaryResponse[]) => void;
  setAssignedOrders: (orders: OrderAdminSummaryResponse[]) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [availableOrders, setAvailableOrders] = useState<OrderAdminSummaryResponse[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<OrderAdminSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [availRes, assignRes] = await Promise.all([
        shipperApi.getAvailableOrders(),
        shipperApi.getAssignedOrders()
      ]);

      setAvailableOrders(availRes?.data || []);
      setAssignedOrders(assignRes?.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptOrder = useCallback(async (orderId: string) => {
    try {
      await shipperApi.acceptOrder(orderId);
      toast.success('Đã nhận đơn hàng thành công!');

      // Move order from available to assigned
      const acceptedOrder = availableOrders.find(o => o.id === orderId);
      if (acceptedOrder) {
        setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
        setAssignedOrders(prev => [acceptedOrder, ...prev]);
      }
    } catch (err) {
      console.error('Error accepting order:', err);
      toast.error('Không thể nhận đơn hàng này');
      throw err;
    }
  }, [availableOrders]);

  const completeOrder = useCallback(async (orderId: string) => {
    try {
      await shipperApi.deliverySuccess(orderId);
      toast.success('Giao hàng thành công!');

      // Remove order from assigned
      setAssignedOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
      throw err;
    }
  }, []);

  const failOrder = useCallback(async (orderId: string, reason: string) => {
    try {
      await shipperApi.deliveryFailed(orderId, reason);
      toast.success('Đã cập nhật trạng thái đơn hàng!');

      // Remove order from assigned
      setAssignedOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Error failing order:', err);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
      throw err;
    }
  }, []);

  const value = {
    availableOrders,
    assignedOrders,
    loading,
    fetchOrders,
    acceptOrder,
    completeOrder,
    failOrder,
    setAvailableOrders,
    setAssignedOrders,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrderContext must be used within OrderProvider');
  return context;
};
