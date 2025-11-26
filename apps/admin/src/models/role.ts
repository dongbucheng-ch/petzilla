/**
 * 角色类型枚举
 */
export enum RoleType {
  SYSTEM = 'SYSTEM',
  MERCHANT = 'MERCHANT',
}

/**
 * 角色状态枚举
 */
export enum RoleStatus {
  DISABLED = 0,
  ENABLED = 1,
}

/**
 * 角色实体
 */
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  role_type: RoleType;
  merchant_id?: number;
  status: RoleStatus;
  sort: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建角色DTO
 */
export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  role_type: RoleType;
  merchant_id?: number;
  sort?: number;
}

/**
 * 更新角色DTO
 */
export interface UpdateRoleDto {
  name?: string;
  description?: string;
  status?: RoleStatus;
  sort?: number;
}

/**
 * 分配权限DTO
 */
export interface AssignPermissionsDto {
  role_id: number;
  permission_ids: number[];
}
