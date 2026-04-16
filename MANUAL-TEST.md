# 手工测试指南

在发布前，你可以手工逐步测试包的每个部分，确保一切正常。

## 📋 测试前准备

```bash
# 进入项目目录（请替换为你的实际项目路径）
cd /path/to/baklib-mcp-server
```

## 步骤 1: 检查 package.json

```bash
# 查看包配置
cat package.json

# 确认以下内容：
# - name: "@baklib/baklib-mcp-server"
# - version: "0.0.4" (或当前版本)
# - bin 字段存在且指向 "./index.js"
# - dependencies 包含所有必需的依赖（@modelcontextprotocol/sdk, zod, form-data；HTTP 使用 Node 18+ 内置 fetch）
```

## 步骤 2: 打包本地代码

```bash
# 打包
npm pack

# 查看生成的 .tgz 文件
ls -lh baklib-baklib-mcp-server-*.tgz

# 应该看到类似：baklib-baklib-mcp-server-0.0.4.tgz
```

## 步骤 3: 检查打包内容

```bash
# 查看要发布的文件列表
npm pack --dry-run

# 应该只包含：
# - package.json
# - index.js
# - README.md
# - mcp-config-example.json
# 不应该包含：node_modules, test-*.js, .env 等
```

## 步骤 4: 在临时目录安装测试

```bash
# 创建临时测试目录
mkdir -p /tmp/test-baklib-manual
cd /tmp/test-baklib-manual

# 初始化 npm 项目
npm init -y

# 安装本地打包的文件（请替换为你的实际包文件路径）
npm install /path/to/baklib-mcp-server/baklib-baklib-mcp-server-0.0.4.tgz

# 查看安装的包
ls -la node_modules/@baklib/baklib-mcp-server/
```

## 步骤 5: 检查依赖是否正确安装

```bash
# 检查关键依赖
echo "检查 @modelcontextprotocol/sdk..."
ls node_modules/@modelcontextprotocol/sdk/dist/server/index.js

echo "检查 zod..."
ls node_modules/zod

echo "检查其他依赖..."
ls node_modules/form-data
node -e "if (typeof fetch !== 'function') process.exit(1)" && echo "fetch OK (Node 18+)"
```

**预期结果**：所有依赖都应该存在，没有 "No such file or directory" 错误。

## 步骤 6: 测试代码运行

```bash
# 测试运行（未配置 token 时显示配置缺失错误，这是正常的）
node node_modules/@baklib/baklib-mcp-server/index.js
```

**预期输出**：
```
错误：未找到 BAKLIB_MCP_TOKEN 配置。请在命令行环境变量或 ~/.config/ 中设置。
```

**如果看到其他错误**（如 "Cannot find module"），说明依赖有问题。

## 步骤 7: 测试 bin 命令

```bash
# 检查 bin 链接是否创建
ls -la node_modules/.bin/baklib-mcp-server

# 应该看到符号链接指向 ../@baklib/baklib-mcp-server/index.js

# 测试 bin 命令
node node_modules/.bin/baklib-mcp-server
```

**预期输出**：同样显示 `BAKLIB_MCP_TOKEN` 配置缺失错误

## 步骤 8: 检查包信息

```bash
# 查看安装的包的 package.json
cat node_modules/@baklib/baklib-mcp-server/package.json

# 确认：
# - name 正确
# - version 正确
# - bin 配置正确
# - dependencies 完整
```

## 步骤 9: 测试通过 npx 安装（可选）

```bash
# 清理 npx 缓存
rm -rf ~/.npm/_npx

# 注意：这一步需要先发布到 npm，所以可以先跳过
# 发布后再测试：
# npx -y @baklib/baklib-mcp-server@0.0.4
```

## 步骤 10: 清理测试环境

```bash
# 返回项目目录（请替换为你的实际项目路径）
cd /path/to/baklib-mcp-server

# 清理临时测试目录
rm -rf /tmp/test-baklib-manual

# 清理打包文件（可选，发布前可能需要保留）
# rm -f baklib-baklib-mcp-server-*.tgz
```

## ✅ 测试检查清单

完成所有步骤后，确认：

- [ ] `package.json` 配置正确
- [ ] `npm pack` 成功生成 .tgz 文件
- [ ] `npm pack --dry-run` 只显示需要发布的文件
- [ ] 在临时目录安装成功
- [ ] 所有依赖都正确安装（@modelcontextprotocol/sdk, zod, form-data）
- [ ] 代码可以运行（显示预期的环境变量错误）
- [ ] bin 链接已创建
- [ ] bin 命令可以运行
- [ ] 包信息正确

## 🐛 常见问题排查

### 问题 1: 依赖未安装

**症状**：`Cannot find module '@modelcontextprotocol/sdk'` 或 `Cannot find module 'zod'`

**检查**：
```bash
# 检查 package.json 中的 dependencies
cat package.json | grep -A 10 '"dependencies"'

# 确认包含所有必需的依赖
```

**解决**：确保 `package.json` 的 `dependencies` 中包含所有依赖。

### 问题 2: bin 链接未创建

**症状**：`ls node_modules/.bin/baklib-mcp-server` 显示文件不存在

**检查**：
```bash
# 检查 package.json 中的 bin 配置
cat package.json | grep -A 3 '"bin"'

# 应该看到：
# "bin": {
#   "baklib-mcp-server": "./index.js"
# }
```

**解决**：确保 `package.json` 中有正确的 `bin` 配置。

### 问题 3: 打包文件包含不需要的文件

**症状**：`npm pack --dry-run` 显示包含 test-*.js 或其他不应该发布的文件

**检查**：
```bash
# 检查 .npmignore
cat .npmignore
```

**解决**：确保 `.npmignore` 正确配置，排除测试文件和开发文件。

## 📝 测试完成后

如果所有测试都通过：

1. **确认版本号**：检查 `package.json` 和 `index.js` 中的版本号一致
2. **准备发布**：运行 `npm publish --access public`
3. **验证发布**：发布后清理 npx 缓存并测试安装

## 🎯 快速测试命令汇总

```bash
# 1. 打包
npm pack

# 2. 检查内容
npm pack --dry-run

# 3. 在临时目录测试安装
mkdir -p /tmp/test && cd /tmp/test
npm init -y
npm install /path/to/baklib-baklib-mcp-server-0.0.4.tgz

# 4. 检查依赖
ls node_modules/@modelcontextprotocol/sdk/dist/server/index.js
ls node_modules/zod

# 5. 测试运行
node node_modules/@baklib/baklib-mcp-server/index.js

# 6. 测试 bin
node node_modules/.bin/baklib-mcp-server

# 7. 清理
cd /path/to/project
rm -rf /tmp/test
```

