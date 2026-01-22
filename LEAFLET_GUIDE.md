# Hướng dẫn sử dụng React-Leaflet

## 📦 Thư viện đã cài đặt
- **leaflet**: Thư viện bản đồ cơ bản
- **react-leaflet**: Wrapper React cho leaflet
- **leaflet-geosearch**: Tìm kiếm địa chỉ trên bản đồ

## 📁 Cấu trúc thư mục

```
src/
├── components/
│   └── map/
│       └── AddressMap.tsx          # Component bản đồ chính
├── utils/
│   └── locationUtils.ts             # Hàm tiện ích tính khoảng cách
└── pages/
    └── customer/
        ├── AddressesManagementPage.tsx  # Trang quản lý địa chỉ (có bản đồ)
        └── CheckoutPage.tsx             # Trang thanh toán (hiển thị khoảng cách)
```

## 🗺️ AddressMap Component

### Tính năng:
- Hiển thị bản đồ OpenStreetMap
- Cho phép chọn vị trí bằng cách click trên bản đồ
- Tìm kiếm địa chỉ bằng thanh tìm kiếm
- Lấy tên địa chỉ tự động từ tọa độ (Reverse Geocoding)

### Cách sử dụng:

```tsx
import AddressMap from '@/components/map/AddressMap';

// Trong component
const handleLocationSelect = (lat: number, lng: number, address: string) => {
  // lat, lng: tọa độ được chọn
  // address: tên địa chỉ
  console.log('Địa chỉ được chọn:', { lat, lng, address });
};

return (
  <AddressMap
    onLocationSelect={handleLocationSelect}
    initialLat={10.8231}  // Vĩ độ ban đầu (Saigon)
    initialLng={106.6830} // Kinh độ ban đầu
    height="400px"        // Chiều cao bản đồ
  />
);
```

### Props:
- `onLocationSelect`: Callback khi chọn vị trí
- `initialLat`: Vĩ độ ban đầu (mặc định: 10.8231)
- `initialLng`: Kinh độ ban đầu (mặc định: 106.6830)
- `height`: Chiều cao bản đồ (mặc định: '400px')

## 🧮 Hàm tiện ích (locationUtils.ts)

### 1. Tính khoảng cách giữa 2 điểm
```tsx
import { calculateDistance, formatDistance } from '@/utils/locationUtils';

const distance = calculateDistance(
  10.8231,  // Vĩ độ điểm 1
  106.6830, // Kinh độ điểm 1
  10.7500,  // Vĩ độ điểm 2
  106.6500  // Kinh độ điểm 2
); // Kết quả: 8.5 km

// Định dạng đẹp
const formatted = formatDistance(distance); // "8.5km"
```

### 2. Tính phí giao hàng
```tsx
import { calculateDeliveryFee } from '@/utils/locationUtils';

const fee = calculateDeliveryFee(5); // 5 km
// Công thức: 15000 + (5-1) * 2000 = 23000 VND
```

### 3. Lấy tên địa chỉ từ tọa độ
```tsx
import { getAddressFromCoordinates } from '@/utils/locationUtils';

const address = await getAddressFromCoordinates(10.8231, 106.6830);
// Kết quả: "123 Đường Nguyễn Hữu Cảnh, Phường Bình Thạnh, TP.HCM, ..."
```

### 4. Lấy tọa độ từ tên địa chỉ
```tsx
import { getCoordinatesFromAddress } from '@/utils/locationUtils';

const coords = await getCoordinatesFromAddress('72 Tôn Đức Thắng, District 1');
// Kết quả: { lat: 10.7580, lon: 106.7214 }
```

## 💾 Lưu trữ địa chỉ với tọa độ

### Backend DTO (CheckoutRequestDto.cs)
```csharp
public class CheckoutRequestDto
{
    public Guid AddressId { get; set; }        // ID địa chỉ
    public List<Guid> CartItemIds { get; set; } // IDs sản phẩm trong giỏ
    public string? Note { get; set; }           // Ghi chú
}
```

### Backend Entity (Address.cs)
```csharp
public class Address
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullAddress { get; set; }     // Địa chỉ đầy đủ
    public string ReceiverName { get; set; }    // Tên người nhận
    public string PhoneNumber { get; set; }     // Số điện thoại
    public string Label { get; set; }           // Tên (Nhà, Công ty, ...)
    public double Latitude { get; set; }        // Vĩ độ
    public double Longitude { get; set; }       // Kinh độ
    public bool IsDefault { get; set; }         // Mặc định?
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### Frontend API (userApi.ts)
```tsx
export interface Address {
  id: string;
  label: string;
  receiverName: string;
  phoneNumber: string;
  fullAddress: string;
  latitude?: number;      // ✅ Được lưu từ bản đồ
  longitude?: number;     // ✅ Được lưu từ bản đồ
  isDefault: boolean;
}

// Thêm địa chỉ
await userApi.addAddress({
  label: 'Nhà',
  receiverName: 'Nguyễn Văn A',
  phoneNumber: '0912345678',
  fullAddress: '123 Đường Tôn Đức Thắng',
  latitude: 10.7580,
  longitude: 106.7214,
});
```

## 🎯 Ứng dụng thực tế

### 1. Trang quản lý địa chỉ (AddressesManagementPage.tsx)
```tsx
// - Hiển thị form để nhập địa chỉ
// - Nút "Chọn vị trí trên bản đồ" để mở bản đồ
// - Click trên bản đồ để chọn vị trí
// - Tự động điền tọa độ và tên địa chỉ
// - Lưu vào backend khi submit
```

### 2. Trang thanh toán (CheckoutPage.tsx)
```tsx
// - Hiển thị danh sách địa chỉ đã lưu
// - Hiển thị khoảng cách từ cửa hàng (10.8231, 106.6830)
// - Tính toán phí giao hàng tự động (tuỳ chọn)
// - Chọn địa chỉ để thanh toán
```

## 🔌 CSS cần thiết

Thêm vào `src/index.css` hoặc `src/App.css`:

```css
/* Leaflet styles */
@import 'leaflet/dist/leaflet.css';
@import 'leaflet-geosearch/dist/geosearch.css';

/* Custom leaflet styles */
.leaflet-control-geosearch {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.leaflet-geosearch-bar {
  background: white;
  border-radius: 8px;
}

.leaflet-popup-content {
  font-family: var(--font-sans);
  margin: 8px;
}
```

## ⚙️ Cấu hình tọa độ cửa hàng

Trong `CheckoutPage.tsx`, thay đổi tọa độ mặc định:

```tsx
// Tọa độ cửa hàng (hiện tại: Saigon)
const restaurantLat = 10.8231;
const restaurantLng = 106.6830;

// Trong hiển thị địa chỉ:
calculateDistance(restaurantLat, restaurantLng, addr.latitude, addr.longitude)
```

## 🐛 Troubleshooting

### Lỗi: "Cannot find module 'leaflet-geosearch'"
```bash
npm install leaflet-geosearch --legacy-peer-deps
```

### Lỗi: Icon bản đồ không hiển thị
- Đã được fix tự động trong `AddressMap.tsx`
- Nếu vẫn lỗi, xóa cache và rebuild:
```bash
npm cache clean --force
npm install
npm run dev
```

### Lỗi: Nominatim API quá chậm
- Nominatim (OpenStreetMap) miễn phí nhưng có giới hạn request
- Để cải thiện, xem xét sử dụng service khác như Google Maps API

## 📚 Tài liệu tham khảo

- React-Leaflet: https://react-leaflet.js.org
- Leaflet: https://leafletjs.com
- OpenStreetMap Nominatim: https://nominatim.org
- Haversine Formula: https://en.wikipedia.org/wiki/Haversine_formula

---

**Đã cài đặt xong!** 🎉 Bạn có thể test thêm địa chỉ bằng bản đồ ngay.
