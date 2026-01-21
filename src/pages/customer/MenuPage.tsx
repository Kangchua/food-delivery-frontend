import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/customer/ProductCard';
import { SkeletonList } from '@/components/common/Skeleton';
import { productApi, Category, Product } from '@/api/dataApi';
import useTranslation from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 12;

const MenuPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>(
    (searchParams.get('sort') as any) || 'newest'
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await productApi.getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productApi.getProducts(
          selectedCategory || undefined,
          searchQuery || undefined
        );
        setAllProducts(data);
        setCurrentPage(1);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Sort products
  const sortedProducts = [...allProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        // Sort by DisplayOrder (ascending - lower number = more important)
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      case 'newest':
      default:
        // Sort by CreatedAt (descending - newest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    }
  });

  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('sort', sortBy);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (categoryId) params.set('category', categoryId);
    params.set('sort', sortBy);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('sort', newSort);
    params.set('page', '1');
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('sort', sortBy);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('newest');
    setCurrentPage(1);
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

        {/* Search & Filters Header */}
        <div className="mb-6 flex flex-col gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-4"
            />
          </form>
          
          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
            </Button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-low">Giá: Thấp → Cao</option>
              <option value="price-high">Giá: Cao → Thấp</option>
              <option value="popular">Phổ biến nhất</option>
            </select>

            {(searchQuery || selectedCategory) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory) && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  <span>🔍 {searchQuery}</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedCategory && (
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  <span>📁 {categories.find(c => c.id === selectedCategory)?.name}</span>
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className="hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories Filter - Expandable */}
        {showFilters && (
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
        )}

        {/* Products Count */}
        {!isLoading && allProducts.length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            Hiển thị {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, sortedProducts.length)} của {sortedProducts.length} sản phẩm
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <SkeletonList count={12} />
        ) : paginatedProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-lg text-muted-foreground">
              Không tìm thấy sản phẩm nào
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        'h-10 w-10 p-0',
                        page === currentPage && 'gradient-primary shadow-primary'
                      )}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default MenuPage;
