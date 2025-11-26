/**
 * 权限类型枚举
 */
export enum PermissionType {
  API = 'API',
  BUTTON = 'BUTTON',
  MENU = 'MENU',
}

/**
 * 权限状态枚举
 */
export enum PermissionStatus {
  DISABLED = 0,
  ENABLED = 1,
}

/**
 * 权限实体
 */
export interface Permission {
  id: number;
  name: string;
  code: string;
  type: PermissionType;
  parent_id: number;
  path?: string;
  component?: string;
  icon?: string;
  sort: number;
  status: PermissionStatus;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建权限DTO
 */
export interface CreatePermissionDto {
  name: string;
  code: string;
  type: PermissionType;
  parent_id?: number;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  description?: string;
}

/**
 * 更新权限DTO
 */
export interface UpdatePermissionDto {
  name?: string;
  type?: PermissionType;
  parent_id?: number;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  status?: PermissionStatus;
  description?: string;
}

/**
 * 权限树节点
 */
export interface PermissionTreeNode extends Permission {
  children?: PermissionTreeNode[];
}
