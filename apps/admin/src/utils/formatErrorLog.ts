import type { Context } from 'koa';

import type { AppError } from './AppError';

/**
 * 格式化错误日志
 */
export function formatErrorLog(error: AppError | Error, ctx?: Context): string {
  const timestamp = new Date().toISOString();
  const errorInfo: any = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  // 如果是自定义错误，添加额外信息
  if ('statusCode' in error) {
    errorInfo.statusCode = error.statusCode;
    errorInfo.errorCode = error.errorCode;
    errorInfo.details = error.details;
  }

  // 如果有上下文，添加请求信息
  if (ctx) {
    errorInfo.request = {
      method: ctx.method,
      url: ctx.url,
      headers: ctx.headers,
      query: ctx.query,
      body: ctx.request.body,
      ip: ctx.ip,
    };
  }

  return JSON.stringify(errorInfo, null, 2);
}

/**
 * 格式化访问日志
 */
export function formatAccessLog(ctx: Context, responseTime: number): string {
  const timestamp = new Date().toISOString();
  const log = {
    timestamp,
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    responseTime: `${responseTime}ms`,
    ip: ctx.state.clientIP || ctx.ip,
    userAgent: ctx.headers['user-agent'] || 'unknown',
  };

  return JSON.stringify(log);
}
