import type { RouteHandler } from '#/routes/types';

const userRoute: RouteHandler = (router) => {
  router.get('/info', async (ctx) => {
    ctx.body = {
      code: 0,
      message: 'Success',
      data: { user: 'Admin User', role: 'Administrator' },
    };
  });

  return router;
};

export default userRoute;
