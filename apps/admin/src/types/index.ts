/**
 * 统一响应结构
 */
export interface BaseResponse<T = any> {
  code: number;
  data?: T;
  message: string;
  timestamp?: string;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应数据
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * 错误详情
 */
export interface ErrorDetails {
  details?: any;
  timestamp: string;
  type: string;
}
