import type { Context, Next } from 'koa';

import type { BaseResponse } from '#/types';

import process from 'node:process';

import { AppError, errorLogger, formatErrorLog, ResponseUtil } from '#/utils';

/**
 * 全局错误处理中间件
 * 捕获并处理所有错误，统一返回错误响应
 */
export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();

    // 处理 404 错误
    if (ctx.status === 404 && !ctx.body) {
      ResponseUtil.notFound(ctx, '请求的资源不存在');
    }
  } catch (error: any) {
    // 记录错误日志
    const errorLog = formatErrorLog(error, ctx);
    errorLogger.error(errorLog);

    // 构建错误响应
    const errorResponse = buildErrorResponse(error, ctx);

    // 设置响应
    ctx.status = errorResponse.code;
    ctx.body = errorResponse;

    // 触发 app 的 error 事件（用于额外的错误处理，如监控上报）
    ctx.app.emit('error', error, ctx);
  }
};

/**
 * 构建错误响应
 */
function buildErrorResponse(error: Error, ctx: Context): BaseResponse {
  // 默认错误信息
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = '服务器内部错误';
  let details: any;

  // 处理自定义错误
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.errorCode;
    message = error.message;
    details = error.details;
  } else {
    // 处理系统错误
    switch (error.name) {
      case 'CastError': {
        statusCode = 400;
        errorCode = 'CAST_ERROR';
        message = '参数格式错误';
        break;
      }
      case 'MissingSchemaError':
      case 'MongooseError': {
        statusCode = 500;
        errorCode = 'DATABASE_ERROR';
        message = '数据库操作失败';
        break;
      }
      case 'SyntaxError': {
        statusCode = 400;
        errorCode = 'SYNTAX_ERROR';
        message = '请求格式错误';
        break;
      }
      case 'TypeError': {
        statusCode = 400;
        errorCode = 'TYPE_ERROR';
        message = '数据类型错误';
        break;
      }
      case 'ValidationError': {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = '请求参数验证失败';
        break;
      }
      default: {
        // 生产环境不暴露具体错误信息
        if (process.env.NODE_ENV === 'production') {
          message = '服务器内部错误';
        } else {
          message = error.message;
          details = { stack: error.stack };
        }
      }
    }
  }

  return {
    code: statusCode,
    message,
    data: {
      type: errorCode,
      timestamp: new Date().toISOString(),
      requestId: ctx.state.requestId,
      ...(details && { details }),
    },
  };
}

/**
 * 应用级错误监听器
 * 监听未捕获的异常和 Promise 拒绝
 */
export const setupErrorListeners = (app: any) => {
  // 监听应用错误事件（可用于错误监控上报）
  app.on('error', (error: Error, ctx: Context) => {
    // 这里可以添加额外的错误处理逻辑
    // 比如发送错误通知、上报错误监控（如 Sentry）等
    if (process.env.NODE_ENV !== 'production') {
      console.error('Application error:', error);
    }
  });

  // 监听未捕获的异常
  process.on('uncaughtException', (error: Error) => {
    errorLogger.error(`❌ Uncaught Exception: ${error.message}\nStack: ${error.stack}`);
    // 给予应用一些时间来清理资源
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // 监听未处理的 Promise 拒绝
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    errorLogger.error(`❌ Unhandled Rejection at: ${String(promise)}\nReason: ${String(reason)}`);
    // 给予应用一些时间来清理资源
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // 监听进程退出信号（优雅关闭）
  const gracefulShutdown = (signal: string) => {
    console.warn(`\n${signal} signal received: closing HTTP server`);
    // 这里可以添加清理逻辑，如关闭数据库连接
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};
