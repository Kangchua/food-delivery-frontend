import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/customer/ProductCard';
import { SkeletonList } from '@/components/common/Skeleton';
import { productApi, Category, Product } from '@/api/dataApi';
import useTranslation from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const MenuPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await productApi.getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productApi.getProducts(
          selectedCategory || undefined,
          searchQuery || undefined
        );
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (categoryId) params.set('category', categoryId);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSearchParams({});
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            {t('nav.menu')}
          </h1>
          <p className="text-muted-foreground">
            Khám phá các món ăn ngon từ khắp nơi
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('customer.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-4"
            />
          </form>
          
          {(searchQuery || selectedCategory) && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Categories Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategorySelect(null)}
            className={cn(
              'flex-shrink-0',
              selectedCategory === null && 'gradient-primary shadow-primary'
            )}
          >
            Tất cả
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategorySelect(category.id)}
              className={cn(
                'flex-shrink-0',
                selectedCategory === category.id && 'gradient-primary shadow-primary'
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <SkeletonList count={8} />
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">
              Không tìm thấy sản phẩm nào
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MenuPage;
