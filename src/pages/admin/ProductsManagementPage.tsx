import React, { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { adminApi } from '@/api/adminApi';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  categoryName?: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
}

interface ModalState {
  isOpen: boolean;
  isEditing: boolean;
  product: Partial<Product> | null;
}

const ProductsManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>({ isOpen: false, isEditing: false, product: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.products.getAll({ search: search || undefined });
      const productList = Array.isArray(data) ? data : data?.data || [];
      setProducts(productList);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error(t('error.fetchFailed') || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setModal({ isOpen: true, isEditing: true, product });
    } else {
      setModal({ isOpen: true, isEditing: false, product: { stock: 0, price: 0 } });
    }
  };

  const handleCloseModal = () => {
    setModal({ isOpen: false, isEditing: false, product: null });
  };

  const handleSaveProduct = async () => {
    if (!modal.product) return;

    try {
      if (modal.isEditing && modal.product.id) {
        await adminApi.products.update(modal.product.id, modal.product);
        toast.success(t('admin.productUpdated') || 'Product updated');
      } else {
        await adminApi.products.create(modal.product);
        toast.success(t('admin.productCreated') || 'Product created');
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error(t('error.saveFailed') || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm(t('admin.confirmDeleteProduct') || 'Are you sure?')) return;

    try {
      setDeleting(true);
      await adminApi.products.delete(productId);
      toast.success(t('admin.productDeleted') || 'Product deleted');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(t('error.deleteFailed') || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('admin.productsManagement') || 'Products Management'}</h1>
          <Button onClick={() => handleOpenModal()} className="gradient-primary gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.addProduct') || 'Add Product'}
          </Button>
        </div>

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

        {/* Products Table */}
        <div className="rounded-lg bg-card shadow-card overflow-hidden">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-muted-foreground">
              {t('common.noData') || 'No products found'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.id')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.name')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.category')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.price')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.stock')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm">{product.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-sm">{product.categoryName || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        product.stock > 0 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {product.stock} {t('common.items')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
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
          )}
        </div>

        {/* Product Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="max-h-[90vh] max-w-md w-full overflow-y-auto rounded-lg bg-card p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">
                {modal.isEditing ? t('admin.editProduct') : t('admin.addProduct')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('common.name')}</label>
                  <input
                    type="text"
                    value={modal.product?.name || ''}
                    onChange={(e) => setModal({
                      ...modal,
                      product: { ...modal.product, name: e.target.value }
                    })}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('common.price')}</label>
                  <input
                    type="number"
                    value={modal.product?.price || ''}
                    onChange={(e) => setModal({
                      ...modal,
                      product: { ...modal.product, price: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('common.stock')}</label>
                  <input
                    type="number"
                    value={modal.product?.stock || ''}
                    onChange={(e) => setModal({
                      ...modal,
                      product: { ...modal.product, stock: parseInt(e.target.value) }
                    })}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
                  <textarea
                    value={modal.product?.description || ''}
                    onChange={(e) => setModal({
                      ...modal,
                      product: { ...modal.product, description: e.target.value }
                    })}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveProduct} className="gradient-primary flex-1">
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

export default ProductsManagementPage;
