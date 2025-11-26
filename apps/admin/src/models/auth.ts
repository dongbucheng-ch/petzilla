import { UserType } from './user';

/**
 * JWT Payload
 */
export interface JwtPayload {
  userId: number;
  username: string;
  userType: UserType;
  merchantId?: number;
}

/**
 * Koa Context 扩展（添加用户信息）
 */
export interface AuthContext {
  user: JwtPayload;
  roles: string[];
  permissions: string[];
}
