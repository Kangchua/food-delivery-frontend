import React, { useEffect, useState } from 'react';
import { Search, Star, User, Package, Calendar, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';
import staffApi from '@/api/staffApi';

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  productName: string;
  orderCode: string;
  rating: number;
  comment?: string;
  createdAt: string;
  isHidden: boolean;
}

interface RatingStats {
  totalReviews: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

const StaffReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [stats, setStats] = useState<RatingStats>({
    totalReviews: 0,
    averageRating: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [search, ratingFilter, allReviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getReviews();

      if (response.isSuccess && response.data) {
        const reviewList = response.data;
        setAllReviews(reviewList);
        calculateStats(reviewList);
      } else {
        toast.error('Không thể tải đánh giá');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Lỗi khi tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewList: Review[]) => {
    const visibleReviews = reviewList.filter(r => !r.isHidden);
    const totalReviews = visibleReviews.length;
    
    const ratingCounts = {
      5: visibleReviews.filter(r => r.rating === 5).length,
      4: visibleReviews.filter(r => r.rating === 4).length,
      3: visibleReviews.filter(r => r.rating === 3).length,
      2: visibleReviews.filter(r => r.rating === 2).length,
      1: visibleReviews.filter(r => r.rating === 1).length,
    };

    const averageRating =
      totalReviews > 0
        ? (
            visibleReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          ).toFixed(1)
        : '0';

    setStats({
      totalReviews,
      averageRating: parseFloat(averageRating),
      fiveStarCount: ratingCounts[5],
      fourStarCount: ratingCounts[4],
      threeStarCount: ratingCounts[3],
      twoStarCount: ratingCounts[2],
      oneStarCount: ratingCounts[1],
    });
  };

  const filterReviews = () => {
    let filtered = allReviews.filter(r => !r.isHidden);

    if (ratingFilter) {
      filtered = filtered.filter(r => r.rating === ratingFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.customerName.toLowerCase().includes(searchLower) ||
          r.productName.toLowerCase().includes(searchLower) ||
          r.orderCode.toLowerCase().includes(searchLower)
      );
    }

    setReviews(filtered);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating: number) => {
    const labels: { [key: number]: string } = {
      5: 'Rất tốt',
      4: 'Tốt',
      3: 'Bình thường',
      2: 'Không tốt',
      1: 'Rất tệ',
    };
    return labels[rating] || 'Không xác định';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const StatCard = ({ icon: Icon, title, value }: any) => (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <Icon size={24} className="mx-auto text-blue-600 mb-2" />
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đánh giá & Phản hồi
          </h1>
          <p className="text-gray-600">
            Xem và quản lý đánh giá từ khách hàng
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            title="Tổng đánh giá"
            value={stats.totalReviews}
          />
          <StatCard
            icon={Star}
            title="Đánh giá trung bình"
            value={stats.averageRating.toFixed(1)}
          />
          <div className="bg-white rounded-lg shadow p-4">
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    {rating}
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  </span>
                  <span className="font-semibold">
                    {rating === 5 && stats.fiveStarCount}
                    {rating === 4 && stats.fourStarCount}
                    {rating === 3 && stats.threeStarCount}
                    {rating === 2 && stats.twoStarCount}
                    {rating === 1 && stats.oneStarCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khách, sản phẩm, mã đơn..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter || ''}
              onChange={e =>
                setRatingFilter(e.target.value ? parseInt(e.target.value) : null)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Tất cả đánh giá</option>
              <option value="5">5 sao - Rất tốt</option>
              <option value="4">4 sao - Tốt</option>
              <option value="3">3 sao - Bình thường</option>
              <option value="2">2 sao - Không tốt</option>
              <option value="1">1 sao - Rất tệ</option>
            </select>
          </div>

          {/* Active Filters */}
          {(search || ratingFilter) && (
            <div className="flex flex-wrap gap-2">
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  Tìm: {search}
                  <X size={14} />
                </button>
              )}
              {ratingFilter && (
                <button
                  onClick={() => setRatingFilter(null)}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {ratingFilter} sao
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Đang tải đánh giá...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Star size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không có đánh giá nào</p>
            </div>
          ) : (
            reviews.map(review => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  {review.customerAvatar ? (
                    <img
                      src={review.customerAvatar}
                      alt={review.customerName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User size={24} className="text-gray-600" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.customerName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Sản phẩm: {review.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Đơn hàng: {review.orderCode}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex gap-1 mb-2 justify-end">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm font-semibold text-blue-600">
                          {getRatingLabel(review.rating)}
                        </p>
                      </div>
                    </div>

                    {/* Rating and Date */}
                    <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffReviewsPage;
