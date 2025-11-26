-- =============================================
-- 权限管理系统数据库表结构
-- 支持多用户体系：Admin、Merchant、App
-- =============================================

-- 1. 商户表
CREATE TABLE IF NOT EXISTS merchants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '商户ID',
  name VARCHAR(100) NOT NULL COMMENT '商户名称',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '商户编码',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用，2-待审核',
  contact_person VARCHAR(50) COMMENT '联系人',
  contact_phone VARCHAR(20) COMMENT '联系电话',
  contact_email VARCHAR(100) COMMENT '联系邮箱',
  address VARCHAR(255) COMMENT '地址',
  description TEXT COMMENT '商户描述',
  logo VARCHAR(255) COMMENT '商户logo',
  audit_status TINYINT NOT NULL DEFAULT 0 COMMENT '审核状态：0-待审核，1-审核通过，2-审核拒绝',
  audit_remark VARCHAR(255) COMMENT '审核备注',
  audited_by INT UNSIGNED COMMENT '审核人ID',
  audited_at DATETIME COMMENT '审核时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_code (code),
  INDEX idx_status (status),
  INDEX idx_audit_status (audit_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商户表';

-- 2. 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  phone VARCHAR(20) COMMENT '手机号',
  password VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  user_type ENUM('ADMIN', 'MERCHANT', 'APP') NOT NULL DEFAULT 'APP' COMMENT '用户类型：ADMIN-管理员，MERCHANT-商户，APP-应用用户',
  merchant_id INT UNSIGNED COMMENT '所属商户ID（ADMIN为NULL）',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  avatar VARCHAR(255) COMMENT '头像',
  real_name VARCHAR(50) COMMENT '真实姓名',
  nickname VARCHAR(50) COMMENT '昵称',
  gender TINYINT COMMENT '性别：0-未知，1-男，2-女',
  birthday DATE COMMENT '生日',
  last_login_at DATETIME COMMENT '最后登录时间',
  last_login_ip VARCHAR(50) COMMENT '最后登录IP',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_user_type (user_type),
  INDEX idx_merchant_id (merchant_id),
  INDEX idx_status (status),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 3. 角色表
CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
  name VARCHAR(50) NOT NULL COMMENT '角色名称',
  code VARCHAR(50) NOT NULL COMMENT '角色编码',
  description VARCHAR(255) COMMENT '角色描述',
  role_type ENUM('SYSTEM', 'MERCHANT') NOT NULL DEFAULT 'SYSTEM' COMMENT '角色类型：SYSTEM-系统角色，MERCHANT-商户自定义角色',
  merchant_id INT UNSIGNED COMMENT '所属商户ID（系统角色为NULL）',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_code_merchant (code, merchant_id) COMMENT '同一商户下角色编码唯一',
  INDEX idx_role_type (role_type),
  INDEX idx_merchant_id (merchant_id),
  INDEX idx_status (status),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 4. 权限表
CREATE TABLE IF NOT EXISTS permissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '权限ID',
  name VARCHAR(50) NOT NULL COMMENT '权限名称',
  code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码，格式：module:resource:action',
  type ENUM('MENU', 'BUTTON', 'API') NOT NULL DEFAULT 'API' COMMENT '权限类型：MENU-菜单，BUTTON-按钮，API-接口',
  parent_id INT UNSIGNED DEFAULT 0 COMMENT '父级权限ID',
  path VARCHAR(255) COMMENT '路由路径',
  component VARCHAR(255) COMMENT '组件路径',
  icon VARCHAR(50) COMMENT '图标',
  sort INT NOT NULL DEFAULT 0 COMMENT '排序',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  description VARCHAR(255) COMMENT '权限描述',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_code (code),
  INDEX idx_type (type),
  INDEX idx_parent_id (parent_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 5. 用户角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
  role_id INT UNSIGNED NOT NULL COMMENT '角色ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_user_role (user_id, role_id) COMMENT '用户角色唯一',
  INDEX idx_user_id (user_id),
  INDEX idx_role_id (role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- 6. 角色权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
  role_id INT UNSIGNED NOT NULL COMMENT '角色ID',
  permission_id INT UNSIGNED NOT NULL COMMENT '权限ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_role_permission (role_id, permission_id) COMMENT '角色权限唯一',
  INDEX idx_role_id (role_id),
  INDEX idx_permission_id (permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- 7. 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  user_id INT UNSIGNED COMMENT '操作用户ID',
  merchant_id INT UNSIGNED COMMENT '商户ID',
  module VARCHAR(50) COMMENT '模块',
  action VARCHAR(50) COMMENT '操作',
  method VARCHAR(10) COMMENT '请求方法',
  path VARCHAR(255) COMMENT '请求路径',
  params TEXT COMMENT '请求参数',
  ip VARCHAR(50) COMMENT '操作IP',
  user_agent VARCHAR(500) COMMENT 'User Agent',
  status TINYINT NOT NULL COMMENT '状态：0-失败，1-成功',
  error_msg TEXT COMMENT '错误信息',
  duration INT COMMENT '执行时长（ms）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  INDEX idx_user_id (user_id),
  INDEX idx_merchant_id (merchant_id),
  INDEX idx_module (module),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';
