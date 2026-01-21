import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import useTranslation from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils/formatters';

const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">
            {t('customer.emptyCart')}
          </h2>
          <p className="mb-6 text-center text-muted-foreground">
            {t('customer.emptyCartDesc')}
          </p>
          <Link to="/menu">
            <Button className="gradient-primary shadow-primary">
              {t('customer.continueShopping')}
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          {t('nav.cart')} ({items.length})
        </h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl bg-card p-4 shadow-card"
                >
                  {/* Image */}
                  <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex flex-1 flex-col">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-semibold text-foreground hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {formatCurrency(item.product.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold text-foreground">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('customer.subtotal')}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('customer.deliveryFee')}</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
              </div>

              <div className="flex justify-between py-4 text-lg font-bold">
                <span>{t('customer.total')}</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>

              <Button
                className="w-full gradient-primary shadow-primary"
                size="lg"
                onClick={handleCheckout}
              >
                {t('checkout.title')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
