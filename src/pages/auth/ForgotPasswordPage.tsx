import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import useTranslation from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({ title: t('auth.emailRequired'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
      toast({ title: t('auth.resetEmailSent') });
    } catch (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout hideBottomNav>
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          {isSent ? (
            // Success State
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                Email đã được gửi!
              </h1>
              <p className="mb-6 text-muted-foreground">
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
              </p>
              <Link to="/auth/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-primary">
                  <span className="text-3xl">🔑</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{t('auth.forgotPassword')}</h1>
                <p className="text-muted-foreground">
                  Nhập email của bạn để nhận link đặt lại mật khẩu
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary shadow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('common.submit')}
                </Button>
              </form>

              {/* Back to Login */}
              <p className="mt-6 text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
