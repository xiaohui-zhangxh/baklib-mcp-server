# 发布到 npmjs.com 指南

## 📦 包信息

- **包名**: `@baklib/baklib-mcp-server`
- **当前版本**: `0.4.0`
- **作用域**: `@baklib` (需要 npm 账号有该作用域的发布权限)

## 🔑 前置条件

### 1. 创建 npm 账号

如果没有 npm 账号，请访问 https://www.npmjs.com/signup 注册。

### 2. 创建或加入 @baklib 组织

由于包名使用了作用域 `@baklib`，你需要：

1. **创建组织**（如果还没有）：
   - 访问 https://www.npmjs.com/org/create
   - 创建 `@baklib` 组织
   - 选择免费计划（Public packages）

2. **或者加入现有组织**：
   - 如果组织已存在，需要组织管理员邀请你加入

### 3. 登录 npm

```bash
npm login
```

输入你的 npm 用户名、密码和邮箱。

## 📝 发布步骤

### 步骤 0: 本地测试（必须）

**⚠️ 重要**：发布前必须进行本地测试，确保包可以正常工作。

```bash
# 运行完整测试
./test-local.sh
```

测试通过后，才能继续发布。如果测试失败，请修复问题后再发布。

### 步骤 1: 检查配置

确保 `package.json` 中的信息正确：

```json
{
  "name": "@baklib/baklib-mcp-server",
  "version": "0.4.0",
  "description": "...",
  "author": "Baklib",
  "license": "MIT"
}
```

### 步骤 2: 检查要发布的文件

运行以下命令查看哪些文件会被发布：

```bash
npm pack --dry-run
```

这会显示将要打包的文件列表，确保没有包含不必要的文件（测试文件、临时文件等）。

### 步骤 3: 验证包内容

```bash
npm pack
```

这会创建一个 `.tgz` 文件，你可以解压查看内容：

```bash
tar -xzf @baklib-baklib-mcp-server-0.0.4.tgz
cd package
ls -la
```

### 步骤 4: 发布到 npm

#### 首次发布

```bash
npm publish --access public
```

**注意**: 作用域包（scoped packages）默认是私有的，需要使用 `--access public` 参数发布为公开包。

#### 后续版本更新

1. **更新版本号**（使用语义化版本）：
   ```bash
   # 补丁版本（bug 修复）
   npm version patch
   
   # 次要版本（新功能）
   npm version minor
   
   # 主要版本（重大变更）
   npm version major
   ```

2. **发布**：
   ```bash
   npm publish
   ```

### 步骤 5: 验证发布

发布成功后，访问以下 URL 查看你的包：

```
https://www.npmjs.com/package/@baklib/baklib-mcp-server
```

## 🔄 版本管理

### 语义化版本（Semantic Versioning）

- **主版本号（Major）**: 不兼容的 API 修改
- **次版本号（Minor）**: 向下兼容的功能性新增
- **修订号（Patch）**: 向下兼容的问题修正

### 版本更新示例

```bash
# 当前版本: 0.0.4

# 修复 bug
npm version patch  # -> 0.0.2

# 添加新功能
npm version minor  # -> 1.1.0

# 重大变更
npm version major  # -> 2.0.0
```

## 📋 发布检查清单

发布前请确认：

- [ ] **本地测试通过**：运行 `./test-local.sh` 所有测试通过 ✅（最重要）
- [ ] `package.json` 中的信息正确（名称、版本、描述等）
- [ ] 所有依赖都已正确声明（包括 `zod`）
- [ ] README.md 内容完整且准确
- [ ] 代码已通过测试
- [ ] `.npmignore` 已配置，排除不必要的文件
- [ ] `npm pack --dry-run` 显示正确的文件
- [ ] 已登录 npm (`npm whoami` 验证)
- [ ] 有 `@baklib` 组织的发布权限
- [ ] 版本号已更新（如果不是首次发布）
- [ ] `index.js` 中的版本号已同步更新

## 🚨 常见问题

### 1. 权限错误

**错误**: `npm ERR! code E403` 或 `npm ERR! 403 You do not have permission`

**解决方案**:
- 确认已登录正确的 npm 账号
- 确认有 `@baklib` 组织的发布权限
- 如果是首次发布作用域包，使用 `npm publish --access public`

### 2. 包名已存在

**错误**: `npm ERR! code E403` - Package name already exists

**解决方案**:
- 检查包名是否正确
- 如果是更新版本，确保版本号已更新

### 3. 版本已存在

**错误**: `npm ERR! code E403` - Version already exists

**解决方案**:
- 使用 `npm version patch/minor/major` 更新版本号
- 或手动修改 `package.json` 中的版本号

## 📚 相关资源

- [npm 发布文档](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [作用域包文档](https://docs.npmjs.com/about-scopes)
- [语义化版本](https://semver.org/)

## 🎯 快速发布命令

```bash
# 1. 登录
npm login

# 2. 检查配置
npm pack --dry-run

# 3. 首次发布
npm publish --access public

# 4. 后续更新（更新版本后）
npm version patch && npm publish
```

