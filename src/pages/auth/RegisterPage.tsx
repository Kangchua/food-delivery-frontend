import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import useTranslation from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  const handleRegisterSubmit = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => {
    try {
      await register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
      });
      toast({ title: t('auth.registerSuccess') });
      navigate('/auth/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('common.error');
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
            <h1 className="text-2xl font-bold text-foreground">{t('auth.createAccount')}</h1>
            <p className="text-muted-foreground">{t('auth.register')}</p>
          </div>

          {/* Form */}
          <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} />

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link to="/auth/login" className="font-medium text-primary hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
