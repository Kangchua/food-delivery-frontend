import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import useTranslation from '@/hooks/useTranslation';
import {
  adminApi,
  AdminCategory,
  CategoryCreatePayload,
  CategoryUpdatePayload,
} from '@/api/adminApi';
import { toast } from 'sonner';

interface ModalState {
  isOpen: boolean;
  isEditing: boolean;
  category: Partial<AdminCategory> | null;
}

interface DeleteConfirmState {
  isOpen: boolean;
  categoryId: string | null;
  categoryName: string | null;
}

const CategoriesManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, isEditing: false, category: null });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ isOpen: false, categoryId: null, categoryName: null });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const list = await adminApi.categories.getAll();
      setCategories(list);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error(t('error.fetchFailed') ?? 'Không tải được danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: AdminCategory) => {
    if (category) {
      setModal({ isOpen: true, isEditing: true, category: { ...category } });
    } else {
      setModal({
        isOpen: true,
        isEditing: false,
        category: { name: '', description: '', displayOrder: 0 },
      });
    }
  };

  const handleCloseModal = () => {
    setModal({ isOpen: false, isEditing: false, category: null });
  };

  const handleSaveCategory = async () => {
    const c = modal.category;
    if (!c?.name?.trim()) {
      toast.error(t('validation.nameRequired') ?? 'Nhập tên danh mục');
      return;
    }
    try {
      setSaving(true);
      if (modal.isEditing && c.id) {
        await adminApi.categories.update(c.id, {
          name: c.name.trim(),
          description: c.description ?? null,
          displayOrder: c.displayOrder ?? 0,
        });
        toast.success(t('admin.editCategory') ? 'Đã cập nhật danh mục' : 'Cập nhật thành công');
      } else {
        await adminApi.categories.create({
          name: c.name.trim(),
          description: c.description ?? null,
          displayOrder: c.displayOrder ?? 0,
        });
        toast.success(t('admin.addCategory') ? 'Đã thêm danh mục' : 'Thêm thành công');
      }
      handleCloseModal();
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.message ?? (t('error.saveFailed') ?? 'Lưu thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    setDeleteConfirm({
      isOpen: true,
      categoryId: id,
      categoryName: category?.name || 'danh mục này',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.categoryId) return;
    try {
      setDeleting(true);
      await adminApi.categories.delete(deleteConfirm.categoryId);
      toast.success(t('admin.deleteCategory') ? 'Đã xóa danh mục' : 'Xóa thành công');
      setDeleteConfirm({ isOpen: false, categoryId: null, categoryName: null });
      fetchCategories();
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
            {t('admin.categories') ?? 'Quản lý danh mục'}
          </h1>
          <Button onClick={() => handleOpenModal()} className="gradient-primary gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.addCategory') ?? 'Thêm danh mục'}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex min-h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full flex min-h-48 items-center justify-center text-muted-foreground">
              {t('common.noData') ?? 'Chưa có danh mục'}
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
                {category.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenModal(category)}
                    className="flex-1 gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    {t('common.edit') ?? 'Sửa'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title="Xóa danh mục"
          description={`Bạn có chắc chắn muốn xóa danh mục "${deleteConfirm.categoryName}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          variant="danger"
          isLoading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, categoryId: null, categoryName: null })}
        />

        {modal.isOpen && modal.category && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">
                {modal.isEditing
                  ? (t('admin.editCategory') ?? 'Sửa danh mục')
                  : (t('admin.addCategory') ?? 'Thêm danh mục')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('common.name') ?? 'Tên'} *</label>
                  <input
                    type="text"
                    value={modal.category.name ?? ''}
                    onChange={(e) =>
                      setModal({ ...modal, category: { ...modal.category!, name: e.target.value } })
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                    placeholder={t('common.enterName') ?? 'Nhập tên danh mục'}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('common.description') ?? 'Mô tả'}</label>
                  <textarea
                    value={modal.category.description ?? ''}
                    onChange={(e) =>
                      setModal({ ...modal, category: { ...modal.category!, description: e.target.value } })
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                    placeholder={t('common.enterDescription') ?? 'Mô tả (tùy chọn)'}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={0}
                    value={modal.category.displayOrder ?? 0}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        category: { ...modal.category!, displayOrder: Number(e.target.value) || 0 },
                      })
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveCategory} disabled={saving} className="gradient-primary flex-1">
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

export default CategoriesManagementPage;
