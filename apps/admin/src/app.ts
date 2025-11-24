import cors from '@koa/cors';
import chalk from 'chalk';
import KoaApp from 'koa';
import { koaBody } from 'koa-body';

import { allowCors, errorHandler, requestLogger, setupErrorListeners } from '#/middlewares';
import { useRouter } from '#/routes';

export class App {
  private app: KoaApp;

  constructor() {
    this.app = new KoaApp({ asyncLocalStorage: true });
    this.setupMiddleware();
    this.setupErrorHandling();
  }

  getContext() {
    return this.app.currentContext;
  }

  getInstance() {
    return this.app;
  }

  async init() {
    try {
      // 初始化路由
      const router = await useRouter();

      this.app.use(koaBody()).use(router.routes()).use(router.allowedMethods());

      return this;
    } catch (error) {
      console.error(chalk.red('应用初始化失败:'), error);
      throw error;
    }
  }

  listen(port = 3000) {
    this.app.listen(port, () => {
      const link_msg = chalk.cyan(`🚀 Server is running at http://localhost:${port}`);
      console.warn(`${chalk.green('[RUNNING]')} ${link_msg}\n`);
    });
  }

  private setupErrorHandling() {
    // 设置全局错误监听器
    setupErrorListeners(this.app);
  }

  private setupMiddleware() {
    this.app
      .use(cors(allowCors as any))
      .use(errorHandler) // 错误处理中间件
      .use(requestLogger); // 请求日志中间件
  }
}

export default new App();
