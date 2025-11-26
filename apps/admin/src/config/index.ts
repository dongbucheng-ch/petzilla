import process from 'node:process';

import dotenv from 'dotenv';

dotenv.config();

interface AppConfig {
  app: {
    env: string;
    name: string;
    port: number;
  };
  database: {
    connectionLimit: number;
    database: string;
    host: string;
    password: string;
    port: number;
    queueLimit: number;
    user: string;
    waitForConnections: boolean;
  };
  redis: {
    db: number;
    host: string;
    password: string;
    port: number;
  };
  jwt: {
    expiresIn: string;
    secret: string;
  };
  cors: {
    origin: string;
  };
  log: {
    level: string;
  };
}

export const config: AppConfig = {
  // 应用配置
  app: {
    name: process.env.APP_NAME || 'Petzilla Admin API',
    env: process.env.NODE_ENV || 'development',
    port: Number.parseInt(process.env.PORT || '3000', 10),
  },

  // MySQL 配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'petzilla_dev',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },

  // Redis 配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: Number.parseInt(process.env.REDIS_DB || '0', 10),
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'debug',
  },
};
