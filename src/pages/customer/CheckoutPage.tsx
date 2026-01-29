import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import MainLayout from '@/components/layout/MainLayout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderApi } from '@/api/orderApi';
import { userApi } from '@/api/userApi';
import useTranslation from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/api/userApi';

type PaymentMethod = 'cod' | 'momo' | 'vnpay' | 'bank';

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [shippingFee, setShippingFee] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await userApi.getAddresses();
        setAddresses(data);
        if (data.length > 0) {
          const defaultAddress = data.find(addr => addr.isDefault) || data[0];
          setSelectedAddressId(defaultAddress.id);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    };
    
    if (user?.id) {
      fetchAddresses();
    }
  }, [user?.id]);

  // Calculate shipping fee when address or items count changes
  useEffect(() => {
    if (!selectedAddressId || items.length === 0) {
      setShippingFee(0);
      return;
    }

    const calculateFee = async () => {
      setIsCalculatingFee(true);
      try {
        const feeData = await orderApi.calculateShippingFee(selectedAddressId, items.length);
        setShippingFee(feeData.shippingFee);
        setDistance(feeData.distance);
      } catch (error: any) {
        console.error('Failed to calculate shipping fee:', error);
        // Use a reasonable default based on distance
        setShippingFee(15000);
        setDistance(0);
      } finally {
        setIsCalculatingFee(false);
      }
    };

    calculateFee();
  }, [selectedAddressId, items.length]);

  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast({ title: 'Vui lòng chọn địa chỉ giao hàng', variant: 'destructive' });
      return;
    }

    if (items.length === 0) {
      toast({ title: 'Giỏ hàng trống', variant: 'destructive' });
      return;
    }

    console.log('Items in cart:', items);
    console.log('Cart item IDs:', items.map(item => item.id));

    setIsLoading(true);
    try {
      await orderApi.checkout({
        addressId: selectedAddressId,
        cartItemIds: items.map(item => item.id),
        note: note || undefined,
        paymentMethod: paymentMethod,
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
                  {addresses.length > 0 && (
                    <div>
                      <Label>{t('address.label')}</Label>
                      <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        <div className="mt-2 space-y-2">
                          {addresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                selectedAddressId === addr.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem value={addr.id} />
                              <div className="flex-1">
                                <p className="font-medium">{addr.label} - {addr.receiverName}</p>
                                <p className="text-sm text-muted-foreground">{addr.fullAddress}</p>
                                <p className="text-xs text-muted-foreground">{addr.phoneNumber}</p>
                                {selectedAddressId === addr.id && distance > 0 && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    Khoảng cách: {distance.toFixed(1)} km
                                  </div>
                                )}
                              </div>
                              {addr.isDefault && (
                                <span className="text-xs font-medium text-primary">Mặc định</span>
                              )}
                            </label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{t('checkout.paymentMethod')}</h2>
                </div>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:border-primary/50">
                      <RadioGroupItem value="cod" />
                      <span className="font-medium">COD (Thanh toán khi nhận hàng)</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:border-primary/50">
                      <RadioGroupItem value="momo" />
                      <span className="font-medium">Momo</span>
                    </label>
                  </div>
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
                    <span>{isCalculatingFee ? 'Đang tính...' : formatCurrency(shippingFee)}</span>
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
