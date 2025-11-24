import type Router from '@koa/router';

/**
 * 路由处理函数类型定义
 */
export type RouteHandler = (router: Router) => Router;
