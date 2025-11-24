import type { Context, Next } from 'koa';

import { accessLogger, formatAccessLog, logger } from '#/utils';

/**
 * 请求日志中间件
 * 记录所有 HTTP 请求和响应信息
 */
export const requestLogger = async (ctx: Context, next: Next) => {
  // 记录请求开始时间
  const startTime = Date.now();

  // 记录客户端IP
  ctx.state.clientIP = getClientIP(ctx);

  // 生成请求ID（用于追踪）
  ctx.state.requestId = generateRequestId();

  // 记录请求开始
  logger.info(
    `→ ${ctx.method} ${ctx.url} | IP: ${ctx.state.clientIP} | ID: ${ctx.state.requestId}`
  );

  try {
    await next();

    // 计算响应时间
    const responseTime = Date.now() - startTime;

    // 根据状态码选择日志级别
    const logLevel = ctx.status >= 400 ? 'warn' : 'info';

    // 记录响应
    logger[logLevel](
      `← ${ctx.method} ${ctx.url} ${ctx.status} ${responseTime}ms | ID: ${ctx.state.requestId}`
    );

    // 记录访问日志到单独的文件
    accessLogger.info(formatAccessLog(ctx, responseTime));

    // 设置响应时间头
    ctx.set('X-Response-Time', `${responseTime}ms`);
    ctx.set('X-Request-Id', ctx.state.requestId);
  } catch (error) {
    // 计算响应时间
    const responseTime = Date.now() - startTime;

    // 记录错误请求
    logger.error(`✗ ${ctx.method} ${ctx.url} ERROR ${responseTime}ms | ID: ${ctx.state.requestId}`);

    // 错误会被错误处理中间件捕获，这里只记录并继续抛出
    throw error;
  }
};

/**
 * 获取客户端真实IP
 */
function getClientIP(ctx: Context): string {
  // 优先从代理头获取真实IP
  const forwardedFor = ctx.headers['x-forwarded-for'] as string;
  const realIP = ctx.headers['x-real-ip'] as string;

  let clientIP = forwardedFor || realIP || ctx.ip || ctx.socket.remoteAddress || 'unknown';

  // 处理 x-forwarded-for 可能包含多个IP的情况
  if (forwardedFor && forwardedFor.includes(',')) {
    clientIP = forwardedFor.split(',')[0].trim();
  }

  // 处理本地回环地址
  if (clientIP === '::1' || clientIP === '127.0.0.1' || clientIP === 'localhost') {
    return '127.0.0.1';
  }

  // 处理IPv6本地地址
  if (clientIP === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }

  // 处理内网地址，显示更友好的标识
  if (isPrivateIP(clientIP)) {
    return `${clientIP}`;
  }

  return clientIP;
}

/**
 * 判断是否为内网IP
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 内网地址范围
  const privateRanges = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^169\.254\./, // 169.254.0.0/16 (链路本地地址)
  ];

  return privateRanges.some((range) => range.test(ip));
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
