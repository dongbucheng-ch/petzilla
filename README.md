# Petzilla

<div align="center">

一个基于 Vue 3 + Vben Admin + Koa 的全栈企业级应用框架

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.12.0-brightgreen.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-blue.svg)](https://pnpm.io)

</div>

## ✨ 特性

- 🚀 **Monorepo 架构** - 使用 pnpm workspace + Turbo 构建工具
- 🎨 **前端技术栈** - Vue 3 + Vite + TypeScript + Naive UI
- 🔥 **后端技术栈** - Node.js + Koa + TypeScript + MySQL + Redis
- 📦 **代码规范** - ESLint + Prettier + Lefthook
- 🔐 **权限管理** - 完善的 RBAC 权限体系
- 📝 **日志系统** - Log4js 多级别日志记录
- 🌍 **国际化** - 内置多语言支持
- 🎯 **TypeScript** - 全面的类型安全

## 📦 项目结构

```
petzilla/
├── apps/
│   ├── admin/              # 后端服务（Koa + TypeScript）
│   │   ├── src/
│   │   │   ├── routes/     # 路由模块（支持多层目录）
│   │   │   ├── middlewares/ # 中间件（日志、错误处理、CORS）
│   │   │   ├── utils/      # 工具函数
│   │   │   └── app.ts      # 应用入口
│   │   └── main.ts         # 启动文件
│   ├── web-native/         # 前端应用（Vue 3 + Naive UI）
│   └── wen-portal/         # 门户应用
├── packages/               # 共享包
│   └── @core/              # 核心包
├── internal/               # 内部工具包
│   ├── vite-config/        # Vite 配置
│   ├── lint-configs/       # Lint 配置
│   └── tailwind-config/    # Tailwind 配置
└── scripts/                # 脚本工具
```

## 🛠️ 技术栈

### 前端

- **框架**: Vue 3
- **构建工具**: Vite
- **UI 框架**: Naive UI
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: @vben/request
- **CSS**: TailwindCSS

### 后端

- **框架**: Koa 3
- **语言**: TypeScript (ESM)
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **日志**: Log4js
- **API 文档**: 待集成

## 📋 环境要求

- **Node.js**: >= 20.12.0
- **pnpm**: >= 10.0.0
- **MySQL**: >= 8.0
- **Redis**: >= 5.0

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd petzilla
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
# 复制后端环境变量模板
cp apps/admin/.env.example apps/admin/.env

# 复制前端环境变量模板
cp apps/web-native/.env.example apps/web-native/.env
```

修改 `apps/admin/.env` 配置数据库连接信息：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=petzilla

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 服务端口
PORT=3030
```

### 4. 启动开发服务器

```bash
# 启动所有服务（交互式选择）
pnpm dev

# 或分别启动

# 启动后端服务
pnpm --filter @petzilla/admin dev

# 启动前端应用
pnpm --filter @vben/web-naive dev
```

### 5. 访问应用

- 前端应用: http://localhost:5555
- 后端 API: http://localhost:3030

## 📝 开发指南

### 后端路由开发

支持多层目录结构，自动扫描注册路由：

```
src/routes/core/
├── admin/v1/
│   └── user.route.ts    → /admin/v1/user
├── api/v1/
│   └── auth.route.ts    → /api/v1/auth
```

**路由文件示例** (`user.route.ts`):

```typescript
import type { RouteHandler } from '#/routes/types';

const userRoute: RouteHandler = (router) => {
  router.get('/info', async (ctx) => {
    ctx.body = {
      code: 0,
      message: 'Success',
      data: { user: 'Admin User' },
    };
  });

  return router;
};

export default userRoute;
```

### 日志系统

三种日志级别，自动记录请求信息：

```
[2025-11-24 18:19:49] [INFO] default - → GET /admin/v1/user/info | IP: 127.0.0.1
[2025-11-24 18:19:49] [INFO] default - ← GET /admin/v1/user/info 200 2ms
[2025-11-24 18:19:49] [INFO] access - {"timestamp":"...","method":"GET",...}
```

日志文件位置：
- `logs/app.log` - 应用日志（保留 7 天）
- `logs/error.log` - 错误日志（保留 30 天）
- `logs/access.log` - 访问日志（保留 7 天）

### 中间件

- **requestLogger** - 请求日志记录
- **errorHandler** - 统一错误处理
- **allowCors** - CORS 跨域支持
- **koa-body** - 请求体解析
- **koa-helmet** - 安全头设置

## 🔧 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（交互式选择） |
| `pnpm build` | 构建所有项目 |
| `pnpm build:naive` | 只构建 web-naive |
| `pnpm lint` | 代码检查 |
| `pnpm format` | 代码格式化 |
| `pnpm check` | 全面检查（依赖、类型、拼写） |
| `pnpm clean` | 清理构建产物 |
| `pnpm reinstall` | 完全重装依赖 |
| `pnpm commit` | 交互式提交（规范化 commit） |
| `pnpm test:unit` | 运行单元测试 |
| `pnpm test:e2e` | 运行 E2E 测试 |

## 📖 API 文档

启动后端服务后访问：
- Swagger 文档: http://localhost:3030/docs (待实现)

## 🤝 参与贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`pnpm commit`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
pnpm commit
```

类型说明：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链更新

## 🔒 环境变量

### 后端 (apps/admin/.env)

```env
NODE_ENV=development
PORT=3030

# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=petzilla

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 日志级别
LOG_LEVEL=info
```

### 前端 (apps/web-native/.env.development)

```env
VITE_APP_TITLE=Petzilla Admin
VITE_API_URL=http://localhost:3030
VITE_UPLOAD_URL=http://localhost:3030/upload
```

## 📄 许可证

[MIT](LICENSE) © Petzilla

## 🙏 致谢

- [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) - 前端框架基础
- [Koa](https://koajs.com/) - 后端框架
- [Naive UI](https://www.naiveui.com/) - UI 组件库

---

<div align="center">
Made with ❤️ by Petzilla Team
</div>
