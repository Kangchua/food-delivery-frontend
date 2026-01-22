# ✅ React-Leaflet Setup - Checklist Hoàn thành

## 🎯 Mục tiêu đạt được

### ✅ 1. Cài đặt thư viện
- ✅ `leaflet` - Thư viện bản đồ OpenStreetMap
- ✅ `react-leaflet` (v4.2.1) - Compatible với React 18
- ✅ `leaflet-geosearch` - Tìm kiếm địa chỉ

### ✅ 2. Components tạo mới
- ✅ `src/components/map/AddressMap.tsx` - Component bản đồ chính
  - Click để chọn vị trí
  - Search bar tìm kiếm địa chỉ
  - Auto-fill tên địa chỉ từ tọa độ
  - Marker hiển thị vị trí đã chọn

### ✅ 3. Utility Functions
- ✅ `src/utils/locationUtils.ts` - 5 hàm tiện ích
  - `calculateDistance()` - Tính khoảng cách (Haversine)
  - `calculateDeliveryFee()` - Tính phí giao hàng
  - `getAddressFromCoordinates()` - Reverse Geocoding
  - `getCoordinatesFromAddress()` - Geocoding
  - `formatDistance()` - Định dạng khoảng cách

### ✅ 4. Frontend Pages cập nhật
- ✅ `AddressesManagementPage.tsx`
  - Thêm state `showMap`
  - Thêm nút "Chọn vị trí trên bản đồ"
  - Hiển thị AddressMap component khi click nút
  - Auto-fill lat/lng khi chọn vị trí
  - Lưu tọa độ vào database

- ✅ `CheckoutPage.tsx`
  - Thêm import: `calculateDistance, formatDistance`
  - Hiển thị khoảng cách bên cạnh mỗi địa chỉ
  - Icon Navigation + "Cách: X.Xkm"

### ✅ 5. Tài liệu
- ✅ `QUICK_START.md` - Hướng dẫn nhanh
- ✅ `LEAFLET_GUIDE.md` - Hướng dẫn đầy đủ
- ✅ `EXAMPLES.md` - 6 ví dụ code
- ✅ `README_LEAFLET.md` - Tổng hợp

## 🚀 Trạng thái Current

### Frontend
- **Status**: ✅ Running on `http://localhost:8081`
- **Build**: ✅ Success (0 errors)
- **TypeScript**: ✅ No errors

### Backend
- **Status**: ✅ Running on `http://localhost:5147`
- **Dependencies**: ✅ IOrderService registered
- **Database**: ✅ Migrations applied
- **API**: ✅ /api/address ready

## 📋 Để test tính năng

### Test 1: Thêm địa chỉ bằng bản đồ
1. **Truy cập**: `http://localhost:8081/profile/addresses`
2. **Click**: "Thêm địa chỉ mới" hoặc "+"
3. **Điền form**: Tên, Tên người nhận, SĐT
4. **Click**: "🗺️ Chọn vị trí trên bản đồ"
5. **Chọn vị trí**:
   - Click trực tiếp trên bản đồ, HOẶC
   - Dùng search bar (VD: "72 Tôn Đức Thắng")
6. **Verify**: Tọa độ & tên địa chỉ auto-fill
7. **Submit**: Click "Thêm"
8. **Verify DB**: Check tọa độ được lưu

### Test 2: Xem khoảng cách trong Checkout
1. **Thêm sản phẩm vào giỏ**
2. **Truy cập**: `http://localhost:8081/checkout`
3. **Verify**: Mỗi địa chỉ hiển thị "🧭 Cách: X.Xkm"
4. **Chọn địa chỉ**: Xem khoảng cách thay đổi

### Test 3: Tính phí giao hàng
1. **Trong checkout**, xem phí giao hàng:
   - ≤ 1km: 15,000 VND
   - > 1km: 15,000 + (km - 1) * 2,000 VND

### Test 4: Search địa chỉ
1. **Trong bản đồ**, dùng search bar
2. **Nhập**: "Tan Binh District" hoặc "72 Ton Duc Thang"
3. **Verify**: Bản đồ pan đến vị trí

## 📊 Cấu hình

### Tọa độ cửa hàng (Restaurant)
- **Latitude**: 10.8231
- **Longitude**: 106.6830
- **Vị trí**: Saigon, Vietnam
- **Sửa**: Trong `CheckoutPage.tsx` dòng ~151

### Phí giao hàng
- **Phí cơ bản**: 15,000 VND
- **Phí mỗi km**: 2,000 VND
- **Sửa**: Trong `locationUtils.ts` - `calculateDeliveryFee()`

## 🔗 API Endpoints

| Method | URL | Mô tả | ✅ |
|--------|-----|-------|-----|
| GET | `/api/address` | Lấy danh sách | ✅ |
| POST | `/api/address` | Thêm (kèm lat, lng) | ✅ |
| PUT | `/api/address/{id}` | Cập nhật | ✅ |
| DELETE | `/api/address/{id}` | Xóa | ✅ |
| POST | `/api/address/{id}/set-default` | Mặc định | ✅ |

## 📁 Cấu trúc thư mục

```
src/
├── components/
│   └── map/
│       └── AddressMap.tsx                  # ✨ Map component
│
├── utils/
│   ├── formatters.ts                       # (sẵn có)
│   └── locationUtils.ts                    # ✨ Location utilities
│
├── pages/
│   └── customer/
│       ├── AddressesManagementPage.tsx     # ✨ Updated
│       └── CheckoutPage.tsx                # ✨ Updated
│
├── api/
│   └── userApi.ts                          # (sẵn có)
│
└── types/
    └── user.type.ts                        # (sẵn có)

LEAFLET_GUIDE.md                            # ✨ Hướng dẫn đầy đủ
QUICK_START.md                              # ✨ Hướng dẫn nhanh
EXAMPLES.md                                 # ✨ 6 ví dụ code
README_LEAFLET.md                           # ✨ Tổng hợp
```

## 🎨 Giao diện

### AddressesManagementPage
```
┌─────────────────────────────────────┐
│ ← Địa chỉ giao hàng                 │
├─────────────────────────────────────┤
│ [+ Thêm địa chỉ mới]                │
├─────────────────────────────────────┤
│ ☐ Nhà - Nguyễn Văn A                │
│   123 Đường Tôn Đức Thắng...       │
│   0912345678                        │
│   [Edit] [Delete]                   │
├─────────────────────────────────────┤
│ FORM: Thêm/Sửa địa chỉ             │
│  Tên: [        ]                    │
│  Người nhận: [        ]             │
│  SĐT: [        ]                    │
│  Địa chỉ: [        ]                │
│  [🗺️ Chọn vị trí] [Hủy] [Thêm]    │
│                                     │
│  [Bản đồ - 400px height]            │
│  ✓ Tọa độ: 10.7580, 106.7214       │
└─────────────────────────────────────┘
```

### CheckoutPage
```
┌────────────────────┐  ┌──────────────┐
│ Địa chỉ giao hàng  │  │ Tóm tắt đơn  │
├────────────────────┤  ├──────────────┤
│ ◉ Nhà              │  │ Sản phẩm: 1  │
│   123 Đường...     │  │ Tổng: 50k    │
│   0912345678       │  │ Phí: 23k     │
│   🧭 Cách: 5.2km   │  │ TT: 73k      │
│                    │  │              │
│ ○ Công ty          │  │ [Đặt hàng]   │
│   ...              │  └──────────────┘
│   🧭 Cách: 8.1km   │
└────────────────────┘
```

## 🧪 Test Cases

### ✅ Test 1: Add Address with Map
- [x] Mở page `/profile/addresses`
- [x] Click "Thêm địa chỉ mới"
- [x] Điền form (label, name, phone)
- [x] Click "Chọn vị trí trên bản đồ"
- [x] Click trên bản đồ
- [x] Verify lat/lng auto-fill
- [x] Submit form
- [x] Verify in database

### ✅ Test 2: Search Address
- [x] Click "Chọn vị trí trên bản đồ"
- [x] Dùng search bar
- [x] Nhập "Tan Binh District"
- [x] Verify bản đồ pan & zoom
- [x] Click kết quả
- [x] Verify marker + address

### ✅ Test 3: Display Distance
- [x] Add product to cart
- [x] Go to checkout
- [x] Select address
- [x] Verify distance shows: "🧭 Cách: X.Xkm"
- [x] Change address
- [x] Verify distance updates

### ✅ Test 4: Calculate Fee
- [x] Distance ≤ 1km: Fee = 15,000
- [x] Distance = 5km: Fee = 23,000
- [x] Distance = 10km: Fee = 33,000

## 📝 Notes

1. **API Nominatim** - Miễn phí nhưng có giới hạn (~1 req/s)
2. **OpenStreetMap** - Dữ liệu có thể không chính xác ở một số khu vực
3. **Leaflet Icon** - Đã fix CDN URLs, không cần lo icon không hiển thị
4. **Mobile** - Bản đồ responsive, hoạt động tốt trên mobile

## 🎯 Tính năng thêm (Future)

- [ ] Lưu multiple locations (favorite places)
- [ ] Draw delivery zone on map
- [ ] Real-time delivery tracking
- [ ] Google Maps integration
- [ ] Apple Maps support
- [ ] Route optimization

## 💡 Tips

1. **Debug Map**: Mở DevTools → Console → kiểm tra location object
2. **API Key**: Nominatim free, không cần API key
3. **Custom Marker**: Thay icon trong AddressMap.tsx
4. **Performance**: Leaflet optimize tự động

## ❓ FAQ

**Q: Tại sao bản đồ không hiển thị?**
A: Check browser console cho errors, clear cache, rebuild

**Q: Tại sao search chậm?**
A: Nominatim API miễn phí, có giới hạn request

**Q: Làm sao thay cửa hàng khác?**
A: Cập nhật `restaurantLat, restaurantLng` trong CheckoutPage.tsx

**Q: Làm sao tính phí khác?**
A: Sửa `calculateDeliveryFee()` trong locationUtils.ts

---

## 📞 Support

Xem tài liệu: [LEAFLET_GUIDE.md](./LEAFLET_GUIDE.md) 📖

**Lời chúc: Chúc bạn sử dụng tốt!** 🎉🗺️✨
