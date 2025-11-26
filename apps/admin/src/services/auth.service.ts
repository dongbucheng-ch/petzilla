import type { RowDataPacket } from 'mysql2/promise';

import type { JwtPayload } from '#/models/auth';
import type { LoginDto, LoginResponse, User, UserInfo } from '#/models/user';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { config } from '#/config';
import { UserStatus } from '#/models/user';
import { AppError } from '#/utils/AppError';

import { db } from './database.service';
import { redis } from './redis.service';

/**
 * 认证服务
 */
class AuthService {
  /**
   * 修改密码
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    // 查询用户
    const user = await db.queryOne<RowDataPacket & User>('SELECT * FROM users WHERE id = ?', [
      userId,
    ]);

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('旧密码错误', 400);
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await db.update('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    // 清除用户权限缓存
    await redis.del(`user:permissions:${userId}`);
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: number): Promise<LoginResponse> {
    const user = await db.queryOne<RowDataPacket & User>('SELECT * FROM users WHERE id = ?', [
      userId,
    ]);

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 获取用户角色和权限
    const { roles, permissions } = await this.getUserPermissions(userId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userInfo } = user;

    return {
      user: userInfo as UserInfo,
      token: '',
      roles,
      permissions,
    };
  }

  /**
   * 获取用户角色和权限
   */
  async getUserPermissions(userId: number): Promise<{ permissions: string[]; roles: string[] }> {
    // 查询用户角色
    const roles = await db.query<RowDataPacket & { code: string }>(
      `
      SELECT r.code
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ? AND r.status = 1
    `,
      [userId]
    );

    // 查询用户权限（通过角色）
    const permissions = await db.query<RowDataPacket & { code: string }>(
      `
      SELECT DISTINCT p.code
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ? AND p.status = 1
    `,
      [userId]
    );

    return {
      roles: roles.map((r) => r.code),
      permissions: permissions.map((p) => p.code),
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { username, password } = loginDto;

    // 查询用户
    const user = await db.queryOne<RowDataPacket & User>(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (!user) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 检查用户状态
    if (user.status === UserStatus.DISABLED) {
      throw new AppError('用户已被禁用', 403);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 获取用户角色和权限
    const { roles, permissions } = await this.getUserPermissions(user.id);

    // 生成 JWT token
    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      userType: user.user_type,
      merchantId: user.merchant_id,
    });

    // 缓存用户权限信息到 Redis（7天）
    await this.cacheUserPermissions(user.id, roles, permissions);

    // 更新最后登录时间
    await db.update('UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?', [
      '0.0.0.0',
      user.id,
    ]);

    // 移除密码字段

    const { password: _, ...userInfo } = user;

    return {
      user: userInfo as UserInfo,
      token,
      roles,
      permissions,
    };
  }

  /**
   * 用户注销
   */
  async logout(userId: number, token: string): Promise<void> {
    // 将 token 加入黑名单（7天过期）
    await redis.set(`blacklist:token:${token}`, '1', 7 * 24 * 60 * 60);

    // 清除用户权限缓存
    await redis.del(`user:permissions:${userId}`);
  }

  /**
   * 刷新 token
   */
  async refreshToken(oldToken: string): Promise<{ token: string }> {
    try {
      // 验证旧 token
      const decoded = jwt.verify(oldToken, config.jwt.secret) as JwtPayload;

      // 检查黑名单
      const blacklisted = await redis.get(`blacklist:token:${oldToken}`);
      if (blacklisted) {
        throw new AppError('令牌已失效', 401);
      }

      // 生成新 token
      const newToken = this.generateToken(decoded);

      // 将旧 token 加入黑名单
      await redis.set(`blacklist:token:${oldToken}`, '1', 7 * 24 * 60 * 60);

      return { token: newToken };
    } catch {
      throw new AppError('刷新令牌失败', 401);
    }
  }

  /**
   * 缓存用户权限信息到 Redis
   */
  private async cacheUserPermissions(
    userId: number,
    roles: string[],
    permissions: string[]
  ): Promise<void> {
    const cacheKey = `user:permissions:${userId}`;
    await redis.setObject(cacheKey, { roles, permissions }, 7 * 24 * 60 * 60);
  }

  /**
   * 生成 JWT token
   */
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }
}

export const authService = new AuthService();
