import React, { useState } from 'react';
import { AlertTriangle, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'in_stock' | 'low' | 'out_of_stock';
}

const StaffInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Gà tươi',
      quantity: 25,
      unit: 'kg',
      status: 'in_stock',
    },
    {
      id: '2',
      name: 'Rau xà lách',
      quantity: 3,
      unit: 'kg',
      status: 'low',
    },
    {
      id: '3',
      name: 'Tương cà chua',
      quantity: 0,
      unit: 'chai',
      status: 'out_of_stock',
    },
    {
      id: '4',
      name: 'Dầu ăn',
      quantity: 15,
      unit: 'lít',
      status: 'in_stock',
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return {
          label: 'Đủ hàng',
          color: 'bg-green-100 text-green-800',
        };
      case 'low':
        return {
          label: 'Sắp hết',
          color: 'bg-yellow-100 text-yellow-800',
        };
      case 'out_of_stock':
        return {
          label: 'Hết hàng',
          color: 'bg-red-100 text-red-800',
        };
      default:
        return {
          label: 'Không xác định',
          color: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const handleQuantityChange = (id: string, change: number) => {
    setInventory(
      inventory.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + change),
              status:
                item.quantity + change <= 0
                  ? 'out_of_stock'
                  : item.quantity + change <= 5
                  ? 'low'
                  : 'in_stock',
            }
          : item
      )
    );
    toast.success('Cập nhật tồn kho thành công');
  };

  const lowStockItems = inventory.filter(
    (item) => item.status === 'low' || item.status === 'out_of_stock'
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Quản lý tồn kho</h1>

        {/* Warning Alert */}
        {lowStockItems.length > 0 && (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                ⚠️ Cảnh báo tồn kho thấp
              </h3>
              <p className="text-sm text-amber-700">
                {lowStockItems.length} mặt hàng sắp hết hoặc đã hết hàng. Hãy
                thông báo cho quản lý để cấp thêm.
              </p>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="rounded-lg bg-card border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Tên nguyên liệu
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Đơn vị
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inventory.map((item) => {
                  const statusBadge = getStatusBadge(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-center text-lg font-bold">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Cách sử dụng quản lý tồn kho
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Nhấn nút <Plus className="h-3 w-3 inline" /> để tăng số lượng</li>
            <li>• Nhấn nút <Minus className="h-3 w-3 inline" /> để giảm số lượng</li>
            <li>• Theo dõi các mặt hàng có trạng thái "Sắp hết" hoặc "Hết hàng"</li>
            <li>• Thông báo cho quản lý khi phát hiện mặt hàng hết</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffInventoryPage;
