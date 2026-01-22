import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, MapPin, Phone, CheckCircle, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MainLayout from '@/components/layout/MainLayout';
import { userApi } from '@/api/userApi';
import { useToast } from '@/hooks/use-toast';
import AddressMap from '@/components/map/AddressMap';
import type { Address } from '@/api/userApi';

const AddressesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    receiverName: '',
    phoneNumber: '',
    fullAddress: '',
    latitude: 0,
    longitude: 0,
  });

  // Fetch addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getAddresses();
      setAddresses(data);
    } catch (error: any) {
      toast({
        title: error instanceof Error ? error.message : 'Lỗi tải danh sách địa chỉ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      receiverName: address.receiverName,
      phoneNumber: address.phoneNumber,
      fullAddress: address.fullAddress,
      latitude: address.latitude || 0,
      longitude: address.longitude || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim() || !formData.receiverName.trim() || !formData.phoneNumber.trim() || !formData.fullAddress.trim()) {
      toast({
        title: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        // Update
        await userApi.updateAddress(editingId, formData);
        toast({ title: 'Cập nhật địa chỉ thành công' });
      } else {
        // Create
        await userApi.addAddress(formData);
        toast({ title: 'Thêm địa chỉ thành công' });
      }

      resetForm();
      await fetchAddresses();
    } catch (error: any) {
      toast({
        title: error instanceof Error ? error.message : 'Lỗi xử lý',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) return;

    try {
      await userApi.deleteAddress(id);
      toast({ title: 'Xóa địa chỉ thành công' });
      await fetchAddresses();
    } catch (error: any) {
      toast({
        title: error instanceof Error ? error.message : 'Lỗi xóa địa chỉ',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await userApi.setDefaultAddress(id);
      toast({ title: 'Đặt địa chỉ mặc định thành công' });
      await fetchAddresses();
    } catch (error: any) {
      toast({
        title: error instanceof Error ? error.message : 'Lỗi đặt mặc định',
        variant: 'destructive',
      });
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      fullAddress: address,
    });
    setShowMap(false);
  };

  const resetForm = () => {
    setFormData({
      label: '',
      receiverName: '',
      phoneNumber: '',
      fullAddress: '',
      latitude: 0,
      longitude: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Địa chỉ giao hàng</h1>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm địa chỉ
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-6 rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold">
              {editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Label */}
                <div>
                  <Label htmlFor="label">Tên địa chỉ *</Label>
                  <Input
                    id="label"
                    placeholder="Nhà, Công ty, ..."
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Receiver Name */}
                <div>
                  <Label htmlFor="receiverName">Tên người nhận *</Label>
                  <Input
                    id="receiverName"
                    placeholder="Nhập tên"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Nhập số điện thoại"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <Label htmlFor="fullAddress">Địa chỉ chi tiết *</Label>
                <Textarea
                  id="fullAddress"
                  placeholder="Số nhà, tên đường, phường, quận, thành phố..."
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Map Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowMap(!showMap)}
              >
                <Map className="mr-2 h-4 w-4" />
                {showMap ? 'Ẩn bản đồ' : 'Chọn vị trí trên bản đồ'}
              </Button>

              {/* Map Display */}
              {showMap && (
                <div className="rounded-lg border border-border p-4">
                  <AddressMap
                    onLocationSelect={handleLocationSelect}
                    initialLat={formData.latitude || 16.0471}
                    initialLng={formData.longitude || 108.2068}
                    height="400px"
                  />
                  {formData.latitude && formData.longitude && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="text-gray-700">
                        📍 <span className="font-medium">Tọa độ được chọn:</span> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                      {formData.fullAddress && (
                        <p className="text-gray-600 mt-1">📌 {formData.fullAddress}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có địa chỉ nào</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              Thêm địa chỉ đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-xl bg-card p-4 shadow-card transition-all hover:shadow-lg md:p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Address Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{addr.label}</h3>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                          <CheckCircle className="h-3 w-3" />
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-medium">{addr.receiverName}</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{addr.fullAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{addr.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!addr.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(addr.id)}
                      >
                        Đặt mặc định
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(addr)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(addr.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AddressesManagementPage;
