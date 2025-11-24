import type { Context } from 'koa';

import type { BaseResponse } from '#/types';

/**
 * 统一响应工具类
 */
export const ResponseUtil = {
  /**
   * 成功响应
   */
  success<T = any>(ctx: Context, data?: T, message: string = '操作成功'): void {
    const response: BaseResponse<T> = {
      code: 200,
      message,
      data: data as T,
      timestamp: new Date().toISOString(),
    };

    ctx.status = 200;
    ctx.body = response;
  },

  /**
   * 创建成功响应 (201)
   */
  created<T = any>(ctx: Context, data?: T, message: string = '创建成功'): void {
    const response: BaseResponse<T> = {
      code: 201,
      message,
      data: data as T,
      timestamp: new Date().toISOString(),
    };

    ctx.status = 201;
    ctx.body = response;
  },

  /**
   * 无内容响应 (204)
   */
  noContent(ctx: Context): void {
    ctx.status = 204;
    ctx.body = null;
  },

  /**
   * 错误响应
   */
  error(ctx: Context, message: string = '操作失败', code: number = 400, data?: any): void {
    const response: BaseResponse = {
      code,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    ctx.status = code;
    ctx.body = response;
  },

  /**
   * 参数错误响应 (400)
   */
  badRequest(ctx: Context, message: string = '请求参数错误', data?: any): void {
    this.error(ctx, message, 400, data);
  },

  /**
   * 未授权响应 (401)
   */
  unauthorized(ctx: Context, message: string = '未授权，请先登录', data?: any): void {
    this.error(ctx, message, 401, data);
  },

  /**
   * 禁止访问响应 (403)
   */
  forbidden(ctx: Context, message: string = '禁止访问', data?: any): void {
    this.error(ctx, message, 403, data);
  },

  /**
   * 资源不存在响应 (404)
   */
  notFound(ctx: Context, message: string = '请求的资源不存在', data?: any): void {
    this.error(ctx, message, 404, data);
  },

  /**
   * 冲突响应 (409)
   */
  conflict(ctx: Context, message: string = '资源冲突', data?: any): void {
    this.error(ctx, message, 409, data);
  },

  /**
   * 验证失败响应 (422)
   */
  validationError(ctx: Context, message: string = '数据验证失败', data?: any): void {
    this.error(ctx, message, 422, data);
  },

  /**
   * 服务器内部错误响应 (500)
   */
  internalError(ctx: Context, message: string = '服务器内部错误', data?: any): void {
    this.error(ctx, message, 500, data);
  },

  /**
   * 服务不可用响应 (503)
   */
  serviceUnavailable(ctx: Context, message: string = '服务暂时不可用', data?: any): void {
    this.error(ctx, message, 503, data);
  },

  /**
   * 分页响应
   */
  paginated<T = any>(
    ctx: Context,
    data: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): void {
    const response: BaseResponse = {
      code: 200,
      message,
      data: {
        items: data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      timestamp: new Date().toISOString(),
    };

    ctx.status = 200;
    ctx.body = response;
  },
};
