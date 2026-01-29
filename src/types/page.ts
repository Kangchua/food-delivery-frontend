export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
export interface PageResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
export interface ApiResult<T> {
  isSuccess: boolean;
  message: string | null;
  errorCode: string | null;
  data: T;
}
export interface ApiResultNoData {
  isSuccess: boolean;
  message: string | null;
  errorCode: string | null;
}
