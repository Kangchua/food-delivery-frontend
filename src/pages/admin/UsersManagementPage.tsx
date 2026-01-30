import React, { useEffect, useState } from 'react';
import { Users, Lock, Unlock, Eye, Search, Loader2, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UsersApi, AdminUserListDto, AdminUserDetailDto, UserFilterModel } from '@/api/usersApi';
import { formatCurrency } from '@/utils/formatters';

const UsersManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUserListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetailDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch users list
  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const filter: UserFilterModel = {
        searchQuery: searchQuery || undefined,
        isActive: filterActive,
        page,
        pageSize,
      };
      const result = await UsersApi.getAllUsers(filter);
      setUsers(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi tải danh sách';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user detail
  const fetchUserDetail = async (userId: string) => {
    try {
      setLoadingDetail(true);
      const detail = await UsersApi.getUserDetail(userId);
      setSelectedUser(detail);
      setShowDetailDialog(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi tải thông tin';
      setError(errorMsg);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle block/unblock
  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      if (currentStatus) {
        // Currently active, block it
        await UsersApi.blockUser(userId);
      } else {
        // Currently blocked, unblock it
        await UsersApi.unblockUser(userId);
      }
      // Refresh list
      await fetchUsers(currentPage);
      setShowDetailDialog(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi cập nhật';
      setError(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Search and filter
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleFilterChange = (active: boolean | undefined) => {
    setFilterActive(active);
    setCurrentPage(1);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">
            {t('admin.users') ?? 'Quản lý người dùng'}
          </h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản khách hàng, khóa/mở khóa, xem lịch sử mua hàng
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Section */}
        <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <select
              value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => {
                if (e.target.value === 'all') handleFilterChange(undefined);
                else if (e.target.value === 'active') handleFilterChange(true);
                else handleFilterChange(false);
              }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Tìm kiếm'
              )}
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-lg border bg-card shadow-sm">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>Tên khách hàng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Tổng tiêu</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-b hover:bg-muted/50">
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="text-sm">{user.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? 'default' : 'destructive'}
                        className={user.isActive ? 'bg-green-600' : ''}
                      >
                        {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.totalOrders}</TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(user.totalSpent)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchUserDetail(user.id)}
                          disabled={loadingDetail}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.isActive ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleToggleBlock(user.id, user.isActive)}
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.isActive ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchUsers(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => fetchUsers(page)}
                disabled={loading}
                className="w-10"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => fetchUsers(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Sau
            </Button>
          </div>
        )}

        {/* User Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thông tin chi tiết khách hàng</DialogTitle>
              <DialogDescription>
                Xem và quản lý thông tin của khách hàng
              </DialogDescription>
            </DialogHeader>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedUser ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tên</p>
                    <p className="font-semibold">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Điện thoại</p>
                    <p className="font-semibold">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                    <Badge
                      className={selectedUser.isActive ? 'bg-green-600' : ''}
                      variant={selectedUser.isActive ? 'default' : 'destructive'}
                    >
                      {selectedUser.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày tạo</p>
                    <p className="font-semibold">
                      {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lần đăng nhập cuối</p>
                    <p className="font-semibold">
                      {selectedUser.lastLogin
                        ? new Date(selectedUser.lastLogin).toLocaleDateString('vi-VN')
                        : 'Chưa đăng nhập'}
                    </p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold">{selectedUser.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng tiêu</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(selectedUser.totalSpent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vai trò</p>
                    <div className="flex gap-1 flex-wrap">
                      {selectedUser.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                {selectedUser.recentOrders.length > 0 && (
                  <div>
                    <p className="mb-3 font-semibold">Đơn hàng gần đây</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedUser.recentOrders.map((order) => (
                        <div
                          key={order.orderId}
                          className="flex items-center justify-between rounded border p-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">{order.orderCode}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <p className="font-semibold">{formatCurrency(order.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant={selectedUser.isActive ? 'destructive' : 'default'}
                    className="flex-1"
                    onClick={() =>
                      handleToggleBlock(selectedUser.id, selectedUser.isActive)
                    }
                    disabled={actionLoading === selectedUser.id}
                  >
                    {actionLoading === selectedUser.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : selectedUser.isActive ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Khóa tài khoản
                      </>
                    ) : (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Mở khóa tài khoản
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailDialog(false)}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default UsersManagementPage;
