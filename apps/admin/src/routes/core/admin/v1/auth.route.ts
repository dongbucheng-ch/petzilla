import type { RouteHandler } from '#/routes/types';

import { authController } from '#/controllers/auth.controller';
import { authMiddleware } from '#/middlewares';

/**
 * 认证路由
 * 路径前缀自动生成为: /admin/v1/auth
 */
const authRoute: RouteHandler = (router) => {
  // 公开路由（无需认证）
  router.post('/login', (ctx) => authController.login(ctx));

  // 需要认证的路由
  router.post('/logout', authMiddleware, (ctx) => authController.logout(ctx));
  router.post('/refresh', authMiddleware, (ctx) =>
    authController.refreshToken(ctx),
  );
  router.get('/profile', authMiddleware, (ctx) =>
    authController.getProfile(ctx),
  );
  router.post('/change-password', authMiddleware, (ctx) =>
    authController.changePassword(ctx),
  );

  return router;
};

export default authRoute;
