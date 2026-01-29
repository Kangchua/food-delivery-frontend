export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const getStatusColor = (status: number): string => {
  switch (status) {
    case 1: return 'bg-yellow-100 text-yellow-800'; // Pending
    case 3: return 'bg-blue-100 text-blue-800';   // Confirmed
    case 6: return 'bg-orange-100 text-orange-800'; // Shipping
    case 7: return 'bg-green-100 text-green-800';  // Completed
    case 8: return 'bg-red-100 text-red-800';      // Cancelled
    default: return 'bg-gray-100 text-gray-800';
  }
};
