# 📚 React-Leaflet - Ví dụ sử dụng

## Ví dụ 1: Sử dụng AddressMap trong Modal

```tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AddressMap from '@/components/map/AddressMap';

export function AddressMapModal() {
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Chọn vị trí trên bản đồ</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chọn vị trí giao hàng</DialogTitle>
          </DialogHeader>

          <AddressMap
            onLocationSelect={handleLocationSelect}
            height="500px"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (selectedLocation) {
                  console.log('Đã chọn:', selectedLocation);
                  setOpen(false);
                }
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedLocation && (
        <div className="mt-4 p-4 border rounded-lg">
          <p>📍 Vị trí được chọn:</p>
          <p className="text-sm text-gray-600">{selectedLocation.address}</p>
          <p className="text-xs text-gray-500">
            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </>
  );
}
```

## Ví dụ 2: Tính khoảng cách & phí giao hàng động

```tsx
import React, { useState, useEffect } from 'react';
import {
  calculateDistance,
  calculateDeliveryFee,
  formatDistance,
} from '@/utils/locationUtils';
import { formatCurrency } from '@/utils/formatters';

interface DeliveryCalculatorProps {
  userLat: number;
  userLng: number;
}

export function DeliveryCalculator({ userLat, userLng }: DeliveryCalculatorProps) {
  const [distance, setDistance] = useState(0);
  const [fee, setFee] = useState(0);

  // Tọa độ cửa hàng
  const RESTAURANT_LAT = 10.8231;
  const RESTAURANT_LNG = 106.6830;

  useEffect(() => {
    const dist = calculateDistance(
      RESTAURANT_LAT,
      RESTAURANT_LNG,
      userLat,
      userLng
    );
    const deliveryFee = calculateDeliveryFee(dist);

    setDistance(dist);
    setFee(deliveryFee);
  }, [userLat, userLng]);

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="font-semibold mb-3">Thông tin giao hàng</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Khoảng cách:</span>
          <span className="font-medium">{formatDistance(distance)}</span>
        </div>

        <div className="flex justify-between text-red-600">
          <span>Phí giao hàng:</span>
          <span className="font-medium">{formatCurrency(fee)}</span>
        </div>

        {distance <= 1 && (
          <p className="text-xs text-green-600">✅ Miễn phí cho đơn trong khu vực 1km</p>
        )}
      </div>
    </div>
  );
}

// Sử dụng:
// <DeliveryCalculator userLat={10.7500} userLng={106.6500} />
```

## Ví dụ 3: Danh sách địa chỉ với khoảng cách

```tsx
import React, { useEffect, useState } from 'react';
import { calculateDistance, formatDistance } from '@/utils/locationUtils';
import { MapPin, Navigation } from 'lucide-react';
import type { Address } from '@/api/userApi';

interface AddressListProps {
  addresses: Address[];
  onSelectAddress: (address: Address) => void;
}

export function AddressList({ addresses, onSelectAddress }: AddressListProps) {
  const RESTAURANT_LAT = 10.8231;
  const RESTAURANT_LNG = 106.6830;

  const calculateDistanceToRestaurant = (lat: number, lng: number) => {
    return calculateDistance(RESTAURANT_LAT, RESTAURANT_LNG, lat, lng);
  };

  return (
    <div className="space-y-3">
      {addresses.map((addr) => {
        const distance =
          addr.latitude && addr.longitude
            ? calculateDistanceToRestaurant(addr.latitude, addr.longitude)
            : null;

        return (
          <div
            key={addr.id}
            onClick={() => onSelectAddress(addr)}
            className="p-4 border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />

              <div className="flex-1">
                <p className="font-medium">
                  {addr.label} - {addr.receiverName}
                </p>
                <p className="text-sm text-gray-600">{addr.fullAddress}</p>
                <p className="text-xs text-gray-500">{addr.phoneNumber}</p>

                {distance !== null && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                    <Navigation className="h-3 w-3" />
                    <span>{formatDistance(distance)}</span>
                  </div>
                )}
              </div>

              {addr.isDefault && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  Mặc định
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## Ví dụ 4: Form thêm địa chỉ với Preview bản đồ

```tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AddressMap from '@/components/map/AddressMap';
import { getAddressFromCoordinates } from '@/utils/locationUtils';

export function AddAddressForm() {
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    receiverName: '',
    phoneNumber: '',
    fullAddress: '',
    latitude: 10.8231,
    longitude: 106.6830,
  });

  const handleLocationSelect = async (
    lat: number,
    lng: number,
    address: string
  ) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      fullAddress: address,
    });
    setShowMap(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting address:', formData);
    // Gọi API để lưu
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Label>Tên địa chỉ *</Label>
        <Input
          placeholder="Nhà, Công ty, ..."
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Tên người nhận *</Label>
        <Input
          placeholder="Tên của bạn"
          value={formData.receiverName}
          onChange={(e) =>
            setFormData({ ...formData, receiverName: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Số điện thoại *</Label>
        <Input
          placeholder="0912345678"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label>Địa chỉ chi tiết *</Label>
        <textarea
          placeholder="Nhập địa chỉ..."
          value={formData.fullAddress}
          onChange={(e) =>
            setFormData({ ...formData, fullAddress: e.target.value })
          }
          className="w-full border rounded px-3 py-2"
          rows={3}
          required
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setShowMap(!showMap)}
        className="w-full"
      >
        {showMap ? '✓ Ẩn bản đồ' : '🗺️ Chọn trên bản đồ'}
      </Button>

      {showMap && (
        <div className="border rounded-lg p-4">
          <AddressMap
            onLocationSelect={handleLocationSelect}
            initialLat={formData.latitude}
            initialLng={formData.longitude}
            height="400px"
          />
        </div>
      )}

      {formData.latitude && formData.longitude && (
        <div className="p-3 bg-blue-50 rounded text-sm">
          <p>📍 Tọa độ: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</p>
        </div>
      )}

      <Button type="submit" className="w-full">
        Thêm địa chỉ
      </Button>
    </form>
  );
}
```

## Ví dụ 5: Hook custom để quản lý vị trí

```tsx
import { useState, useCallback } from 'react';
import {
  calculateDistance,
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
} from '@/utils/locationUtils';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  distance?: number; // khoảng cách đến cửa hàng
}

export function useLocation(restaurantLat = 10.8231, restaurantLng = 106.6830) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tính khoảng cách từ tọa độ hiện tại đến cửa hàng
  const calculateDistanceToRestaurant = useCallback(
    (lat: number, lng: number) => {
      return calculateDistance(restaurantLat, restaurantLng, lat, lng);
    },
    [restaurantLat, restaurantLng]
  );

  // Set vị trí từ tọa độ
  const setLocationByCoordinates = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      try {
        const address = await getAddressFromCoordinates(lat, lng);
        const distance = calculateDistanceToRestaurant(lat, lng);
        setLocation({ lat, lng, address, distance });
        setError(null);
      } catch (err) {
        setError('Lỗi lấy địa chỉ từ tọa độ');
      } finally {
        setLoading(false);
      }
    },
    [calculateDistanceToRestaurant]
  );

  // Set vị trí từ tên địa chỉ
  const setLocationByAddress = useCallback(
    async (address: string) => {
      setLoading(true);
      try {
        const coords = await getCoordinatesFromAddress(address);
        if (!coords) {
          setError('Không tìm thấy địa chỉ');
          return;
        }
        await setLocationByCoordinates(coords.lat, coords.lon);
      } catch (err) {
        setError('Lỗi tìm kiếm địa chỉ');
      } finally {
        setLoading(false);
      }
    },
    [setLocationByCoordinates]
  );

  return {
    location,
    loading,
    error,
    setLocationByCoordinates,
    setLocationByAddress,
    clearLocation: () => setLocation(null),
  };
}

// Sử dụng:
// const { location, loading, error, setLocationByAddress } = useLocation();
// await setLocationByAddress('72 Tôn Đức Thắng, District 1');
// console.log(location); // { lat: 10.7580, lng: 106.7214, address: '...', distance: 5.2 }
```

## Ví dụ 6: Component hiển thị bản đồ nhiều địa điểm

```tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Address } from '@/api/userApi';

interface MultiMarkerMapProps {
  restaurantLat: number;
  restaurantLng: number;
  userAddresses: Address[];
  selectedAddressId?: string;
}

export function MultiMarkerMap({
  restaurantLat,
  restaurantLng,
  userAddresses,
  selectedAddressId,
}: MultiMarkerMapProps) {
  const restaurantIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const selectedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const defaultIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <MapContainer
      center={[restaurantLat, restaurantLng]}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Cửa hàng */}
      <Marker position={[restaurantLat, restaurantLng]} icon={restaurantIcon}>
        <Popup>
          <div className="text-sm">
            <p className="font-bold">🏪 Cửa hàng</p>
            <p>10.8231, 106.6830</p>
          </div>
        </Popup>
      </Marker>

      {/* Các địa chỉ người dùng */}
      {userAddresses.map((addr) => (
        <Marker
          key={addr.id}
          position={[addr.latitude || 0, addr.longitude || 0]}
          icon={
            selectedAddressId === addr.id ? selectedIcon : defaultIcon
          }
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{addr.label}</p>
              <p>{addr.receiverName}</p>
              <p>{addr.fullAddress}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

---

**Nhiều cách khác để sử dụng react-leaflet!** 🗺️✨
