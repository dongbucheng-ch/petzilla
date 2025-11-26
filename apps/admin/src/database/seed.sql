-- =============================================
-- 初始化种子数据
-- =============================================

USE petzilla_dev;

-- 1. 插入系统角色
INSERT INTO roles (name, code, description, role_type, status, sort) VALUES
('超级管理员', 'SUPER_ADMIN', '系统超级管理员，拥有所有权限', 'SYSTEM', 1, 1),
('商户管理员', 'MERCHANT_MANAGER', '管理商户信息', 'SYSTEM', 1, 2),
('商户审核员', 'MERCHANT_AUDITOR', '审核商户申请', 'SYSTEM', 1, 3),
('系统配置员', 'SYSTEM_CONFIG', '配置系统权限', 'SYSTEM', 1, 4),
('商户店长', 'MERCHANT_OWNER', '商户管理员，管理商户所有业务', 'SYSTEM', 1, 10),
('商户财务', 'MERCHANT_FINANCE', '商户财务人员', 'SYSTEM', 1, 11),
('商户运营', 'MERCHANT_OPERATION', '商户运营人员', 'SYSTEM', 1, 12),
('商户店员', 'MERCHANT_STAFF', '商户普通店员', 'SYSTEM', 1, 13);

-- 2. 插入系统权限（示例）
INSERT INTO permissions (name, code, type, parent_id, path, icon, sort, status, description) VALUES
-- Admin 权限
('商户管理', 'merchant', 'MENU', 0, '/merchant', 'shop', 10, 1, '商户管理模块'),
('商户列表', 'merchant:list', 'MENU', 1, '/merchant/list', NULL, 11, 1, '商户列表页面'),
('查看商户', 'merchant:view', 'API', 2, NULL, NULL, 12, 1, '查看商户信息'),
('创建商户', 'merchant:create', 'API', 2, NULL, NULL, 13, 1, '创建商户'),
('编辑商户', 'merchant:edit', 'API', 2, NULL, NULL, 14, 1, '编辑商户'),
('删除商户', 'merchant:delete', 'API', 2, NULL, NULL, 15, 1, '删除商户'),
('审核商户', 'merchant:audit', 'API', 2, NULL, NULL, 16, 1, '审核商户'),

('用户管理', 'user', 'MENU', 0, '/user', 'user', 20, 1, '用户管理模块'),
('用户列表', 'user:list', 'MENU', 8, '/user/list', NULL, 21, 1, '用户列表页面'),
('查看用户', 'user:view', 'API', 9, NULL, NULL, 22, 1, '查看用户信息'),
('创建用户', 'user:create', 'API', 9, NULL, NULL, 23, 1, '创建用户'),
('编辑用户', 'user:edit', 'API', 9, NULL, NULL, 24, 1, '编辑用户'),
('删除用户', 'user:delete', 'API', 9, NULL, NULL, 25, 1, '删除用户'),

('角色管理', 'role', 'MENU', 0, '/role', 'role', 30, 1, '角色管理模块'),
('角色列表', 'role:list', 'MENU', 14, '/role/list', NULL, 31, 1, '角色列表页面'),
('查看角色', 'role:view', 'API', 15, NULL, NULL, 32, 1, '查看角色信息'),
('创建角色', 'role:create', 'API', 15, NULL, NULL, 33, 1, '创建角色'),
('编辑角色', 'role:edit', 'API', 15, NULL, NULL, 34, 1, '编辑角色'),
('删除角色', 'role:delete', 'API', 15, NULL, NULL, 35, 1, '删除角色'),
('分配权限', 'role:assign:permission', 'API', 15, NULL, NULL, 36, 1, '给角色分配权限'),

-- Merchant 权限
('员工管理', 'employee', 'MENU', 0, '/employee', 'team', 40, 1, '员工管理模块'),
('员工列表', 'employee:list', 'MENU', 21, '/employee/list', NULL, 41, 1, '员工列表页面'),
('查看员工', 'employee:view', 'API', 22, NULL, NULL, 42, 1, '查看员工信息'),
('创建员工', 'employee:create', 'API', 22, NULL, NULL, 43, 1, '创建员工'),
('编辑员工', 'employee:edit', 'API', 22, NULL, NULL, 44, 1, '编辑员工'),
('删除员工', 'employee:delete', 'API', 22, NULL, NULL, 45, 1, '删除员工'),
('分配角色', 'employee:assign:role', 'API', 22, NULL, NULL, 46, 1, '给员工分配角色');

-- 3. 为超级管理员分配所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE status = 1;

-- 4. 为商户管理员分配商户管理权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE code LIKE 'merchant%' AND status = 1;

-- 5. 为商户审核员分配审核权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code IN ('merchant:list', 'merchant:view', 'merchant:audit') AND status = 1;

-- 6. 为商户店长分配所有商户内部权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE code LIKE 'employee%' AND status = 1;

-- 7. 创建超级管理员用户（密码: admin123）
INSERT INTO users (username, email, password, user_type, status, real_name) VALUES
('admin', 'admin@petzilla.com', '$2b$10$YQ7X.HrOZ8hZqJqCfKQVbeXGzTr4B3L8/WGm6fHnXJyJ9mQQO7YHO', 'ADMIN', 1, '系统管理员');

-- 8. 为超级管理员分配角色
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- 9. 创建测试商户
INSERT INTO merchants (name, code, status, contact_person, contact_phone, contact_email, audit_status, audited_by, audited_at) VALUES
('测试商户A', 'MERCHANT_A', 1, '张三', '13800138000', 'test@merchant-a.com', 1, 1, NOW()),
('测试商户B', 'MERCHANT_B', 1, '李四', '13900139000', 'test@merchant-b.com', 1, 1, NOW());

-- 10. 创建测试商户用户（密码: merchant123）
INSERT INTO users (username, email, password, user_type, merchant_id, status, real_name) VALUES
('merchant_a_owner', 'owner@merchant-a.com', '$2b$10$YQ7X.HrOZ8hZqJqCfKQVbeXGzTr4B3L8/WGm6fHnXJyJ9mQQO7YHO', 'MERCHANT', 1, 1, '商户A店长'),
('merchant_b_owner', 'owner@merchant-b.com', '$2b$10$YQ7X.HrOZ8hZqJqCfKQVbeXGzTr4B3L8/WGm6fHnXJyJ9mQQO7YHO', 'MERCHANT', 2, 1, '商户B店长');

-- 11. 为商户用户分配角色
INSERT INTO user_roles (user_id, role_id) VALUES
(2, 5),
(3, 5);
