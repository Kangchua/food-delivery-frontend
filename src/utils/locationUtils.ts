/**
 * Tính khoảng cách giữa hai điểm tọa độ (Haversine Formula)
 * @param lat1 - Vĩ độ điểm 1
 * @param lon1 - Kinh độ điểm 1
 * @param lat2 - Vĩ độ điểm 2
 * @param lon2 - Kinh độ điểm 2
 * @returns Khoảng cách tính bằng km
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Làm tròn 2 chữ số thập phân
};

/**
 * Tính phí giao hàng dựa trên khoảng cách
 * @param distance - Khoảng cách tính bằng km
 * @returns Phí giao hàng tính bằng VND
 */
export const calculateDeliveryFee = (distance: number): number => {
  const baseFee = 15000; // Phí cơ bản (VND)
  const feePerKm = 2000; // Phí mỗi km (VND)
  
  if (distance <= 1) {
    return baseFee;
  }
  
  return Math.round(baseFee + (distance - 1) * feePerKm);
};

/**
 * Lấy tên địa chỉ từ tọa độ (Reverse Geocoding)
 * @param lat - Vĩ độ
 * @param lon - Kinh độ
 * @returns Promise chứa tên địa chỉ
 */
export const getAddressFromCoordinates = async (
  lat: number,
  lon: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  } catch (error) {
    console.error('Error fetching address:', error);
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }
};

/**
 * Tìm kiếm tọa độ từ tên địa chỉ (Geocoding)
 * @param address - Tên địa chỉ
 * @returns Promise chứa tọa độ {lat, lon}
 */
export const getCoordinatesFromAddress = async (
  address: string
): Promise<{ lat: number; lon: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await response.json();
    
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
};

/**
 * Định dạng khoảng cách thành chuỗi
 * @param distance - Khoảng cách tính bằng km
 * @returns Chuỗi định dạng
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};
