import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import useTranslation from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { UserRole } from '@/types/enum';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect based on role
  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.SHIPPER:
        return '/shipper';
      case UserRole.STAFF:
        return '/staff';
      case UserRole.CUSTOMER:
      default:
        return '/customer';
    }
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      const user = await login(email, password);
      toast({ title: t('auth.loginSuccess') });
      navigate(getRedirectPath(user.role));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('auth.invalidCredentials');
      toast({ title: errorMessage, variant: 'destructive' });
    }
  };

  return (
    <MainLayout hideBottomNav>
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-primary">
              <span className="text-3xl">🍜</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t('auth.welcomeBack')}</h1>
            <p className="text-muted-foreground">{t('auth.login')}</p>
          </div>

          {/* Form */}
          <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>


          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-primary hover:underline"
            >
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
