import type { RouteHandler } from '#/routes/types';

import { authController } from '#/controllers/auth.controller';
import { authMiddleware } from '#/middlewares';

/**
 * 认证路由
 * 路径前缀自动生成为: /admin/v1/auth
 */
const authRoute: RouteHandler = (router) => {
  router
    .post('/login', (ctx) => authController.login(ctx))
    .post('/logout', authMiddleware, (ctx) => authController.logout(ctx))
    .post('/refresh', authMiddleware, (ctx) => authController.refreshToken(ctx))
    .get('/profile', authMiddleware, (ctx) => authController.getProfile(ctx))
    .post('/change-password', authMiddleware, (ctx) => authController.changePassword(ctx));

  return router;
};

export default authRoute;
