import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import { Product } from '@/api/dataApi';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import useTranslation from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { t } = useTranslation();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        'group block overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {!product.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
            <span className="rounded-full bg-card px-3 py-1 text-sm font-medium">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
        
        {/* Quick Add Button */}
        {product.isAvailable && (
          <Button
            size="icon"
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full gradient-primary shadow-primary opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleAddToCart}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="text-sm font-medium">{product.rating || 0}</span>
          <span className="text-xs text-muted-foreground">
            ({(product.soldCount || 0).toLocaleString('vi-VN')} {t('product.sold')})
          </span>
        </div>
        
        <h3 className="mb-1 font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        
        <p className="text-lg font-bold text-primary">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
