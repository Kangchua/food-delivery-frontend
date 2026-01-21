import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/customer/ProductCard';
import CategoryCard from '@/components/customer/CategoryCard';
import { SkeletonList } from '@/components/common/Skeleton';
import { productApi, Category, Product } from '@/api/dataApi';
import useTranslation from '@/hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Redirect based on role
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
    if (user?.role === 'shipper') {
      navigate('/shipper');
      return;
    }

    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          productApi.getCategories(),
          productApi.getProducts(),
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="relative z-10 max-w-2xl">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
              Đặt món ngon
              <br />
              <span className="text-gradient">giao tận nơi</span>
            </h1>
            <p className="mb-6 text-muted-foreground md:text-lg">
              Hàng ngàn món ăn ngon từ các nhà hàng uy tín, giao hàng nhanh chóng trong 30 phút
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('customer.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-12 pr-4 text-base shadow-md"
                />
              </div>
              <Button type="submit" className="h-12 px-6 gradient-primary shadow-primary">
                {t('common.search')}
              </Button>
            </form>

            {/* Location */}
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Giao đến: <strong className="text-foreground">TP. Đà Nẵng</strong></span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 h-60 w-60 rounded-full bg-accent/5 blur-3xl" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            {t('customer.popularCategories')}
          </h2>
          <Link
            to="/menu"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {t('common.viewMore')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-muted p-4">
                <div className="mx-auto h-16 w-16 rounded-xl bg-muted-foreground/20" />
                <div className="mt-3 h-4 rounded bg-muted-foreground/20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Products Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            {t('customer.popularDishes')}
          </h2>
          <Link
            to="/menu"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {t('common.viewMore')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <SkeletonList count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="overflow-hidden rounded-3xl gradient-primary p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-bold text-primary-foreground md:text-3xl">
            Tải ứng dụng FoodGo ngay!
          </h2>
          <p className="mb-6 text-primary-foreground/80">
            Đặt đồ ăn dễ dàng hơn với ứng dụng di động
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              className="shadow-lg"
            >
              <span className="mr-2">🍎</span> App Store
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="shadow-lg"
            >
              <span className="mr-2">🤖</span> Google Play
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
