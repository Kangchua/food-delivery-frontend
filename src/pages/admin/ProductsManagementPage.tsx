import React, { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Edit2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import useTranslation from '@/hooks/useTranslation';
import {
  adminApi,
  AdminProduct,
  AdminCategory,
  ProductCreatePayload,
  ProductUpdatePayload,
} from '@/api/adminApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface ModalState {
  isOpen: boolean;
  isEditing: boolean;
  product: Partial<AdminProduct> | null;
}

interface DeleteConfirmState {
  isOpen: boolean;
  productId: string | null;
  productName: string | null;
}

const ProductsManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [modal, setModal] = useState<ModalState>({ isOpen: false, isEditing: false, product: null });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ isOpen: false, productId: null, productName: null });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodList, catList] = await Promise.all([
        adminApi.products.getAll({ q: search || undefined, categoryId: categoryFilter || undefined }),
        adminApi.categories.getAll(),
      ]);
      setProducts(prodList);
      setCategories(catList);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error(t('error.fetchFailed') ?? 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, categoryFilter]);

  const handleOpenModal = (product?: AdminProduct) => {
    if (product) {
      setModal({ isOpen: true, isEditing: true, product: { ...product } });
    } else {
      setModal({
        isOpen: true,
        isEditing: false,
        product: {
          name: '',
          price: 0,
          categoryId: categories[0]?.id ?? '',
          imageUrl: '',
          isAvailable: true,
          isFeatured: false,
          displayOrder: 0,
        },
      });
    }
  };

  const handleCloseModal = () => {
    setModal({ isOpen: false, isEditing: false, product: null });
  };

  const handleSaveProduct = async () => {
    const p = modal.product;
    if (!p?.name || p.price == null) {
      toast.error(t('validation.nameRequired') ?? 'Nhập tên và giá');
      return;
    }
    if (!modal.isEditing && !p.categoryId) {
      toast.error(t('admin.productCategory') ?? 'Chọn danh mục');
      return;
    }
    try {
      setSaving(true);
      if (modal.isEditing && p.id) {
        await adminApi.products.update(p.id, {
          name: p.name,
          price: Number(p.price),
          imageUrl: p.imageUrl ?? null,
          isAvailable: p.isAvailable ?? true,
          isFeatured: p.isFeatured ?? false,
          displayOrder: p.displayOrder ?? 0,
        });
        toast.success(t('admin.editProduct') ? 'Đã cập nhật sản phẩm' : 'Cập nhật thành công');
      } else {
        await adminApi.products.create({
          categoryId: p.categoryId!,
          name: p.name,
          price: Number(p.price),
          imageUrl: p.imageUrl ?? null,
          isAvailable: p.isAvailable ?? true,
          isFeatured: p.isFeatured ?? false,
          displayOrder: p.displayOrder ?? 0,
        });
        toast.success(t('admin.addProduct') ? 'Đã thêm sản phẩm' : 'Thêm thành công');
      }
      handleCloseModal();
      loadData();
    } catch (err: any) {
      toast.error(err?.message ?? (t('error.saveFailed') ?? 'Lưu thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await adminApi.products.toggleAvailability(id);
      toast.success(t('common.updateSuccess') ?? 'Đã cập nhật');
      loadData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật thất bại');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    setDeleteConfirm({
      isOpen: true,
      productId: id,
      productName: product?.name || 'sản phẩm này',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.productId) return;
    try {
      setDeleting(true);
      await adminApi.products.delete(deleteConfirm.productId);
      toast.success(t('admin.deleteProduct') ? 'Đã xóa sản phẩm' : 'Xóa thành công');
      setDeleteConfirm({ isOpen: false, productId: null, productName: null });
      loadData();
    } catch (err: any) {
      toast.error(err?.message ?? (t('error.deleteFailed') ?? 'Xóa thất bại'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">
            {t('admin.products') ?? 'Quản lý sản phẩm'}
          </h1>
          <Button onClick={() => handleOpenModal()} className="gradient-primary gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.addProduct') ?? 'Thêm sản phẩm'}
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('common.search') ?? 'Tìm kiếm...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 focus:border-primary focus:outline-none"
          >
            <option value="">{t('common.all') ?? 'Tất cả danh mục'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              {t('common.noData') ?? 'Chưa có sản phẩm'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">{t('common.name') ?? 'Tên'}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.productCategory') ?? 'Danh mục'}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">{t('common.price') ?? 'Giá'}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">{t('admin.productStatus') ?? 'Trạng thái'}</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">{t('common.actions') ?? 'Thao tác'}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted" />
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{product.categoryName || '-'}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            product.isAvailable ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {product.isAvailable
                            ? (t('common.available') ?? 'Đang bán')
                            : (t('common.unavailable') ?? 'Tạm dừng')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(product)}
                            className="text-xs"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleAvailability(product.id)}
                            title={product.isAvailable ? 'Tạm dừng bán' : 'Bật bán lại'}
                            className="text-xs"
                          >
                            {product.isAvailable ? (
                              <PowerOff className="h-3 w-3" />
                            ) : (
                              <Power className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleting}
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
            </div>
          )}
        </div>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title="Xóa sản phẩm"
          description={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteConfirm.productName}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          variant="danger"
          isLoading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, productId: null, productName: null })}
        />

        {modal.isOpen && modal.product && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">
                {modal.isEditing ? (t('admin.editProduct') ?? 'Sửa sản phẩm') : (t('admin.addProduct') ?? 'Thêm sản phẩm')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('common.name') ?? 'Tên'} *</label>
                  <input
                    type="text"
                    value={modal.product.name ?? ''}
                    onChange={(e) =>
                      setModal({ ...modal, product: { ...modal.product!, name: e.target.value } })
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
                {!modal.isEditing && (
                  <div>
                    <label className="mb-1 block text-sm font-medium">{t('admin.productCategory') ?? 'Danh mục'} *</label>
                    <select
                      value={modal.product.categoryId ?? ''}
                      onChange={(e) =>
                        setModal({ ...modal, product: { ...modal.product!, categoryId: e.target.value } })
                      }
                      className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                    >
                      <option value="">-- Chọn --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('common.price') ?? 'Giá'} *</label>
                  <input
                    type="number"
                    min={0}
                    value={modal.product.price ?? ''}
                    onChange={(e) =>
                      setModal({ ...modal, product: { ...modal.product!, price: Number(e.target.value) || 0 } })
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('admin.productImage') ?? 'URL hình ảnh'}</label>
                  <input
                    type="text"
                    value={modal.product.imageUrl ?? ''}
                    onChange={(e) =>
                      setModal({ ...modal, product: { ...modal.product!, imageUrl: e.target.value || undefined } })
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={modal.product.isAvailable ?? true}
                      onChange={(e) =>
                        setModal({ ...modal, product: { ...modal.product!, isAvailable: e.target.checked } })
                      }
                    />
                    <span className="text-sm">{t('common.available') ?? 'Đang bán'}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={modal.product.isFeatured ?? false}
                      onChange={(e) =>
                        setModal({ ...modal, product: { ...modal.product!, isFeatured: e.target.checked } })
                      }
                    />
                    <span className="text-sm">{t('product.featured') ?? 'Nổi bật'}</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveProduct} disabled={saving} className="gradient-primary flex-1">
                  {t('common.save') ?? 'Lưu'}
                </Button>
                <Button onClick={handleCloseModal} variant="outline" className="flex-1">
                  {t('common.cancel') ?? 'Hủy'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductsManagementPage;
