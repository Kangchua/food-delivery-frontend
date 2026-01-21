import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { useCart } from '@/context/CartContext';
import useTranslation from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils/formatters';
import dataApi, { Product } from '@/api/dataApi';
import { toast } from 'sonner';

const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError('Product ID not found');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await dataApi.productApi.getProductById(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      addItem(product, quantity);
      toast.success('Added to cart');
      setQuantity(1);
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= 100) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Link to="/customer/menu">
            <Button variant="ghost" className="mb-6 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Button>
          </Link>
          <div className="rounded-lg bg-destructive/10 p-8 text-center">
            <p className="text-lg font-medium text-destructive">
              {error || 'Product not found'}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const rating = 4.5; // Mock rating
  const soldCount = 0;
  const reviewCount = 10;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/customer/menu">
          <Button variant="ghost" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Button>
        </Link>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Product Image */}
          <div className="flex flex-col justify-start md:col-span-1 lg:col-span-1">
            <div className="mb-6 flex h-96 w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="md:col-span-1 lg:col-span-2">
            {/* Product Name & Rating */}
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating)
                          ? 'fill-warning text-warning'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
              </div>
              {soldCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {soldCount.toLocaleString()} sold
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(product.price)}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h2 className="mb-2 font-bold">Description</h2>
                <p className="leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6 rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stock</span>
                <span className="font-bold text-success">
                  In Stock
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                Free Delivery
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="gradient-primary mb-4 w-full gap-2 py-6 text-lg shadow-primary"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>

            {/* Additional Info */}
            <div className="space-y-2 border-t pt-6">
              <p className="text-sm text-muted-foreground">
                ✓ 100% Authentic Guarantee
              </p>
              <p className="text-sm text-muted-foreground">
                ✓ Fast & Free Delivery
              </p>
              <p className="text-sm text-muted-foreground">
                ✓ Easy Returns
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
