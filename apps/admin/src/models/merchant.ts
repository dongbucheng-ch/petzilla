/**
 * 商户状态枚举
 */
export enum MerchantStatus {
  DISABLED = 0,
  ENABLED = 1,
  PENDING = 2,
}

/**
 * 审核状态枚举
 */
export enum AuditStatus {
  APPROVED = 1,
  PENDING = 0,
  REJECTED = 2,
}

/**
 * 商户实体
 */
export interface Merchant {
  id: number;
  name: string;
  code: string;
  status: MerchantStatus;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  description?: string;
  logo?: string;
  audit_status: AuditStatus;
  audit_remark?: string;
  audited_by?: number;
  audited_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * 创建商户DTO
 */
export interface CreateMerchantDto {
  name: string;
  code: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  description?: string;
  logo?: string;
}

/**
 * 更新商户DTO
 */
export interface UpdateMerchantDto {
  name?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  description?: string;
  logo?: string;
  status?: MerchantStatus;
}

/**
 * 审核商户DTO
 */
export interface AuditMerchantDto {
  audit_status: AuditStatus;
  audit_remark?: string;
}
