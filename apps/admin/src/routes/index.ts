import type { RouteHandler } from './types';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Router from '@koa/router';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const coreDir = path.join(__dirname, 'core');

/**
 * 递归扫描目录，查找所有路由文件
 * @param dir 目录路径
 * @param basePrefix 基础前缀（相对于 core 目录）
 */
async function scanRoutes(
  dir: string,
  basePrefix = ''
): Promise<{ filePath: string; prefix: string }[]> {
  const routes: { filePath: string; prefix: string }[] = [];

  if (!fs.existsSync(dir)) {
    return routes;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // 递归扫描子目录，累加前缀
      const subRoutes = await scanRoutes(fullPath, `${basePrefix}/${entry.name}`);
      routes.push(...subRoutes);
    } else if (entry.isFile() && entry.name.endsWith('.route.ts')) {
      // 提取路由名称: user.route.ts -> user
      const routeName = entry.name.replace('.route.ts', '');
      const prefix = `${basePrefix}/${routeName}`;

      routes.push({ filePath: fullPath, prefix });
    }
  }

  return routes;
}

export const useRouter = async (): Promise<Router> => {
  const mainRouter = new Router();

  try {
    const routes = await scanRoutes(coreDir);

    for (const { filePath, prefix } of routes) {
      const subRouter = new Router({ prefix });

      const routeModule = await import(`file://${filePath}`);
      const routeHandler = routeModule.default || routeModule;

      if (typeof routeHandler === 'function') {
        mainRouter.use((routeHandler as RouteHandler)(subRouter).routes());
      } else {
        console.warn(chalk.yellow(`[WARN] Invalid route handler: ${filePath}`));
      }
    }

    return mainRouter;
  } catch (error) {
    console.error(chalk.red(`Failed to load routes: ${(error as Error).message}`));
    throw error;
  }
};
