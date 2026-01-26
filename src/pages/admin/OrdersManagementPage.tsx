import React, { useEffect, useState } from 'react';
import { Search, Eye, X, CheckCircle, Play, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import useTranslation from '@/hooks/useTranslation';
import {
  adminApi,
  OrderAdminSummary,
  OrderStatusEnum,
  OrderStatusLabel,
} from '@/api/adminApi';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: String(OrderStatusEnum.Pending), label: OrderStatusLabel[1] },
  { value: String(OrderStatusEnum.WaitingCustomerDecision), label: OrderStatusLabel[2] },
  { value: String(OrderStatusEnum.Confirmed), label: OrderStatusLabel[3] },
  { value: String(OrderStatusEnum.Preparing), label: OrderStatusLabel[4] },
  { value: String(OrderStatusEnum.ReadyForPickup), label: OrderStatusLabel[5] },
  { value: String(OrderStatusEnum.Shipping), label: OrderStatusLabel[6] },
  { value: String(OrderStatusEnum.Completed), label: OrderStatusLabel[7] },
  { value: String(OrderStatusEnum.Cancelled), label: OrderStatusLabel[8] },
];

const OrdersManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderAdminSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [acting, setActing] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const filter: any = { page, pageSize };
      if (statusFilter) filter.status = Number(statusFilter);
      if (searchCode.trim()) filter.searchCode = searchCode.trim();
      const res = await adminApi.orders.getAdminList(filter);
      setOrders(res.items);
      setTotal(res.meta?.totalCount ?? res.total ?? res.items.length);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      toast.error(err?.message ?? (t('error.fetchFailed') ?? 'Không tải được đơn hàng'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, pageSize, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const loadDetail = async (orderId: string) => {
    setDetailOrderId(orderId);
    setLoadingDetail(true);
    setDetail(null);
    try {
      const d = await adminApi.orders.getDetail(orderId);
      setDetail(d);
    } catch (e) {
      toast.error('Không tải được chi tiết đơn');
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusColor = (status: number) => {
    const map: Record<number, string> = {
      1: 'bg-amber-100 text-amber-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-indigo-100 text-indigo-800',
      5: 'bg-cyan-100 text-cyan-800',
      6: 'bg-violet-100 text-violet-800',
      7: 'bg-green-100 text-green-800',
      8: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-800';
  };

  const handleConfirm = async (orderId: string) => {
    try {
      setActing(true);
      await adminApi.orders.confirm(orderId);
      toast.success('Đã xác nhận đơn hàng');
      fetchOrders();
      if (detailOrderId === orderId) loadDetail(orderId);
    } catch (e: any) {
      toast.error(e?.message ?? 'Thao tác thất bại');
    } finally {
      setActing(false);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    try {
      setActing(true);
      await adminApi.orders.startPreparing(orderId);
      toast.success('Đã chuyển đơn sang đang chuẩn bị');
      fetchOrders();
      if (detailOrderId === orderId) loadDetail(orderId);
    } catch (e: any) {
      toast.error(e?.message ?? 'Thao tác thất bại');
    } finally {
      setActing(false);
    }
  };

  const handleCancel = async (orderId: string, reason: string) => {
    try {
      setActing(true);
      await adminApi.orders.cancel(orderId, reason || 'Admin hủy đơn');
      toast.success('Đã hủy đơn hàng');
      setShowCancelModal(null);
      setCancelReason('');
      fetchOrders();
      if (detailOrderId === orderId) setDetailOrderId(null);
      setDetail(null);
    } catch (e: any) {
      toast.error(e?.message ?? 'Hủy đơn thất bại');
    } finally {
      setActing(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">
          {t('admin.orders') ?? 'Quản lý đơn hàng'}
        </h1>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Mã đơn hàng..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border bg-background px-4 py-2 focus:border-primary focus:outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button onClick={handleSearch} className="gradient-primary">
            {t('common.search') ?? 'Tìm'}
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              {t('common.noData') ?? 'Chưa có đơn hàng'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Mã đơn</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Khách hàng</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tổng tiền</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ngày</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">{t('common.actions') ?? 'Thao tác'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-sm">{o.orderCode}</td>
                        <td className="px-4 py-3">{o.customerName}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(o.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(o.status)}`}>
                            {OrderStatusLabel[o.status] ?? `#${o.status}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {o.createdAt ? formatShortDate(o.createdAt) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => loadDetail(o.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {o.status === OrderStatusEnum.Pending && (
                              <Button
                                size="sm"
                                className="text-xs bg-green-600 hover:bg-green-700"
                                disabled={acting}
                                onClick={() => handleConfirm(o.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            {o.status === OrderStatusEnum.Confirmed && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                disabled={acting}
                                onClick={() => handleStartPreparing(o.id)}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                            {o.status !== OrderStatusEnum.Completed && o.status !== OrderStatusEnum.Cancelled && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs"
                                disabled={acting}
                                onClick={() => setShowCancelModal(o.id)}
                              >
                                <Ban className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Trang {page} / {totalPages} • Tổng {total} đơn
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Trước
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail drawer/modal */}
        {(detailOrderId || detail) && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card shadow-xl sm:max-w-lg sm:rounded-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b bg-card px-4 py-3">
                <h2 className="text-lg font-bold">Chi tiết đơn #{detail?.orderCode ?? detailOrderId}</h2>
                <Button variant="ghost" size="icon" onClick={() => { setDetailOrderId(null); setDetail(null); }}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4">
                {loadingDetail ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : detail ? (
                  <div className="space-y-4">
                    <p><span className="text-muted-foreground">Khách hàng:</span> {detail.customerName ?? detail.receiverName}</p>
                    <p><span className="text-muted-foreground">Số điện thoại:</span> {detail.receiverPhone ?? detail.customerPhone ?? '-'}</p>
                    <p><span className="text-muted-foreground">Địa chỉ:</span> {detail.shippingAddress ?? detail.deliveryAddress ?? '-'}</p>
                    <p><span className="text-muted-foreground">Tổng tiền:</span> {formatCurrency(detail.totalAmount ?? detail.total ?? 0)}</p>
                    <p><span className="text-muted-foreground">Trạng thái:</span>{' '}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(detail.currentStatus ?? detail.status ?? 0)}`}>
                        {OrderStatusLabel[detail.currentStatus ?? detail.status ?? 0] ?? '-'}
                      </span>
                    </p>
                    {(detail.orderItems ?? detail.items ?? []).length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">Sản phẩm</h3>
                        <ul className="space-y-1 text-sm">
                          {(detail.orderItems ?? detail.items ?? []).map((it: any, i: number) => (
                            <li key={i}>
                              {it.productName ?? it.name} x {it.quantity} — {formatCurrency(it.totalPrice ?? (it.unitPrice ?? it.price ?? 0) * (it.quantity ?? 0))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {detailOrderId && (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {detail.currentStatus === OrderStatusEnum.Pending && (
                          <Button size="sm" onClick={() => handleConfirm(detailOrderId)} disabled={acting}>
                            Xác nhận đơn
                          </Button>
                        )}
                        {detail.currentStatus === OrderStatusEnum.Confirmed && (
                          <Button size="sm" variant="outline" onClick={() => handleStartPreparing(detailOrderId)} disabled={acting}>
                            Bắt đầu chuẩn bị
                          </Button>
                        )}
                        {(detail.currentStatus !== OrderStatusEnum.Completed && detail.currentStatus !== OrderStatusEnum.Cancelled) && (
                          <Button size="sm" variant="destructive" onClick={() => setShowCancelModal(detailOrderId)}>
                            Hủy đơn
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Cancel reason modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl">
              <h3 className="mb-2 text-xl font-bold">Hủy đơn hàng</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Vui lòng nhập lý do hủy đơn để ghi lại (tùy chọn)
              </p>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do..."
                className="mb-6 w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowCancelModal(null); setCancelReason(''); }}
                  disabled={acting}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  disabled={acting}
                  onClick={() => handleCancel(showCancelModal, cancelReason)}
                >
                  {acting ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersManagementPage;
