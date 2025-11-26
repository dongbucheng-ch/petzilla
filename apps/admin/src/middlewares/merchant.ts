import type { Context, Next } from 'koa';

import type { AuthContext } from '#/models/auth';
import { UserType } from '#/models/user';
import { AppError } from '#/utils/AppError';

/**
 * 商户数据隔离中间件
 * 确保商户用户只能访问自己商户的数据
 */
export const merchantIsolation = async (ctx: Context, next: Next) => {
  const auth = ctx.state.auth as AuthContext;

  if (!auth || !auth.user) {
    throw new AppError('未授权访问', 401);
  }

  // 管理员用户跳过商户隔离
  if (auth.user.userType === UserType.ADMIN) {
    await next();
    return;
  }

  // 商户用户必须有 merchantId
  if (auth.user.userType === UserType.MERCHANT) {
    if (!auth.user.merchantId) {
      throw new AppError('商户信息缺失', 403);
    }

    // 将 merchantId 附加到 context，方便后续使用
    ctx.state.merchantId = auth.user.merchantId;
  }

  await next();
};

/**
 * 商户数据访问辅助类
 */
export class MerchantDataHelper {
  /**
   * 获取当前用户的 merchantId
   * 如果是管理员，返回 null（可访问所有数据）
   * 如果是商户用户，返回其 merchantId
   */
  static getMerchantId(ctx: Context): number | null {
    const auth = ctx.state.auth as AuthContext;

    if (!auth || !auth.user) {
      return null;
    }

    // 管理员可以访问所有数据
    if (auth.user.userType === UserType.ADMIN) {
      // 如果 URL 参数中指定了 merchantId，则使用该 merchantId
      const queryMerchantId = ctx.query.merchantId as string;
      if (queryMerchantId) {
        return Number.parseInt(queryMerchantId, 10);
      }
      return null;
    }

    // 商户用户只能访问自己的数据
    return auth.user.merchantId || null;
  }

  /**
   * 构建带商户隔离的 SQL WHERE 条件
   * @param ctx Koa Context
   * @param tableAlias 表别名（可选）
   * @returns SQL WHERE 条件字符串和参数
   */
  static buildMerchantFilter(
    ctx: Context,
    tableAlias?: string,
  ): { where: string; params: any[] } {
    const merchantId = this.getMerchantId(ctx);

    if (merchantId === null) {
      // 管理员，不添加过滤条件
      return { where: '', params: [] };
    }

    const field = tableAlias ? `${tableAlias}.merchant_id` : 'merchant_id';
    return {
      where: `${field} = ?`,
      params: [merchantId],
    };
  }

  /**
   * 验证用户是否可以访问指定商户的数据
   */
  static canAccessMerchant(ctx: Context, targetMerchantId: number): boolean {
    const auth = ctx.state.auth as AuthContext;

    if (!auth || !auth.user) {
      return false;
    }

    // 管理员可以访问所有商户数据
    if (auth.user.userType === UserType.ADMIN) {
      return true;
    }

    // 商户用户只能访问自己的数据
    return auth.user.merchantId === targetMerchantId;
  }

  /**
   * 确保用户可以访问指定商户的数据，否则抛出错误
   */
  static ensureCanAccessMerchant(
    ctx: Context,
    targetMerchantId: number,
  ): void {
    if (!this.canAccessMerchant(ctx, targetMerchantId)) {
      throw new AppError('无权访问该商户数据', 403);
    }
  }
}
