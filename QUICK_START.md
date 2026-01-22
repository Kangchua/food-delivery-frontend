# 🗺️ React-Leaflet Setup - Hướng dẫn Nhanh

## ✅ Đã hoàn thành

### 📦 Thư viện đã cài đặt:
- ✅ `leaflet` - Thư viện bản đồ
- ✅ `react-leaflet@4.2.1` - React wrapper
- ✅ `leaflet-geosearch` - Tìm kiếm địa chỉ

### 📁 Components đã tạo:

**1. `/src/components/map/AddressMap.tsx`**
   - Bản đồ tương tác
   - Click để chọn vị trí
   - Search bar tìm kiếm
   - Tự động lấy tên địa chỉ (Reverse Geocoding)

**2. `/src/utils/locationUtils.ts`**
   - `calculateDistance()` - Tính khoảng cách 2 điểm
   - `calculateDeliveryFee()` - Tính phí giao hàng
   - `getAddressFromCoordinates()` - Lấy tên từ tọa độ
   - `getCoordinatesFromAddress()` - Lấy tọa độ từ tên
   - `formatDistance()` - Định dạng khoảng cách

### 📄 Trang đã cập nhật:

**1. AddressesManagementPage.tsx** ✅
   - Thêm nút "Chọn vị trí trên bản đồ"
   - Hiển thị bản đồ khi click nút
   - Auto-fill tọa độ & tên địa chỉ khi chọn trên bản đồ
   - Lưu latitude, longitude cùng địa chỉ

**2. CheckoutPage.tsx** ✅
   - Hiển thị khoảng cách từ cửa hàng
   - Icon Navigation bên cạnh địa chỉ
   - Khoảng cách tính tự động: `calculateDistance(10.8231, 106.6830, addr.latitude, addr.longitude)`

## 🚀 Hướng dẫn sử dụng

### Bước 1: Truy cập trang quản lý địa chỉ
```
http://localhost:8081/profile/addresses
```

### Bước 2: Thêm địa chỉ mới
1. Click **"Thêm"** hoặc **"+ Thêm địa chỉ mới"**
2. Điền form:
   - Tên địa chỉ (Nhà, Công ty, ...)
   - Tên người nhận
   - Số điện thoại
3. **Click "Chọn vị trí trên bản đồ"** 🗺️

### Bước 3: Chọn vị trí trên bản đồ
- **Cách 1**: Click trực tiếp trên bản đồ
- **Cách 2**: Dùng search bar → nhập địa chỉ → chọn kết quả
- **Kết quả**: Auto-fill tọa độ & tên địa chỉ

### Bước 4: Submit & Lưu
1. Tọa độ (latitude, longitude) tự động được lưu ✅
2. Click **"Thêm"** hoặc **"Cập nhật"**
3. Địa chỉ được lưu vào database

### Bước 5: Xem khoảng cách trong checkout
```
http://localhost:8081/checkout
```
- Chọn địa chỉ giao hàng
- Xem khoảng cách: "Cách: 5.2km"

## 🎯 Các tính năng chính

### 1️⃣ Tính khoảng cách
```tsx
import { calculateDistance, formatDistance } from '@/utils/locationUtils';

const distance = calculateDistance(
  10.8231, 106.6830,  // Cửa hàng (Saigon)
  10.7500, 106.6500   // Địa chỉ người dùng
);

console.log(formatDistance(distance)); // "7.5km"
```

### 2️⃣ Tính phí giao hàng
```tsx
import { calculateDeliveryFee } from '@/utils/locationUtils';

const fee = calculateDeliveryFee(5); // 5km
// Phí cơ bản: 15,000 VND
// + (5-1) * 2,000 = 8,000 VND
// = 23,000 VND
```

### 3️⃣ Reverse Geocoding (Lấy tên địa chỉ từ tọa độ)
```tsx
const address = await getAddressFromCoordinates(10.7580, 106.7214);
// "123 Đường Nguyễn Hữu Cảnh, Phường Bình Thạnh, TP.HCM"
```

### 4️⃣ Geocoding (Lấy tọa độ từ tên)
```tsx
const coords = await getCoordinatesFromAddress("Tan Binh District");
// { lat: 10.8000, lon: 106.6333 }
```

## 📝 Cấu hình

### Thay đổi tọa độ cửa hàng
Tìm `CheckoutPage.tsx`:
```tsx
// Dòng ~151
calculateDistance(10.8231, 106.6830, addr.latitude, addr.longitude)
//                ^^^^^^  ^^^^^^^^
//                 Vĩ độ    Kinh độ
```

### Thay đổi phí giao hàng
Tìm `locationUtils.ts`:
```tsx
export const calculateDeliveryFee = (distance: number): number => {
  const baseFee = 15000;      // 15k VND cơ bản
  const feePerKm = 2000;      // 2k VND/km
  // ...
};
```

## 🔗 API Backend cần hỗ trợ

✅ Đã hoàn thành:
- `GET /api/address` - Lấy danh sách địa chỉ ✅
- `POST /api/address` - Thêm địa chỉ (với latitude, longitude) ✅
- `PUT /api/address/{id}` - Cập nhật địa chỉ ✅
- `DELETE /api/address/{id}` - Xóa địa chỉ ✅
- `POST /api/address/{id}/set-default` - Đặt mặc định ✅

## 📍 Định dạng API Request/Response

### Thêm/Cập nhật địa chỉ
```json
{
  "label": "Nhà",
  "receiverName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "fullAddress": "123 Đường Tôn Đức Thắng, Quận 1",
  "latitude": 10.7580,
  "longitude": 106.7214
}
```

### Lấy danh sách địa chỉ
```json
{
  "id": "uuid",
  "label": "Nhà",
  "receiverName": "Nguyễn Văn A",
  "phoneNumber": "0912345678",
  "fullAddress": "123 Đường Tôn Đức Thắng",
  "latitude": 10.7580,
  "longitude": 106.7214,
  "isDefault": true
}
```

## 🎨 Styling

Thêm CSS custom (nếu cần):
```css
/* src/index.css */
@import 'leaflet/dist/leaflet.css';
@import 'leaflet-geosearch/dist/geosearch.css';

.leaflet-container {
  border-radius: 8px;
  overflow: hidden;
}
```

## ⚠️ Lưu ý

1. **OpenStreetMap Nominatim có giới hạn request** - Tối đa ~1 request/giây
2. **Latitude/Longitude là optional** - Nếu không chọn bản đồ, vẫn có thể thêm địa chỉ
3. **Tọa độ cửa hàng hiện tại**: 10.8231, 106.6830 (Saigon)

## 🐛 Debugging

Kiểm tra console để xem tọa độ:
```tsx
// Khi click chọn vị trí
console.log('Location:', { lat, lng, address });
```

## 📚 Tài liệu thêm
- Xem [LEAFLET_GUIDE.md](./LEAFLET_GUIDE.md) để chi tiết đầy đủ
- React-Leaflet docs: https://react-leaflet.js.org
- OpenStreetMap Nominatim: https://nominatim.org

---

**Mọi thứ đã sẵn sàng!** Bạn có thể test ngay bây giờ. 🎉
