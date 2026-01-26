import React from 'react';
import { Truck } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';

const ShippersManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">
          {t('admin.shippers') ?? 'Quản lý shipper'}
        </h1>
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl bg-card p-8 text-center shadow-card">
          <Truck className="mb-4 h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">
            Chức năng quản lý shipper đang được phát triển. Backend hiện chưa có API /admin/shippers.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Bạn có thể sử dụng Quản lý đơn hàng, Sản phẩm và Danh mục.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShippersManagementPage;
