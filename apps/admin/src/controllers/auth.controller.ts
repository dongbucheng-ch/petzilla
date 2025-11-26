import type { Context } from 'koa';

import type { LoginDto } from '#/models/user';

import { authService } from '#/services/auth.service';
import { ResponseUtil } from '#/utils/ResponseUtil';

/**
 * 认证控制器
 */
class AuthController {
  /**
   * 修改密码
   */
  async changePassword(ctx: Context) {
    const { user } = ctx.state.auth;
    const { oldPassword, newPassword } = ctx.request.body as any;
    await authService.changePassword(user.userId, oldPassword, newPassword);
    ResponseUtil.success(ctx, null, '密码修改成功');
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(ctx: Context) {
    const { user } = ctx.state.auth;
    const result = await authService.getUserInfo(user.userId);
    ResponseUtil.success(ctx, result);
  }

  /**
   * 用户登录
   */
  async login(ctx: Context) {
    const loginDto: LoginDto = ctx.request.body as LoginDto;
    const result = await authService.login(loginDto);
    ResponseUtil.success(ctx, result, '登录成功');
  }

  /**
   * 用户注销
   */
  async logout(ctx: Context) {
    const { user } = ctx.state.auth;
    const token = ctx.headers.authorization?.slice(7) || '';
    await authService.logout(user.userId, token);
    ResponseUtil.success(ctx, null, '注销成功');
  }

  /**
   * 刷新令牌
   */
  async refreshToken(ctx: Context) {
    const token = ctx.headers.authorization?.slice(7) || '';
    const result = await authService.refreshToken(token);
    ResponseUtil.success(ctx, result, '令牌刷新成功');
  }
}

export const authController = new AuthController();
