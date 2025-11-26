# 权限管理系统使用文档

## 系统概述

本权限系统基于 RBAC (Role-Based Access Control) 模型，支持多用户体系（Admin、Merchant、App）和商户数据隔离。

### 核心特性

- ✅ 多用户体系支持（Admin/Merchant/App）
- ✅ 灵活的 RBAC 权限模型（角色 + 权限码）
- ✅ 商户数据隔离（多租户架构）
- ✅ JWT 认证 + Redis 缓存
- ✅ 密码加密（bcrypt）
- ✅ 权限继承与超级管理员
- ✅ 操作日志记录

## 快速开始

### 1. 安装依赖

```bash
cd apps/admin
pnpm install
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=Petzilla Admin API

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=petzilla_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Log
LOG_LEVEL=debug
```

### 3. 初始化数据库

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS petzilla_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 执行数据库表结构
mysql -u root -p petzilla_dev < src/database/schema.sql

# 3. 导入初始数据
mysql -u root -p petzilla_dev < src/database/seed.sql
```

### 4. 启动服务

```bash
pnpm dev
```

## 用户体系

### 用户类型

#### 1. Admin 用户（系统管理员）
- **SUPER_ADMIN**: 超级管理员（拥有所有权限）
- **MERCHANT_MANAGER**: 商户管理员
- **MERCHANT_AUDITOR**: 商户审核员
- **SYSTEM_CONFIG**: 系统配置员

#### 2. Merchant 用户（商户用户）
- **MERCHANT_OWNER**: 店长（商户管理员）
- **MERCHANT_FINANCE**: 财务
- **MERCHANT_OPERATION**: 运营
- **MERCHANT_STAFF**: 店员

#### 3. App 用户（应用用户）
- **APP_USER**: 普通用户
- **APP_STAFF**: 员工用户（店员）

## API 接口

### 认证相关

#### 1. 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应：**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@petzilla.com",
      "user_type": "ADMIN",
      "status": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "roles": ["SUPER_ADMIN"],
    "permissions": ["merchant:view", "merchant:create", ...]
  }
}
```

#### 2. 用户注销
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

#### 3. 刷新令牌
```http
POST /api/auth/refresh
Authorization: Bearer {token}
```

#### 4. 获取当前用户信息
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

#### 5. 修改密码
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "old_password",
  "newPassword": "new_password"
}
```

## 中间件使用

### 1. JWT 认证中间件

```typescript
import { authMiddleware } from '#/middlewares';

// 需要认证的路由
router.get('/protected', authMiddleware, async (ctx) => {
  const { user } = ctx.state.auth;
  ctx.body = { user };
});
```

### 2. 角色检查中间件

```typescript
import { authMiddleware, requireRoles } from '#/middlewares';

// 需要特定角色
router.get('/admin-only',
  authMiddleware,
  requireRoles(['SUPER_ADMIN', 'MERCHANT_MANAGER']),
  async (ctx) => {
    ctx.body = { message: '管理员专用' };
  }
);
```

### 3. 权限码检查中间件

```typescript
import { authMiddleware, requirePermissions } from '#/middlewares';

// 需要特定权限
router.post('/merchants',
  authMiddleware,
  requirePermissions(['merchant:create']),
  async (ctx) => {
    // 创建商户逻辑
  }
);
```

### 4. 商户数据隔离中间件

```typescript
import { authMiddleware, merchantIsolation, MerchantDataHelper } from '#/middlewares';

router.get('/employees',
  authMiddleware,
  merchantIsolation,
  async (ctx) => {
    const merchantId = MerchantDataHelper.getMerchantId(ctx);

    // 自动过滤商户数据
    const { where, params } = MerchantDataHelper.buildMerchantFilter(ctx);

    const sql = `SELECT * FROM employees WHERE ${where || '1=1'}`;
    const employees = await db.query(sql, params);

    ctx.body = { data: employees };
  }
);
```

### 5. 用户类型检查中间件

```typescript
import { authMiddleware, requireUserType } from '#/middlewares';
import { UserType } from '#/models/user';

// 只允许管理员访问
router.get('/admin-panel',
  authMiddleware,
  requireUserType([UserType.ADMIN]),
  async (ctx) => {
    ctx.body = { message: '管理员面板' };
  }
);
```

## 权限码规范

权限码格式：`{模块}:{资源}:{操作}`

### 常用权限码示例

#### Admin 权限
```
merchant:list:view      # 查看商户列表
merchant:detail:view    # 查看商户详情
merchant:create         # 创建商户
merchant:edit           # 编辑商户
merchant:delete         # 删除商户
merchant:audit          # 审核商户

user:list:view          # 查看用户列表
user:create             # 创建用户
user:edit               # 编辑用户
user:delete             # 删除用户

role:list:view          # 查看角色列表
role:create             # 创建角色
role:edit               # 编辑角色
role:delete             # 删除角色
role:assign:permission  # 分配权限
```

#### Merchant 权限
```
employee:list:view      # 查看员工列表
employee:create         # 创建员工
employee:edit           # 编辑员工
employee:delete         # 删除员工
employee:assign:role    # 分配角色

product:list:view       # 查看商品列表
product:create          # 创建商品
order:list:view         # 查看订单列表
```

## 数据库表结构

### 核心表

1. **users** - 用户表
2. **merchants** - 商户表
3. **roles** - 角色表
4. **permissions** - 权限表
5. **user_roles** - 用户角色关联表
6. **role_permissions** - 角色权限关联表
7. **operation_logs** - 操作日志表

详见：`src/database/schema.sql`

## 初始账号

系统初始化后会创建以下测试账号：

### 超级管理员
- **用户名**: admin
- **密码**: admin123
- **邮箱**: admin@petzilla.com
- **角色**: SUPER_ADMIN

### 测试商户A
- **用户名**: merchant_a_owner
- **密码**: merchant123
- **邮箱**: owner@merchant-a.com
- **角色**: MERCHANT_OWNER

### 测试商户B
- **用户名**: merchant_b_owner
- **密码**: merchant123
- **邮箱**: owner@merchant-b.com
- **角色**: MERCHANT_OWNER

## 开发指南

### 添加新的角色

```sql
INSERT INTO roles (name, code, description, role_type, status, sort)
VALUES ('新角色', 'NEW_ROLE', '角色描述', 'SYSTEM', 1, 100);
```

### 添加新的权限

```sql
INSERT INTO permissions (name, code, type, parent_id, path, sort, status, description)
VALUES ('新权限', 'module:resource:action', 'API', 0, NULL, 100, 1, '权限描述');
```

### 为角色分配权限

```sql
INSERT INTO role_permissions (role_id, permission_id)
VALUES (1, 10);
```

### 为用户分配角色

```sql
INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1);
```

### 创建新的服务

```typescript
// src/services/example.service.ts
import { db } from './database.service';

class ExampleService {
  async getList() {
    return await db.query('SELECT * FROM table');
  }
}

export const exampleService = new ExampleService();
```

### 创建新的控制器

```typescript
// src/controllers/example.controller.ts
import type { Context } from 'koa';
import { exampleService } from '#/services/example.service';
import { ResponseUtil } from '#/utils/ResponseUtil';

class ExampleController {
  async getList(ctx: Context) {
    const result = await exampleService.getList();
    ResponseUtil.success(ctx, result);
  }
}

export const exampleController = new ExampleController();
```

### 创建新的路由

路由文件应放在 `src/routes/core/admin/v1/` 目录下，系统会自动扫描并生成路径前缀。

```typescript
// src/routes/core/admin/v1/example.route.ts
import type { RouteHandler } from '#/routes/types';
import { exampleController } from '#/controllers/example.controller';
import { authMiddleware, requirePermissions } from '#/middlewares';

/**
 * 示例路由
 * 路径前缀自动生成为: /admin/v1/example
 */
const exampleRoute: RouteHandler = (router) => {
  router.get('/list',
    authMiddleware,
    requirePermissions(['example:view']),
    (ctx) => exampleController.getList(ctx)
  );

  return router;
};

export default exampleRoute;
```

**路由路径规则：**
- 文件位置：`src/routes/core/admin/v1/example.route.ts`
- 自动生成的 URL 前缀：`/admin/v1/example`
- 完整路径：`/admin/v1/example/list`

## 常见问题

### 1. Token 过期怎么办？

使用 `/api/auth/refresh` 接口刷新 token。

### 2. 如何清除用户权限缓存？

```typescript
import { redis } from '#/services/redis.service';

// 清除单个用户
await redis.del(`user:permissions:${userId}`);

// 清除所有用户
await redis.delPattern('user:permissions:*');
```

### 3. 如何实现商户数据隔离？

使用 `MerchantDataHelper` 辅助类：

```typescript
const { where, params } = MerchantDataHelper.buildMerchantFilter(ctx);
const sql = `SELECT * FROM table WHERE ${where || '1=1'}`;
```

### 4. 如何检查用户是否有权限？

```typescript
import { RBACHelper } from '#/middlewares';

const auth = ctx.state.auth;

// 检查角色
if (RBACHelper.hasRole(auth, 'SUPER_ADMIN')) {
  // ...
}

// 检查权限
if (RBACHelper.hasPermission(auth, 'merchant:create')) {
  // ...
}
```

## 安全建议

1. **修改默认密码**: 部署前务必修改所有默认账号密码
2. **JWT Secret**: 使用强随机字符串作为 JWT_SECRET
3. **HTTPS**: 生产环境务必使用 HTTPS
4. **密码策略**: 实施强密码策略
5. **日志审计**: 定期审查操作日志
6. **权限最小化**: 遵循最小权限原则

## 技术栈

- **框架**: Koa 3
- **语言**: TypeScript
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **认证**: JWT
- **密码加密**: bcrypt

## 相关文件

- 数据库表结构: `src/database/schema.sql`
- 初始数据: `src/database/seed.sql`
- 中间件: `src/middlewares/`
- 服务层: `src/services/`
- 控制器: `src/controllers/`
- 模型: `src/models/`
- 路由: `src/routes/`
