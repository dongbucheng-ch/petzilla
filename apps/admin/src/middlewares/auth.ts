import type { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';

import { config } from '#/config';
import type { AuthContext, JwtPayload } from '#/models/auth';
import { redis } from '#/services/redis.service';
import { AppError } from '#/utils/AppError';

/**
 * JWT 认证中间件
 */
export const authMiddleware = async (ctx: Context, next: Next) => {
  try {
    // 从请求头获取 token
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证令牌', 401);
    }

    const token = authHeader.slice(7); // 移除 'Bearer ' 前缀

    // 验证 token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('认证令牌已过期', 401);
      }
      throw new AppError('无效的认证令牌', 401);
    }

    // 检查 token 是否在黑名单中（用户注销后的 token）
    const blacklisted = await redis.get(`blacklist:token:${token}`);
    if (blacklisted) {
      throw new AppError('认证令牌已失效', 401);
    }

    // 从 Redis 获取用户权限信息（缓存）
    const cacheKey = `user:permissions:${decoded.userId}`;
    const cachedPermissions = await redis.getObject<{
      roles: string[];
      permissions: string[];
    }>(cacheKey);

    // 将用户信息附加到 context 上
    const authContext: AuthContext = {
      user: decoded,
      roles: cachedPermissions?.roles || [],
      permissions: cachedPermissions?.permissions || [],
    };

    ctx.state.auth = authContext;

    await next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('认证失败', 401);
  }
};

/**
 * 可选的 JWT 认证中间件（不强制要求认证）
 */
export const optionalAuthMiddleware = async (ctx: Context, next: Next) => {
  try {
    const authHeader = ctx.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

        // 检查黑名单
        const blacklisted = await redis.get(`blacklist:token:${token}`);
        if (!blacklisted) {
          // 从 Redis 获取用户权限信息
          const cacheKey = `user:permissions:${decoded.userId}`;
          const cachedPermissions = await redis.getObject<{
            roles: string[];
            permissions: string[];
          }>(cacheKey);

          const authContext: AuthContext = {
            user: decoded,
            roles: cachedPermissions?.roles || [],
            permissions: cachedPermissions?.permissions || [],
          };

          ctx.state.auth = authContext;
        }
      } catch (error) {
        // 忽略错误，继续执行
      }
    }

    await next();
  } catch (error) {
    await next();
  }
};
