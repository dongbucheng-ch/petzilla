import Redis from 'ioredis';

import { config } from '#/config';
import { logger } from '#/utils/logger';

/**
 * Redis 服务类
 */
class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      logger.info('Redis 连接成功');
    });

    this.client.on('error', (error) => {
      logger.error('Redis 连接错误:', error);
    });
  }

  /**
   * 获取 Redis 服务实例（单例模式）
   */
  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * 关闭 Redis 连接
   */
  public async close(): Promise<void> {
    try {
      await this.client.quit();
      logger.info('Redis 连接已关闭');
    } catch (error) {
      logger.error('关闭 Redis 连接失败:', error);
      throw error;
    }
  }

  /**
   * 删除缓存
   */
  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL 失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除缓存（通配符）
   */
  public async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Redis DEL PATTERN 失败:', error);
      throw error;
    }
  }

  /**
   * 获取缓存
   */
  public async get(key: string): Promise<null | string> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET 失败:', error);
      throw error;
    }
  }

  /**
   * 获取 Redis 客户端
   */
  public getClient(): Redis {
    return this.client;
  }

  /**
   * 获取对象缓存
   */
  public async getObject<T = any>(key: string): Promise<null | T> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * 设置缓存
   */
  public async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    try {
      await (expireSeconds
        ? this.client.setex(key, expireSeconds, value)
        : this.client.set(key, value));
    } catch (error) {
      logger.error('Redis SET 失败:', error);
      throw error;
    }
  }

  /**
   * 设置对象缓存
   */
  public async setObject(key: string, value: any, expireSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), expireSeconds);
  }
}

// 导出 Redis 服务实例
export const redis = RedisService.getInstance();
