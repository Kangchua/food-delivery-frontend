import React from 'react';
import { BarChart3 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">
          {t('admin.reports') ?? 'Báo cáo'}
        </h1>
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl bg-card p-8 text-center shadow-card">
          <BarChart3 className="mb-4 h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">
            Chức năng báo cáo & thống kê đang được phát triển. Backend hiện chưa có API /admin/reports.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Một số thống kê cơ bản đã có tại Bảng điều khiển (Dashboard).
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
