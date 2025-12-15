#!/bin/bash

# Baklib MCP Server 发布脚本

set -e

echo "🚀 准备发布 @baklib/baklib-mcp-server 到 npmjs.com"
echo ""

# 检查是否已登录 npm
echo "📋 检查 npm 登录状态..."
if ! npm whoami &> /dev/null; then
    echo "❌ 未登录 npm，请先运行: npm login"
    exit 1
fi

echo "✅ 已登录为: $(npm whoami)"
echo ""

# 检查包配置
echo "📦 检查包配置..."
npm pack --dry-run > /dev/null
echo "✅ 包配置正确"
echo ""

# 显示将要发布的文件
echo "📄 将要发布的文件:"
npm pack --dry-run 2>&1 | grep -A 100 "Tarball Contents" | head -20
echo ""

# 确认发布
read -p "是否继续发布? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消发布"
    exit 1
fi

# 发布
echo ""
echo "📤 正在发布到 npmjs.com..."
npm publish --access public

echo ""
echo "✅ 发布成功！"
echo ""
echo "📦 包地址: https://www.npmjs.com/package/@baklib/baklib-mcp-server"
echo ""

