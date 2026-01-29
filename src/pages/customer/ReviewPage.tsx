import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  MessageSquare,
  Package,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import { ReviewApi } from "@/api/reviewApi";
import { formatDate } from "@/utils/formatters";
import { toast } from "sonner";
import type {
  ReviewHistoryResponseDto,
  ReviewUpdateDto,
} from "@/types/review.page";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/button";
import ReviewModal from "./ReviewModal";

const PAGE_SIZE = 10;

const ReviewHistoryPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewHistoryResponseDto[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const [editingReview, setEditingReview] =
    useState<ReviewHistoryResponseDto | null>(null);

  const lastReviewRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore) {
            setPage((p) => p + 1);
          }
        },
        { threshold: 0.8 },
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore],
  );

  const fetchReviews = async (pageNum: number) => {
    try {
      setIsLoading(true);

      const res = await ReviewApi.getMyReviewsByCustomer({
        page: pageNum,
        pageSize: PAGE_SIZE,
      });
      setReviews((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
      setHasMore(res.meta.page < res.meta.totalPages);
      toast.success("Tải lịch sử đánh giá thành công.");
    } catch (err: any) {
      console.error("Fetch reviews failed", err);
      toast.error(err?.message || "Không thể tải danh sách đánh giá");
    } finally {
      setIsLoading(false);
    }
  };
  const canEditReview = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const diffDays = (now - createdTime) / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  };
  const handleEdit = (review: ReviewHistoryResponseDto) => {
    if (!canEditReview(review.createdAt)) {
      toast.error("Chỉ được sửa đánh giá trong vòng 3 ngày");
      return;
    }
    setEditingReview(review);
  };
  const handleUpdateSubmit = async (data: ReviewUpdateDto) => {
    if (!editingReview) return;
    try {
      setIsSubmitting(true);
      await ReviewApi.UpdateReviewByCustomer(editingReview.id, data);
      toast.success("Cập nhật đánh giá thành công");
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id
            ? { ...r, rating: data.rating, comment: data.comment }
            : r,
        ),
      );
    } catch (err: any) {
      toast.error(err?.message || "Cập nhật đánh giá thất bại");
    } finally {
      setIsSubmitting(false);
      setEditingReview(null);
    }
  };

  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const handleDelete = async (reviewId: string) => {
    setIsSubmitting(true);
    try {
      const result = await ReviewApi.DeleteReviewByCustomer(reviewId);
      if (result) {
        toast.success("Đã xóa review");
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi ẩn review");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Đánh giá của tôi</h1>

        <div className="space-y-6">
          {reviews.map((review, i) => {
            const isLast = i === reviews.length - 1;

            return (
              <div
                key={review.id}
                ref={isLast ? lastReviewRef : null}
                className="pb-2"
              >
                <div className="rounded-3xl border bg-card p-6 hover:shadow-md transition-all">
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="h-24 w-24 shrink-0">
                      {review.productImageUrl ? (
                        <img
                          src={review.productImageUrl}
                          alt={review.productName}
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-100">
                          <Package className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-bold">{review.productName}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {renderStars(review.rating)}
                        {review.isHidden && (
                          <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                            <ShieldAlert className="h-3 w-3" />
                            Đã ẩn
                          </span>
                        )}
                      </div>

                      <p className="text-sm italic text-slate-600">
                        {review.comment || "Không có nội dung"}
                      </p>

                      <div className="flex justify-end">
                        <Link
                          to={`/product/${review.productId}`}
                          className="flex items-center gap-1 text-xs font-bold text-primary"
                        >
                          Xem sản phẩm <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          disabled={!canEditReview(review.createdAt)}
                          onClick={() => handleEdit(review)}
                          className={`rounded-full px-4 py-1.5 text-xs font-bold transition
                          ${
                            canEditReview(review.createdAt)
                              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              : "cursor-not-allowed bg-slate-100 text-slate-400"
                          }`}
                          title={
                            canEditReview(review.createdAt)
                              ? "Sửa đánh giá"
                              : "Chỉ được sửa trong vòng 3 ngày"
                          }
                        >
                          Sửa
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteReviewId(review.id)}
                          className="rounded-full bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                        >
                          {isSubmitting ? "Đang xử lý..." : "Xóa đánh giá"}
                        </Button>
                        <ConfirmModal
                          isOpen={!!deleteReviewId}
                          onClose={() => setDeleteReviewId(null)}
                          onConfirm={() => handleDelete(review.id)}
                          title="Xác nhận xóa đánh giá"
                          description="Xóa đánh giá không phù hợp và người dùng không nhìn thấy được đánh giá này. Lưu ý: Hành động này không thể hoàn tác."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!hasMore && reviews.length > 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Hết đánh giá
          </p>
        )}

        {!isLoading && reviews.length === 0 && (
          <div className="py-20 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p>Chưa có đánh giá</p>
          </div>
        )}
      </div>
      {editingReview && (
        <ReviewModal
          open={!!editingReview}
          onClose={() => setEditingReview(null)}
          initialData={{
            rating: editingReview.rating,
            comment: editingReview.comment,
          }}
          onSubmit={handleUpdateSubmit}
        />
      )}
    </MainLayout>
  );
};

export default ReviewHistoryPage;
