import React from 'react';
import { Users } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';

const UsersManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">
          {t('admin.users') ?? 'Quản lý người dùng'}
        </h1>
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl bg-card p-8 text-center shadow-card">
          <Users className="mb-4 h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">
            Chức năng quản lý người dùng đang được phát triển. Backend hiện chưa có API /admin/users.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Bạn có thể sử dụng Quản lý đơn hàng, Sản phẩm và Danh mục.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default UsersManagementPage;
