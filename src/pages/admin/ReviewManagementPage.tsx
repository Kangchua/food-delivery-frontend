import React, { useEffect, useMemo, useState } from "react";
import { EyeOff, Trash2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import { PaginationMeta } from "@/types";
import { AdminReviewDto, ReviewFilterModel } from "@/types/review.page";
import { ReviewApi } from "@/api/reviewApi";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const AdminReviewsManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<AdminReviewDto[]>([]);

  const [filters, setFilters] = useState<ReviewFilterModel>({
    page: 1,
    pageSize: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [filters.page, filters.rating, filters.isHidden]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const result = await ReviewApi.getReviewsByAdmin(filters);

      setReviews(result.data);
      setPagination(result.meta);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  const [hideReviewId, setHideReviewId] = useState<string | null>(null);

  const handleHide = async (reviewId: string) => {
    setIsSubmitting(true);
    try {
      const result = await ReviewApi.HiddenReview(reviewId);
      if (result) {
        toast.success("Đã ẩn review");
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, isHidden: true } : r)),
      );
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi ẩn review");
    } finally {
      setIsSubmitting(false);
    }
  };
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const handleDelete = async (reviewId: string) => {
    setIsSubmitting(true);
    try {
      const result = await ReviewApi.DeleteReview(reviewId);
      if (result) {
        toast.success("Đã xóa review");
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      pagination.totalCount -= 1;
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi ẩn revirew");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  /* ================== UI ================== */
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Quản lý Review</h1>

        {/* FILTER */}
        <div className="mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Rating
            </label>
            <select
              value={filters.rating ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  rating: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                }))
              }
              className="w-[140px] rounded-lg border bg-white px-3 py-2 text-sm"
            >
              <option value="">Tất cả</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} sao
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Trạng thái
            </label>
            <select
              value={
                filters.isHidden === undefined ? "" : String(filters.isHidden)
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  isHidden:
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  page: 1,
                }))
              }
              className="w-[160px] rounded-lg border bg-white px-3 py-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="false">Hiển thị</option>
              <option value="true">Đã ẩn</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-lg bg-card shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-left">Sản phẩm</th>
                <th className="px-6 py-4 text-left">Khách hàng</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4 text-left">Nội dung</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-left">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center italic">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4">{r.productName}</td>
                    <td className="px-6 py-4">{r.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <span>{r.rating}</span>
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4">{r.comment}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          r.isHidden
                            ? "text-red-600 border-red-200"
                            : "text-green-600 border-green-200"
                        }`}
                      >
                        {r.isHidden ? "Đã ẩn" : "Hiển thị"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {r.createdAt}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!r.isHidden && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHideReviewId(r.id)}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <ConfirmModal
                            isOpen={!!hideReviewId}
                            onClose={() => setHideReviewId(null)}
                            onConfirm={() => {
                              if (hideReviewId) handleHide(hideReviewId);
                              setHideReviewId(null);
                            }}
                            title="Xác nhận ẩn đánh giá"
                            description="Sau khi ẩn, người dùng sẽ không thấy đánh giá này."
                          />
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteReviewId(r.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <ConfirmModal
                        isOpen={!!deleteReviewId}
                        onClose={() => setDeleteReviewId(null)}
                        onConfirm={() => handleDelete(r.id)}
                        title="Xác nhận xóa đánh giá"
                        description="Xóa đánh giá không phù hợp và người dùng không nhìn thấy được đánh giá này. Lưu ý: Hành động này không thể hoàn tác."
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
            <div className="text-sm text-muted-foreground">
              Hiển thị <b>{reviews.length}</b> / <b>{pagination.totalCount}</b>{" "}
              review
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-sm font-medium">
                Trang {pagination.page} / {pagination.totalPages || 1}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminReviewsManagementPage;
