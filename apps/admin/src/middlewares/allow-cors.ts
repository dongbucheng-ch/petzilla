import { Context } from 'koa';

export default {
  origin: (ctx: Context) => {
    // 设置允许来自指定域名请求
    const host = ctx.header.referer || ctx.header.host;
    if (host?.includes('localhost') || host?.includes('dongbucheng') || host?.includes('ukamobi')) {
      return '*';
    }
  },
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // 设置所允许的HTTP请求方法
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'owner-id'], // 设置服务器支持的所有头信息字段
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'], // 设置获取其他自定义字段
};
