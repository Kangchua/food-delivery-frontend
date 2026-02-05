import React, { useEffect, useState } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import staffApi from '@/api/staffApi';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
  totalAmount: number;
  status: number;
  createdAt: string;
}

interface IssueModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: string, description: string, type: string) => void;
}

const IssueModal: React.FC<IssueModalProps> = ({ orderId, isOpen, onClose, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('OutOfStock');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Vui lòng mô tả vấn đề');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(orderId, description, issueType);
      setDescription('');
      setIssueType('OutOfStock');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Báo cáo vấn đề</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loại vấn đề</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="OutOfStock">Hết hàng</option>
              <option value="Damaged">Hỏng hàng</option>
              <option value="Wrong">Sai đơn</option>
              <option value="Other">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả vấn đề</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="gradient-primary">
              {loading ? 'Đang gửi...' : 'Báo cáo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if search parameter exists in URL
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearch(searchParam);
    }
    fetchOrders();
  }, [searchParams]);

  const initializeStaffProfile = async () => {
    try {
      const response = await staffApi.initializeStaff();
      console.log('Staff initialized:', response);
      fetchOrders();
    } catch (error) {
      console.error('Failed to initialize staff:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getOrdersForPreparation();
      
      if (response.isSuccess && response.data) {
        setOrders(response.data.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          items: order.items || [],
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        })));
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      if (error?.response?.status === 400) {
        console.log('Staff profile not found. Attempting to initialize...');
        await initializeStaffProfile();
        return;
      }
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 1:
        return { label: 'Chờ xác nhận', icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 3:
        return { label: 'Đã xác nhận', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 4:
        return { label: 'Đang chế biến', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' };
      case 5:
        return { label: 'Sẵn sàng giao', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' };
      default:
        return { label: 'Không xác định', icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const response = await staffApi.confirmOrder(orderId);
      if (response.isSuccess) {
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: 3 } : order));
        toast.success('Đã xác nhận đơn hàng');
      }
    } catch (error) {
      console.error('Failed to confirm order:', error);
      toast.error('Xác nhận đơn hàng thất bại');
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    try {
      const response = await staffApi.startPreparingOrder(orderId);
      if (response.isSuccess) {
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: 4 } : order));
        toast.success('Bắt đầu chế biến đơn hàng');
      }
    } catch (error) {
      console.error('Failed to start preparing:', error);
      toast.error('Bắt đầu chế biến thất bại');
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      const response = await staffApi.markOrderReady(orderId);
      if (response.isSuccess) {
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: 5 } : order));
        toast.success('Đánh dấu đơn hàng sẵn sàng');
      }
    } catch (error) {
      console.error('Failed to mark ready:', error);
      toast.error('Đánh dấu sẵn sàng thất bại');
    }
  };

  const handleReportIssue = async (orderId: string, description: string, issueType: string) => {
    try {
      const response = await staffApi.reportOrderIssue(orderId, description, issueType);
      if (response.isSuccess) {
        toast.success('Đã báo cáo vấn đề cho admin');
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Failed to report issue:', error);
      toast.error('Báo cáo vấn đề thất bại');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status.toString() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Danh sách đơn hàng chuẩn bị</h1>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm mã đơn hoặc tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="1">Chờ xác nhận</option>
            <option value="3">Đã xác nhận</option>
            <option value="4">Đang chế biến</option>
            <option value="5">Sẵn sàng giao</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-lg bg-card border p-8 text-center text-muted-foreground">
              Không có đơn hàng phù hợp
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className="rounded-lg bg-card border shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color} ${statusInfo.bg}`}>
                          <StatusIcon className="h-4 w-4" />
                          {statusInfo.label}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Khách: <span className="font-medium text-foreground">{order.customerName}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Các món: {order.items.map(i => `${i.productName} x${i.quantity}`).join(', ') || 'N/A'}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-max">
                      {order.status === 1 && (
                        <>
                          <Button
                            size="sm"
                            className="gradient-primary"
                            onClick={() => handleConfirmOrder(order.id)}
                          >
                            Xác nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIssueModalOpen(true);
                            }}
                          >
                            Báo cáo vấn đề
                          </Button>
                        </>
                      )}
                      {order.status === 3 && (
                        <>
                          <Button
                            size="sm"
                            className="gradient-primary"
                            onClick={() => handleStartPreparing(order.id)}
                          >
                            Bắt đầu chế biến
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIssueModalOpen(true);
                            }}
                          >
                            Báo cáo vấn đề
                          </Button>
                        </>
                      )}
                      {order.status === 4 && (
                        <>
                          <Button
                            size="sm"
                            className="gradient-primary"
                            onClick={() => handleMarkReady(order.id)}
                          >
                            Đánh dấu sẵn sàng
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIssueModalOpen(true);
                            }}
                          >
                            Báo cáo vấn đề
                          </Button>
                        </>
                      )}
                      {order.status === 5 && (
                        <>
                          <Button size="sm" variant="outline" disabled>
                            ✓ Sẵn sàng
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIssueModalOpen(true);
                            }}
                          >
                            Báo cáo vấn đề
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Issue Modal */}
      <IssueModal
        orderId={selectedOrderId || ''}
        isOpen={issueModalOpen}
        onClose={() => {
          setIssueModalOpen(false);
          setSelectedOrderId(null);
        }}
        onSubmit={handleReportIssue}
      />
    </MainLayout>
  );
};

export default StaffOrdersPage;
