#!/bin/bash

# 权限系统初始化脚本

echo "========================================="
echo "  Petzilla 权限系统初始化"
echo "========================================="
echo ""

# 检查 MySQL 是否安装
if ! command -v mysql &> /dev/null; then
    echo "❌ 错误: 未检测到 MySQL，请先安装 MySQL"
    exit 1
fi

# 检查 Redis 是否安装
if ! command -v redis-cli &> /dev/null; then
    echo "❌ 错误: 未检测到 Redis，请先安装 Redis"
    exit 1
fi

# 读取配置
read -p "请输入 MySQL 用户名 [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "请输入 MySQL 密码: " DB_PASSWORD
echo ""

read -p "请输入数据库名称 [petzilla_dev]: " DB_NAME
DB_NAME=${DB_NAME:-petzilla_dev}

echo ""
echo "========================================="
echo "开始初始化..."
echo "========================================="
echo ""

# 1. 创建数据库
echo "📦 创建数据库..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo "✅ 数据库创建成功"
else
    echo "❌ 数据库创建失败"
    exit 1
fi

# 2. 执行数据库表结构
echo ""
echo "📋 创建数据表..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < src/database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据表创建成功"
else
    echo "❌ 数据表创建失败"
    exit 1
fi

# 3. 导入初始数据
echo ""
echo "🌱 导入初始数据..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < src/database/seed.sql

if [ $? -eq 0 ]; then
    echo "✅ 初始数据导入成功"
else
    echo "❌ 初始数据导入失败"
    exit 1
fi

echo ""
echo "========================================="
echo "  ✅ 初始化完成！"
echo "========================================="
echo ""
echo "📝 初始账号信息："
echo ""
echo "超级管理员："
echo "  用户名: admin"
echo "  密码: admin123"
echo "  邮箱: admin@petzilla.com"
echo ""
echo "测试商户A店长："
echo "  用户名: merchant_a_owner"
echo "  密码: merchant123"
echo "  邮箱: owner@merchant-a.com"
echo ""
echo "测试商户B店长："
echo "  用户名: merchant_b_owner"
echo "  密码: merchant123"
echo "  邮箱: owner@merchant-b.com"
echo ""
echo "⚠️  警告: 请在生产环境中修改默认密码！"
echo ""
echo "🚀 现在可以运行 'pnpm dev' 启动服务"
echo ""
