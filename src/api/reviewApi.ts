import { ApiResult, ApiResultNoData, PageResponse } from "@/types";
import {
  AdminReviewDto,
  MyReviewFillerModal,
  ReviewFilterModel,
  ReviewHistoryResponseDto,
  ReviewUpdateDto,
} from "@/types/review.page";
import axiosClient from "./axiosClient";

export const ReviewApi = {
  getMyReviewsByCustomer: async (
    filler: MyReviewFillerModal,
  ): Promise<PageResponse<ReviewHistoryResponseDto>> => {
    try {
      const response = await axiosClient.get<
        ApiResult<PageResponse<ReviewHistoryResponseDto>>
      >("/review/me/reviews", {
        params: filler,
      });
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi lấy đánh giá");
      }
      return result.data;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  DeleteReviewByCustomer: async (reviewId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.delete<ApiResultNoData>(
        `/review/${reviewId}`,
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi xóa đánh giá");
      }
      return result.isSuccess;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  UpdateReviewByCustomer: async (
    reviewId: string,
    request: ReviewUpdateDto,
  ): Promise<boolean> => {
    try {
      const response = await axiosClient.put<ApiResultNoData>(
        `/review/${reviewId}`,
        request,
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi xác cập nhật đánh giá");
      }
      return result.isSuccess;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  getReviewsByAdmin: async (
    filler: ReviewFilterModel,
  ): Promise<PageResponse<AdminReviewDto>> => {
    try {
      const response = await axiosClient.get<
        ApiResult<PageResponse<AdminReviewDto>>
      >("/admin/reviews", {
        params: filler,
      });
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi lấy đánh giá");
      }
      return result.data;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  HiddenReview: async (reviewId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.patch<ApiResultNoData>(
        `/admin/reviews/${reviewId}/hide`,
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi xác nhận ẩn đánh giá");
      }
      return result.isSuccess;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
  DeleteReview: async (reviewId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.delete<ApiResultNoData>(
        `/admin/reviews/${reviewId}`,
      );
      const result = response.data;
      if (!result.isSuccess) {
        throw new Error(result.message || "Lỗi xóa đánh giá");
      }
      return result.isSuccess;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Lỗi kết nối hệ thông";
      throw new Error(msg);
    }
  },
};
