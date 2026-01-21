import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

interface ModalState {
  isOpen: boolean;
  isEditing: boolean;
  category: Partial<Category> | null;
}

const CategoriesManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, isEditing: false, category: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.categories.getAll();
      const categoryList = Array.isArray(data) ? data : data?.data || [];
      setCategories(categoryList);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error(t('error.fetchFailed') || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setModal({ isOpen: true, isEditing: true, category });
    } else {
      setModal({ isOpen: true, isEditing: false, category: { name: '' } });
    }
  };

  const handleCloseModal = () => {
    setModal({ isOpen: false, isEditing: false, category: null });
  };

  const handleSaveCategory = async () => {
    if (!modal.category?.name) {
      toast.error(t('validation.nameRequired') || 'Name is required');
      return;
    }

    try {
      if (modal.isEditing && modal.category.id) {
        await adminApi.categories.update(modal.category.id, modal.category);
        toast.success(t('admin.categoryUpdated') || 'Category updated');
      } else {
        await adminApi.categories.create(modal.category);
        toast.success(t('admin.categoryCreated') || 'Category created');
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(t('error.saveFailed') || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm(t('admin.confirmDeleteCategory') || 'Are you sure?')) return;

    try {
      setDeleting(true);
      await adminApi.categories.delete(categoryId);
      toast.success(t('admin.categoryDeleted') || 'Category deleted');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error(t('error.deleteFailed') || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('admin.categoriesManagement') || 'Categories Management'}</h1>
          <Button onClick={() => handleOpenModal()} className="gradient-primary gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.addCategory') || 'Add Category'}
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full flex min-h-64 items-center justify-center text-muted-foreground">
              {t('common.noData') || 'No categories found'}
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="rounded-lg bg-card p-6 shadow-card hover:shadow-lg transition-shadow">
                {category.image && (
                  <div className="mb-4 h-40 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <h3 className="mb-2 text-lg font-bold">{category.name}</h3>
                {category.description && (
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenModal(category)}
                    className="flex-1"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    {t('common.edit')}
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

        {/* Category Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="max-h-[90vh] max-w-md w-full overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">
                {modal.isEditing ? t('admin.editCategory') : t('admin.addCategory')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('common.name')} *</label>
                  <input
                    type="text"
                    value={modal.category?.name || ''}
                    onChange={(e) => setModal({
                      ...modal,
                      category: { ...modal.category, name: e.target.value }
                    })}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                    placeholder={t('common.enterName')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
                  <textarea
                    value={modal.category?.description || ''}
                    onChange={(e) => setModal({
                      ...modal,
                      category: { ...modal.category, description: e.target.value }
                    })}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                    placeholder={t('common.enterDescription')}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('common.imageUrl')}</label>
                  <input
                    type="text"
                    value={modal.category?.image || ''}
                    onChange={(e) => setModal({
                      ...modal,
                      category: { ...modal.category, image: e.target.value }
                    })}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                    placeholder={t('common.enterImageUrl')}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveCategory} className="gradient-primary flex-1">
                  {t('common.save')}
                </Button>
                <Button onClick={handleCloseModal} variant="outline" className="flex-1">
                  {t('common.cancel')}
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
