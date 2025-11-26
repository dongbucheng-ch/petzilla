import type { Context, Next } from 'koa';

import type { AuthContext } from '#/models/auth';
import { UserType } from '#/models/user';
import { AppError } from '#/utils/AppError';

/**
 * 检查用户类型中间件
 */
export const requireUserType = (allowedTypes: UserType[]) => {
  return async (ctx: Context, next: Next) => {
    const auth = ctx.state.auth as AuthContext;

    if (!auth || !auth.user) {
      throw new AppError('未授权访问', 401);
    }

    if (!allowedTypes.includes(auth.user.userType)) {
      throw new AppError('权限不足：用户类型不匹配', 403);
    }

    await next();
  };
};

/**
 * 检查角色中间件
 */
export const requireRoles = (roles: string[]) => {
  return async (ctx: Context, next: Next) => {
    const auth = ctx.state.auth as AuthContext;

    if (!auth || !auth.user) {
      throw new AppError('未授权访问', 401);
    }

    // 超级管理员跳过权限检查
    if (auth.roles.includes('SUPER_ADMIN')) {
      await next();
      return;
    }

    // 检查是否拥有所需角色
    const hasRole = roles.some((role) => auth.roles.includes(role));

    if (!hasRole) {
      throw new AppError(
        `权限不足：需要角色 [${roles.join(', ')}]`,
        403,
      );
    }

    await next();
  };
};

/**
 * 检查权限码中间件
 */
export const requirePermissions = (permissions: string[]) => {
  return async (ctx: Context, next: Next) => {
    const auth = ctx.state.auth as AuthContext;

    if (!auth || !auth.user) {
      throw new AppError('未授权访问', 401);
    }

    // 超级管理员跳过权限检查
    if (auth.roles.includes('SUPER_ADMIN')) {
      await next();
      return;
    }

    // 检查是否拥有所需权限
    const hasPermission = permissions.some((permission) =>
      auth.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new AppError(
        `权限不足：需要权限 [${permissions.join(', ')}]`,
        403,
      );
    }

    await next();
  };
};

/**
 * 检查是否为商户用户中间件
 */
export const requireMerchant = async (ctx: Context, next: Next) => {
  const auth = ctx.state.auth as AuthContext;

  if (!auth || !auth.user) {
    throw new AppError('未授权访问', 401);
  }

  if (auth.user.userType !== UserType.MERCHANT) {
    throw new AppError('权限不足：需要商户用户', 403);
  }

  if (!auth.user.merchantId) {
    throw new AppError('权限不足：商户信息缺失', 403);
  }

  await next();
};

/**
 * 检查是否为管理员用户中间件
 */
export const requireAdmin = async (ctx: Context, next: Next) => {
  const auth = ctx.state.auth as AuthContext;

  if (!auth || !auth.user) {
    throw new AppError('未授权访问', 401);
  }

  if (auth.user.userType !== UserType.ADMIN) {
    throw new AppError('权限不足：需要管理员用户', 403);
  }

  await next();
};

/**
 * RBAC 权限检查辅助函数
 */
export class RBACHelper {
  /**
   * 检查用户是否拥有指定角色
   */
  static hasRole(auth: AuthContext, role: string): boolean {
    if (auth.roles.includes('SUPER_ADMIN')) {
      return true;
    }
    return auth.roles.includes(role);
  }

  /**
   * 检查用户是否拥有任一角色
   */
  static hasAnyRole(auth: AuthContext, roles: string[]): boolean {
    if (auth.roles.includes('SUPER_ADMIN')) {
      return true;
    }
    return roles.some((role) => auth.roles.includes(role));
  }

  /**
   * 检查用户是否拥有所有角色
   */
  static hasAllRoles(auth: AuthContext, roles: string[]): boolean {
    if (auth.roles.includes('SUPER_ADMIN')) {
      return true;
    }
    return roles.every((role) => auth.roles.includes(role));
  }

  /**
   * 检查用户是否拥有指定权限
   */
  static hasPermission(auth: AuthContext, permission: string): boolean {
    if (auth.roles.includes('SUPER_ADMIN')) {
      return true;
    }
    return auth.permissions.includes(permission);
  }

  /**
   * 检查用户是否拥有任一权限
   */
  static hasAnyPermission(auth: AuthContext, permissions: string[]): boolean {
    if (auth.roles.includes('SUPER_ADMIN')) {
      return true;
    }
    return permissions.some((permission) =>
      auth.permissions.includes(permission),
    );
  }

  /**
   * 检查用户是否拥有所有权限
   */
  static hasAllPermissions(auth: AuthContext, permissions: string[]): boolean {
    if (auth.roles.includes('SUPER_ADMIN')) {
      return true;
    }
    return permissions.every((permission) =>
      auth.permissions.includes(permission),
    );
  }
}
