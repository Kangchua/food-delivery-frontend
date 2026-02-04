import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const RegisterForm: React.FC<{
  onSubmit?: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => void;
  isLoading?: boolean;
}> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast({ title: 'Vui lòng nhập họ tên', variant: 'destructive' });
      return;
    }

    if (!formData.email.trim()) {
      toast({ title: 'Vui lòng nhập email', variant: 'destructive' });
      return;
    }

    if (!formData.phone.trim()) {
      toast({ title: 'Vui lòng nhập số điện thoại', variant: 'destructive' });
      return;
    }

    // Validate phone: 10 digits, starts with 0
    if (!/^0\d{9}$/.test(formData.phone)) {
      toast({
        title: 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: 'Mật khẩu phải có ít nhất 6 ký tự', variant: 'destructive' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Mật khẩu xác nhận không khớp', variant: 'destructive' });
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại';
      toast({ title: errorMessage, variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ tên</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Nhập họ tên"
            value={formData.fullName}
            onChange={handleChange}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="0901234567"
            value={formData.phone}
            onChange={handleChange}
            className="pl-10"
            disabled={isLoading}
            maxLength={10}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Nhập số điện thoại bắt đầu bằng 0 (10 chữ số)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Mật khẩu phải có ít nhất 6 ký tự
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>
    </form>
  );
};

export default RegisterForm;
