import React, { useEffect, useState } from 'react';
import { User, Camera, Save, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MainLayout from '@/components/layout/MainLayout';
import useTranslation from '@/hooks/useTranslation';
import { accountApi, AccountResponse, UpdateAccountRequest } from '@/api/accountApi';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<AccountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await accountApi.getAccount();
      if (response.data.isSuccess && response.data.data) {
        const profileData = response.data.data;
        setProfile(profileData);
        setFormData({
          fullName: profileData.fullName || '',
          phoneNumber: profileData.phoneNumber || '',
        });
      } else {
        toast.error(response.data.message || 'Không thể tải thông tin cá nhân');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      setUpdating(true);
      const updateData: UpdateAccountRequest = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      };

      if (avatarFile) {
        updateData.avatar = avatarFile;
      }

      const response = await accountApi.updateAccount(updateData);
      if (response.data.isSuccess && response.data.data) {
        const updatedProfileData = response.data.data;
        setProfile(updatedProfileData);
        toast.success('Cập nhật thông tin thành công');
      } else {
        toast.error(response.data.message || 'Không thể cập nhật thông tin');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Không thể cập nhật thông tin');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setUpdating(true);
      await accountApi.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Không thể đổi mật khẩu');
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg bg-destructive/10 p-8 text-center">
            <p className="text-lg font-medium text-destructive">
              Không thể tải thông tin cá nhân
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <User className="h-6 w-6" />
            Hồ sơ của tôi
          </h1>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="rounded-lg bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4">Ảnh đại diện</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={profile.avatarUrl || '/default-avatar.png'}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer hover:bg-primary/90">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Chọn ảnh mới để cập nhật avatar
                  </p>
                  {avatarFile && (
                    <p className="text-sm text-primary mt-1">
                      Đã chọn: {avatarFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="rounded-lg bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Họ tên</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <Label>Vai trò</Label>
                  <Input
                    value={profile.role}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </Button>
              </div>
            </div>

            {/* Change Password */}
            <div className="rounded-lg bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {showPasswordForm ? 'Hủy' : 'Đổi mật khẩu'}
                </Button>
              </div>

              {showPasswordForm && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={updating}
                    className="w-full gap-2"
                  >
                    <Key className="h-4 w-4" />
                    {updating ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;