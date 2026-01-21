import React, { useEffect, useState } from 'react';
import { Search, Trash2, Edit2, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const UsersManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.users.getAll({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      const userList = Array.isArray(data) ? data : data?.data || [];
      setUsers(userList);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error(t('error.fetchUsers') || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm(t('admin.confirmDeleteUser') || 'Are you sure?')) return;

    try {
      await adminApi.users.delete(userId);
      toast.success(t('admin.userDeletedSuccess') || 'User deleted');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(t('error.deleteFailed') || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: number, isActive: boolean) => {
    try {
      await adminApi.users.toggleStatus(userId, !isActive);
      toast.success(t('admin.statusUpdated') || 'Status updated');
      fetchUsers();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(t('error.updateFailed') || 'Failed to update status');
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      await adminApi.users.changeRole(userId, newRole);
      toast.success(t('admin.roleUpdated') || 'Role updated');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      console.error('Error changing role:', err);
      toast.error(t('error.updateFailed') || 'Failed to update role');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'shipper':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">{t('admin.usersManagement') || 'Users Management'}</h1>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 focus:border-primary focus:outline-none"
          >
            <option value="">{t('common.allRoles') || 'All Roles'}</option>
            <option value="customer">{t('common.customer') || 'Customer'}</option>
            <option value="shipper">{t('common.shipper') || 'Shipper'}</option>
            <option value="admin">{t('common.admin') || 'Admin'}</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="rounded-lg bg-card shadow-card overflow-hidden">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              {t('common.noData') || 'No data found'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.id')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.name')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.email')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.phone')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.role')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.status')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm">{user.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{user.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{user.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === user.id ? (
                        <div className="flex gap-2">
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="text-xs rounded border bg-background px-2 py-1"
                          >
                            <option value="customer">Customer</option>
                            <option value="shipper">Shipper</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleChangeRole(user.id, editingRole)}
                            className="text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {user.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(user.id);
                            setEditingRole(user.role);
                          }}
                          className="text-xs"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          className="text-xs"
                        >
                          {user.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UsersManagementPage;
