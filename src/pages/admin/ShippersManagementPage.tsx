import React, { useEffect, useState } from 'react';
import shipperApi from '../../api/shipperApi';
import { ShipperUser } from '../../types/shipper';

const ShipperManagement = () => {
    const [shippers, setShippers] = useState<ShipperUser[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Hàm load dữ liệu từ BE
    const loadData = async () => {
        try {
            const response = await shipperApi.getAll();
            setShippers(response.data);
        } catch (error) {
            console.error("Không lấy được danh sách Shipper", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // 2. Hàm xử lý khi bấm nút Khóa/Mở
    const handleToggle = async (id: string, currentStatus: boolean) => {
        if (window.confirm(`Bạn có chắc muốn ${currentStatus ? "Khóa" : "Mở"} shipper này?`)) {
            try {
                await shipperApi.toggleStatus(id, !currentStatus);
                alert("Cập nhật thành công!");
                loadData(); // Load lại bảng sau khi sửa
            } catch (error) {
                alert("Lỗi khi cập nhật trạng thái!");
            }
        }
    };

    if (loading) return <div>Đang tải dữ liệu...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Quản Lý Đội Ngũ Shipper</h2>
            <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f4f4f4' }}>
                        <th>Họ Tên</th>
                        <th>Email</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {shippers.map((item) => (
        <tr key={item.id}>
            <td>{item.user?.fullName}</td> 

            <td>{item.user?.email}</td>
            
            <td style={{ color: item.user?.isActive ? 'green' : 'red' }}>
                {item.user?.isActive ? "Đang hoạt động" : "Bị khóa"}
            </td>
            
            <td>
                <button 
                    onClick={() => handleToggle(item.userId, item.user?.isActive)}
                    style={{ 
                        background: item.user?.isActive ? '#ff4d4f' : '#52c41a', 
                        color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' 
                    }}
                >
                    {item.user?.isActive ? "Khóa" : "Mở khóa"}
                </button>
            </td>
        </tr>
    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShipperManagement;