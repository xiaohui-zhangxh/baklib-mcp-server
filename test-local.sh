#!/bin/bash

# 本地测试脚本 - 测试 MCP 服务器是否可以正常运行
# 这个脚本会打包本地代码，安装到临时目录，并测试运行
#
# 使用方法：
#   ./test-local.sh        # 直接运行（推荐）
#   bash test-local.sh      # 使用 bash 运行
#   不要使用 source 运行，因为脚本中有 exit 命令

# 检测是否通过 source 运行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # 直接运行，可以使用 set -e
    set -e
    SCRIPT_MODE="direct"
else
    # 通过 source 运行，不使用 set -e，改用错误检查
    SCRIPT_MODE="sourced"
    echo "⚠️  警告：检测到通过 source 运行"
    echo "   建议使用: ./test-local.sh 或 bash test-local.sh"
    echo ""
fi

echo "🧪 本地测试 MCP 服务器"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 步骤 1: 打包本地代码..."
npm pack > /dev/null 2>&1

PACKAGE_FILE=$(ls -t baklib-baklib-mcp-server-*.tgz | head -1)
echo "✅ 已创建包: $PACKAGE_FILE"
echo ""

# 创建临时测试目录
TEST_DIR="/tmp/test-baklib-mcp-local-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo "📥 步骤 2: 在临时目录安装包..."
npm init -y > /dev/null 2>&1
npm install "$SCRIPT_DIR/$PACKAGE_FILE" > /dev/null 2>&1
echo "✅ 包已安装到: $TEST_DIR"
echo ""

echo "🔍 步骤 3: 检查依赖..."
MISSING_DEPS=0

# 检查 @modelcontextprotocol/sdk
if [ -f "node_modules/@modelcontextprotocol/sdk/dist/server/index.js" ]; then
    echo "✅ @modelcontextprotocol/sdk 已安装"
else
    echo "❌ @modelcontextprotocol/sdk 未安装或文件缺失"
    MISSING_DEPS=1
fi

# 检查 zod
if [ -d "node_modules/zod" ]; then
    echo "✅ zod 已安装"
else
    echo "❌ zod 未安装"
    MISSING_DEPS=1
fi

# 检查其他依赖
for dep in "form-data"; do
    if [ -d "node_modules/$dep" ]; then
        echo "✅ $dep 已安装"
    else
        echo "❌ $dep 未安装"
        MISSING_DEPS=1
    fi
done

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    echo "❌ 依赖检查失败，请检查 package.json"
    if [ "$SCRIPT_MODE" = "sourced" ]; then
        echo "⚠️  由于通过 source 运行，不会退出 shell"
        return 1 2>/dev/null || exit 1
    else
        exit 1
    fi
fi

echo ""
echo "🚀 步骤 4: 测试运行（进程可启动）..."
echo "   MCP 在 stdio 上运行，不会在缺少 Token 时立即退出；采集短时 stderr 应出现启动日志"
echo ""

# 短时运行：服务器会阻塞在 stdio，故后台启动后 sleep 再 kill，避免脚本挂起
ERR_FILE="$(mktemp)"
node node_modules/@baklib/baklib-mcp-server/index.js 2>"$ERR_FILE" &
NODE_PID=$!
sleep 1
kill "$NODE_PID" 2>/dev/null || true
wait "$NODE_PID" 2>/dev/null || true
OUTPUT=$(cat "$ERR_FILE" 2>/dev/null || true)
rm -f "$ERR_FILE"

if echo "$OUTPUT" | grep -qE "Baklib MCP Server|BAKLIB_MCP_TOKEN"; then
    echo "✅ 代码可以运行（MCP 进程启动或配置相关提示）"
    echo "   输出: $(echo "$OUTPUT" | head -1)"
elif echo "$OUTPUT" | grep -q "Cannot find module"; then
    echo "❌ 模块找不到错误："
    echo "$OUTPUT" | head -5
    if [ "$SCRIPT_MODE" = "sourced" ]; then
        return 1 2>/dev/null || exit 1
    else
        exit 1
    fi
elif echo "$OUTPUT" | grep -q "command not found"; then
    echo "❌ 命令找不到错误："
    echo "$OUTPUT" | head -5
    if [ "$SCRIPT_MODE" = "sourced" ]; then
        return 1 2>/dev/null || exit 1
    else
        exit 1
    fi
else
    echo "⚠️  意外的输出："
    echo "$OUTPUT" | head -5
fi

echo ""
echo "🔧 步骤 5: 测试 bin 命令..."
if [ -f "node_modules/.bin/baklib-mcp-server" ]; then
    echo "✅ bin 链接已创建: node_modules/.bin/baklib-mcp-server"
    
    # 测试 bin 命令（同样短时运行）
    BIN_ERR="$(mktemp)"
    node node_modules/.bin/baklib-mcp-server 2>"$BIN_ERR" &
    BIN_PID=$!
    sleep 1
    kill "$BIN_PID" 2>/dev/null || true
    wait "$BIN_PID" 2>/dev/null || true
    BIN_OUTPUT=$(cat "$BIN_ERR" 2>/dev/null || true)
    rm -f "$BIN_ERR"
    if echo "$BIN_OUTPUT" | grep -qE "Baklib MCP Server|BAKLIB_MCP_TOKEN"; then
        echo "✅ bin 命令可以运行"
    else
        echo "⚠️  bin 命令输出异常："
        echo "$BIN_OUTPUT" | head -3
    fi
else
    echo "❌ bin 链接未创建"
    if [ "$SCRIPT_MODE" = "sourced" ]; then
        return 1 2>/dev/null || exit 1
    else
        exit 1
    fi
fi

echo ""
echo "📋 步骤 6: 检查包信息..."
PACKAGE_JSON="node_modules/@baklib/baklib-mcp-server/package.json"
if [ -f "$PACKAGE_JSON" ]; then
    # 使用 fs.readFileSync 读取 package.json（更可靠）
    PACKAGE_NAME=$(node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8')); console.log(pkg.name)")
    PACKAGE_VERSION=$(node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8')); console.log(pkg.version)")
    PACKAGE_BIN=$(node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8')); console.log(JSON.stringify(pkg.bin, null, 2))")
    
    echo "✅ 包名: $PACKAGE_NAME"
    echo "✅ 版本: $PACKAGE_VERSION"
    echo "✅ bin 配置:"
    echo "$PACKAGE_BIN" | sed 's/^/   /'
else
    echo "❌ package.json 不存在: $PACKAGE_JSON"
    echo "   当前目录: $(pwd)"
    echo "   检查安装的包:"
    ls -la node_modules/@baklib/ 2>&1 | head -5 || echo "   @baklib 目录不存在"
    if [ "$SCRIPT_MODE" = "sourced" ]; then
        return 1 2>/dev/null || exit 1
    else
        exit 1
    fi
fi

echo ""
echo "✅ 所有测试通过！"
echo ""
echo "📝 下一步："
echo "   1. 如果所有测试通过，可以发布: npm publish --access public"
echo "   2. 清理测试目录: rm -rf $TEST_DIR"
echo "   3. 清理打包文件: rm -f $SCRIPT_DIR/baklib-baklib-mcp-server-*.tgz"
echo ""
echo "🧹 清理命令："
echo "   rm -rf $TEST_DIR"
echo "   rm -f $SCRIPT_DIR/baklib-baklib-mcp-server-*.tgz"

