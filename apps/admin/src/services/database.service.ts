import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';

import mysql from 'mysql2/promise';

import { config } from '#/config';
import { logger } from '#/utils/logger';

/**
 * 数据库服务类
 */
class DatabaseService {
  private static instance: DatabaseService;
  private pool: Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      connectionLimit: config.database.connectionLimit,
      waitForConnections: config.database.waitForConnections,
      queueLimit: config.database.queueLimit,
    });

    logger.info('数据库连接池已创建');
  }

  /**
   * 获取数据库服务实例（单例模式）
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * 关闭数据库连接池
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      logger.info('数据库连接池已关闭');
    } catch (error) {
      logger.error('关闭数据库连接池失败:', error);
      throw error;
    }
  }

  /**
   * 执行删除
   */
  public async delete(sql: string, params?: any[]): Promise<number> {
    try {
      const [result] = await this.pool.query(sql, params);
      return (result as any).affectedRows;
    } catch (error) {
      logger.error('数据库删除失败:', error);
      throw error;
    }
  }

  /**
   * 获取连接池
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * 执行插入
   */
  public async insert(
    sql: string,
    params?: any[]
  ): Promise<{ affectedRows: number; insertId: number }> {
    try {
      const [result] = await this.pool.query(sql, params);
      const { insertId, affectedRows } = result as any;
      return { insertId, affectedRows };
    } catch (error) {
      logger.error('数据库插入失败:', error);
      throw error;
    }
  }

  /**
   * 执行查询
   */
  public async query<T extends RowDataPacket>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const [rows] = await this.pool.query<T[]>(sql, params);
      return rows;
    } catch (error) {
      logger.error('数据库查询失败:', error);
      throw error;
    }
  }

  /**
   * 执行单条查询
   */
  public async queryOne<T extends RowDataPacket>(sql: string, params?: any[]): Promise<null | T> {
    try {
      const rows = await this.query<T>(sql, params);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error('数据库查询失败:', error);
      throw error;
    }
  }

  /**
   * 测试数据库连接
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      logger.info('数据库连接测试成功');
      return true;
    } catch (error) {
      logger.error('数据库连接测试失败:', error);
      return false;
    }
  }

  /**
   * 开启事务
   */
  public async transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      logger.error('事务执行失败:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 执行更新
   */
  public async update(sql: string, params?: any[]): Promise<number> {
    try {
      const [result] = await this.pool.query(sql, params);
      return (result as any).affectedRows;
    } catch (error) {
      logger.error('数据库更新失败:', error);
      throw error;
    }
  }
}

// 导出数据库服务实例
export const db = DatabaseService.getInstance();
