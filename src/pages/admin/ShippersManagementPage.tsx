import React, { useEffect, useState } from 'react';
import { Search, Eye, EyeOff, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';

interface Shipper {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  totalDeliveries?: number;
  completedDeliveries?: number;
  averageRating?: number;
  successRate?: number;
}

interface DetailModal {
  isOpen: boolean;
  shipper: Shipper | null;
}

const ShippersManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<DetailModal>({ isOpen: false, shipper: null });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchShippers();
  }, []);

  useEffect(() => {
    // Filter shippers by search
    if (search) {
      // Already filtered in fetchShippers
    }
  }, [search]);

  const fetchShippers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.shippers.getAll();
      let shipperList = Array.isArray(data) ? data : data?.data || [];
      
      // Filter by search
      if (search) {
        shipperList = shipperList.filter(s =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.email?.toLowerCase().includes(search.toLowerCase()) ||
          s.phone?.includes(search)
        );
      }
      
      setShippers(shipperList);
    } catch (err) {
      console.error('Error fetching shippers:', err);
      toast.error(t('error.fetchFailed') || 'Failed to fetch shippers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (shipperId: number, isActive: boolean) => {
    try {
      setUpdating(true);
      await adminApi.shippers.toggleStatus(shipperId, !isActive);
      toast.success(t('admin.statusUpdated') || 'Status updated');
      fetchShippers();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(t('error.updateFailed') || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetails = async (shipper: Shipper) => {
    try {
      const stats = await adminApi.shippers.getStats(shipper.id);
      setDetail({ 
        isOpen: true, 
        shipper: { ...shipper, ...stats }
      });
    } catch (err) {
      console.error('Error fetching shipper stats:', err);
      // Still open detail modal with basic info
      setDetail({ isOpen: true, shipper });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">{t('admin.shippersManagement') || 'Shippers Management'}</h1>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Shippers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : shippers.length === 0 ? (
            <div className="col-span-full flex min-h-64 items-center justify-center text-muted-foreground">
              {t('common.noData') || 'No shippers found'}
            </div>
          ) : (
            shippers.map((shipper) => (
              <div key={shipper.id} className="rounded-lg bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold">{shipper.name}</h3>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      shipper.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {shipper.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{shipper.email}</p>
                  <p className="text-sm text-muted-foreground">{shipper.phone}</p>
                </div>

                {/* Stats */}
                {shipper.totalDeliveries !== undefined && (
                  <div className="mb-4 space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        {t('admin.deliveries')}
                      </span>
                      <span className="font-bold">{shipper.totalDeliveries}</span>
                    </div>
                    {shipper.completedDeliveries !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('admin.completed')}</span>
                        <span className="font-bold">{shipper.completedDeliveries}</span>
                      </div>
                    )}
                    {shipper.averageRating !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Star className="h-4 w-4" />
                          {t('admin.rating')}
                        </span>
                        <span className="font-bold">{shipper.averageRating?.toFixed(1) || '-'}</span>
                      </div>
                    )}
                    {shipper.successRate !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('admin.successRate')}</span>
                        <span className="font-bold">{(shipper.successRate * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(shipper)}
                    className="flex-1 text-xs"
                  >
                    {t('common.view')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(shipper.id, shipper.isActive)}
                    disabled={updating}
                    className="text-xs"
                  >
                    {shipper.isActive ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {detail.isOpen && detail.shipper && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="max-h-[90vh] max-w-md w-full overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">{detail.shipper.name}</h2>

              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">{t('common.email')}</p>
                  <p className="font-medium">{detail.shipper.email}</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">{t('common.phone')}</p>
                  <p className="font-medium">{detail.shipper.phone}</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">{t('common.status')}</p>
                  <p className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    detail.shipper.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {detail.shipper.isActive ? t('common.active') : t('common.inactive')}
                  </p>
                </div>

                {detail.shipper.totalDeliveries !== undefined && (
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p className="font-bold mb-3">{t('admin.statistics')}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('admin.totalDeliveries')}</span>
                      <span className="font-bold">{detail.shipper.totalDeliveries}</span>
                    </div>
                    {detail.shipper.completedDeliveries !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('admin.completedDeliveries')}</span>
                        <span className="font-bold">{detail.shipper.completedDeliveries}</span>
                      </div>
                    )}
                    {detail.shipper.averageRating !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('admin.averageRating')}</span>
                        <span className="font-bold">{detail.shipper.averageRating?.toFixed(1) || '-'}</span>
                      </div>
                    )}
                    {detail.shipper.successRate !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('admin.successRate')}</span>
                        <span className="font-bold">{(detail.shipper.successRate * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => handleToggleStatus(detail.shipper!.id, detail.shipper!.isActive)}
                  disabled={updating}
                  className={detail.shipper.isActive ? 'gradient-primary flex-1' : 'bg-success flex-1'}
                >
                  {detail.shipper.isActive ? t('admin.deactivate') : t('admin.activate')}
                </Button>
                <Button
                  onClick={() => setDetail({ isOpen: false, shipper: null })}
                  variant="outline"
                  className="flex-1"
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ShippersManagementPage;
