import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import MainLayout from '@/components/layout/MainLayout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderApi } from '@/api/orderApi';
import useTranslation from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'cod' | 'momo' | 'vnpay' | 'bank';

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const paymentMethods = [
    { id: 'cod', label: t('payment.cod'), icon: '💵' },
    { id: 'momo', label: t('payment.momo'), icon: '📱' },
    { id: 'vnpay', label: t('payment.vnpay'), icon: '🏦' },
    { id: 'bank', label: t('payment.bankTransfer'), icon: '💳' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      toast({ title: 'Vui lòng nhập địa chỉ giao hàng', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await orderApi.create({
        deliveryAddress: address,
        paymentMethod,
        note: note || undefined,
      });

      setIsSuccess(true);
      clearCart();
      toast({ title: t('checkout.orderSuccess') });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      toast({ title: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
          <div className="animate-scale-in mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            {t('checkout.orderSuccess')}
          </h2>
          <p className="mb-6 text-center text-muted-foreground">
            {t('checkout.orderSuccessDesc')}
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/orders')}>
              {t('order.trackOrder')}
            </Button>
            <Button className="gradient-primary shadow-primary" onClick={() => navigate('/')}>
              {t('common.home')}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          {t('checkout.title')}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Checkout Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Delivery Address */}
              <div className="rounded-xl bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{t('checkout.deliveryAddress')}</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">{t('address.fullAddress')}</Label>
                    <Textarea
                      id="address"
                      placeholder="Số nhà, tên đường, phường, quận, thành phố..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{t('checkout.paymentMethod')}</h2>
                </div>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={method.id} />
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium">{method.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Order Note */}
              <div className="rounded-xl bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{t('checkout.orderNote')}</h2>
                </div>
                <Textarea
                  placeholder={t('checkout.notePlaceholder')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl bg-card p-6 shadow-card">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  {t('order.orderDetails')}
                </h2>

                {/* Items */}
                <div className="max-h-60 space-y-3 overflow-y-auto border-b border-border pb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          x{item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-b border-border py-4">
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
                  type="submit"
                  className="w-full gradient-primary shadow-primary"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('checkout.placeOrder')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
