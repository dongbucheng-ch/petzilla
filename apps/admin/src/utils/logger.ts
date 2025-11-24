import path from 'node:path';
import process from 'node:process';

import log4js from 'log4js';

// 日志目录
const LOG_DIR = path.resolve(process.cwd(), 'logs');

// Log4js 配置
log4js.configure({
  appenders: {
    // 控制台输出
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c -%] %m',
      },
    },
    // 所有日志文件
    file: {
      type: 'dateFile',
      filename: path.join(LOG_DIR, 'app.log'),
      pattern: 'yyyy-MM-dd',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m',
      },
      maxLogSize: 10 * 1024 * 1024, // 10MB
      backups: 7, // 保留7天
      compress: true, // 压缩
    },
    // 错误日志文件
    error: {
      type: 'dateFile',
      filename: path.join(LOG_DIR, 'error.log'),
      pattern: 'yyyy-MM-dd',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m',
      },
      maxLogSize: 10 * 1024 * 1024,
      backups: 30, // 错误日志保留30天
      compress: true,
    },
    // 访问日志文件
    access: {
      type: 'dateFile',
      filename: path.join(LOG_DIR, 'access.log'),
      pattern: 'yyyy-MM-dd',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] %m',
      },
      maxLogSize: 10 * 1024 * 1024,
      backups: 7,
      compress: true,
    },
  },
  categories: {
    // 默认日志分类
    default: {
      appenders: ['console', 'file'],
      level: process.env.LOG_LEVEL || 'info',
    },
    // 错误日志分类
    error: {
      appenders: ['console', 'file', 'error'],
      level: 'error',
    },
    // 访问日志分类
    access: {
      appenders: ['console', 'access'],
      level: 'info',
    },
  },
});

// 导出不同类型的 logger
export const logger = log4js.getLogger('default');
export const errorLogger = log4js.getLogger('error');
export const accessLogger = log4js.getLogger('access');

// 优雅关闭
export const shutdownLogger = () => {
  log4js.shutdown((error) => {
    if (error) {
      console.error('Error shutting down log4js:', error);
    }
  });
};

export default logger;
