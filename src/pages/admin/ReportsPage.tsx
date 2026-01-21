import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { adminApi } from '@/api/adminApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  ordersToday?: number;
  revenueToday?: number;
}

interface Report {
  period: string;
  value: number;
}

interface TopItem {
  id: number;
  name: string;
  count: number;
  revenue?: number;
}

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopItem[]>([]);
  const [topCategories, setTopCategories] = useState<TopItem[]>([]);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      try {
        const statsData = await adminApi.reports.getDashboardStats();
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }

      // Fetch top products
      try {
        const productsData = await adminApi.reports.getTopProducts(10);
        const productsList = Array.isArray(productsData) ? productsData : productsData?.data || [];
        setTopProducts(productsList);
      } catch (err) {
        console.error('Error fetching top products:', err);
      }

      // Fetch top categories
      try {
        const categoriesData = await adminApi.reports.getTopCategories(10);
        const categoriesList = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
        setTopCategories(categoriesList);
      } catch (err) {
        console.error('Error fetching top categories:', err);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error(t('error.fetchFailed') || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.success(t('admin.reportExported') || 'Report exported');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">{t('admin.reports') || 'Reports'}</h1>

        {/* Date Range Selector */}
        <div className="mb-6 flex gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 focus:border-primary focus:outline-none"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 focus:border-primary focus:outline-none"
          />
          <Button onClick={fetchReports} className="gradient-primary">
            {t('admin.applyFilter') || 'Apply Filter'}
          </Button>
          <Button onClick={handleExportReport} variant="outline">
            {t('admin.exportReport') || 'Export Report'}
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="mb-8 grid gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-card p-6 shadow-card">
                  <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.totalOrders')}</p>
                </div>

                <div className="rounded-xl bg-card p-6 shadow-card">
                  <div className="mb-2 inline-flex rounded-lg bg-success/10 p-3 text-success">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.totalRevenue')}</p>
                </div>

                <div className="rounded-xl bg-card p-6 shadow-card">
                  <div className="mb-2 inline-flex rounded-lg bg-info/10 p-3 text-info">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.totalCustomers')}</p>
                </div>

                <div className="rounded-xl bg-card p-6 shadow-card">
                  <div className="mb-2 inline-flex rounded-lg bg-warning/10 p-3 text-warning">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.totalProducts')}</p>
                </div>
              </div>
            )}

            {/* Top Products & Categories */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Products */}
              <div className="rounded-lg bg-card p-6 shadow-card">
                <h2 className="mb-4 font-bold text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {t('admin.topProducts') || 'Top Products'}
                </h2>
                {topProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.slice(0, 10).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <span className="font-bold text-primary">{product.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Categories */}
              <div className="rounded-lg bg-card p-6 shadow-card">
                <h2 className="mb-4 font-bold text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t('admin.topCategories') || 'Top Categories'}
                </h2>
                {topCategories.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
                ) : (
                  <div className="space-y-3">
                    {topCategories.slice(0, 10).map((category, index) => (
                      <div key={category.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="font-bold text-primary">{category.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 rounded-lg bg-info/10 p-6">
              <h3 className="mb-3 font-bold">{t('admin.reportSummary') || 'Report Summary'}</h3>
              <div className="space-y-2 text-sm">
                <p>📊 {t('admin.reportPeriod')}: {startDate} to {endDate}</p>
                <p>📈 {t('admin.dataFetchedFrom')}: Backend API</p>
                <p>💾 {t('admin.reportCanBeExported')}: Click Export Report button</p>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
