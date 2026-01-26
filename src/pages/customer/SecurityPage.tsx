import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import authApi from '@/api/authApi';

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Mật khẩu mới không khớp',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: 'Mật khẩu phải có ít nhất 6 ký tự',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await authApi.changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmPassword,
      });
      toast({ title: 'Cập nhật mật khẩu thành công' });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    } catch (err: any) {
      toast({
        title: err instanceof Error ? err.message : 'Lỗi cập nhật mật khẩu',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Bảo mật</h1>
        </div>

        {/* Change Password Section */}
        <div className="rounded-xl bg-card p-6 shadow-card">
          <div className="mb-6 flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Thay đổi mật khẩu</h2>
          </div>

          {!isChangingPassword ? (
            <Button onClick={() => setIsChangingPassword(true)}>
              Đổi mật khẩu
            </Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : 'Cập nhật'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setFormData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Additional Security Options */}
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Xác thực hai bước</h3>
                <p className="text-sm text-muted-foreground">
                  Bảo vệ tài khoản của bạn bằng xác thực hai bước
                </p>
              </div>
              <Button variant="outline" disabled>
                Sắp có
              </Button>
            </div>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Quản lý phiên</h3>
                <p className="text-sm text-muted-foreground">
                  Xem và quản lý các phiên đăng nhập của bạn
                </p>
              </div>
              <Button variant="outline" disabled>
                Sắp có
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SecurityPage;
