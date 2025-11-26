/**
 * 用户类型枚举
 */
export enum UserType {
  ADMIN = 'ADMIN',
  APP = 'APP',
  MERCHANT = 'MERCHANT',
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
}

/**
 * 性别枚举
 */
export enum Gender {
  FEMALE = 2,
  MALE = 1,
  UNKNOWN = 0,
}

/**
 * 用户实体
 */
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  password: string;
  user_type: UserType;
  merchant_id?: number;
  status: UserStatus;
  avatar?: string;
  real_name?: string;
  nickname?: string;
  gender?: Gender;
  birthday?: Date;
  last_login_at?: Date;
  last_login_ip?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 用户信息（不含密码）
 */
export type UserInfo = Omit<User, 'password'>;

/**
 * 创建用户DTO
 */
export interface CreateUserDto {
  username: string;
  email: string;
  phone?: string;
  password: string;
  user_type: UserType;
  merchant_id?: number;
  real_name?: string;
  nickname?: string;
}

/**
 * 更新用户DTO
 */
export interface UpdateUserDto {
  username?: string;
  email?: string;
  phone?: string;
  status?: UserStatus;
  avatar?: string;
  real_name?: string;
  nickname?: string;
  gender?: Gender;
  birthday?: Date;
}

/**
 * 登录DTO
 */
export interface LoginDto {
  username: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  user: UserInfo;
  token: string;
  roles: string[];
  permissions: string[];
}
