# Baklib MCP Server - 开发者文档

本文档面向想要参与开发或从源码运行 Baklib MCP Server 的开发者。

## 🛠️ 开发环境设置

### 克隆仓库

```bash
git clone https://github.com/baklib/baklib-mcp-server.git
cd baklib-mcp-server
```

### 安装依赖

```bash
npm install
```

### 配置（固定优先级：ENV > `~/.config/`）

本项目通过以下优先级读取两个配置项：

- `BAKLIB_MCP_TOKEN`（必需）：Baklib API 密钥对，格式为 `access_key:secret_key`
- `BAKLIB_MCP_API_BASE`（可选）：API 基础地址（默认 `https://open.baklib.com/api/v1`）

推荐使用个人级配置（不依赖工作目录）：

```bash
mkdir -p ~/.config
printf "%s\n" "your-api-token-here" > ~/.config/BAKLIB_MCP_TOKEN
printf "%s\n" "https://open.baklib.com/api/v1" > ~/.config/BAKLIB_MCP_API_BASE
```

### 运行

#### 直接运行（命令行测试）

```bash
# 已完成配置后直接运行
npm start
```

#### 在 Cursor 中本地调试

要在 Cursor 中调试本地开发版本，使用 `npm link` 方式：

1. 在项目根目录执行：
   ```bash
   npm link
   ```

2. 在 Cursor 的 MCP 配置文件中添加（`~/.cursor/mcp.json` 或项目根目录的 `.cursor/mcp.json`）：
   ```json
   {
     "mcpServers": {
       "baklib-mcp-server-local": {
         "type": "command",
         "command": "npx",
         "args": [
           "-y",
           "@baklib/baklib-mcp-server"
         ]
       }
     }
   }
   ```

**提示**：
- Cursor 启动 MCP Server 时不保证工作目录，因此推荐用 `~/.config/BAKLIB_MCP_TOKEN` 配置。
- 也可以在上述 MCP 配置中通过 `env` 显式注入（优先级高于 `~/.config/`），例如：

```json
{
  "mcpServers": {
    "baklib-mcp-server-local": {
      "type": "command",
      "command": "npx",
      "args": ["-y", "@baklib/baklib-mcp-server"],
      "env": {
        "BAKLIB_MCP_TOKEN": "access_key:secret_key",
        "BAKLIB_MCP_API_BASE": "https://open.baklib.com/api/v1"
      }
    }
  }
}
```

3. 重启 Cursor 使配置生效。

**取消 npm link**：

如果不再需要本地链接，可以取消链接：

```bash
# 在项目根目录执行（撤销全局链接）
npm unlink -g
```

**查看 npm link 列表**：

```bash
# 查看全局链接的包
npm ls -g --depth=0 --link=true

# 查看当前项目的链接包
npm ls --link=true
```

**提示**：
- 修改代码后，重新执行 `npm link` 并重启 Cursor 使更改生效
- 确保项目已安装依赖：`npm install`
- 确保 Node.js 版本 >= 18.0.0

## 📁 项目结构

```
baklib-mcp-server/
├── index.js                    # MCP 服务器主文件
├── package.json                # 项目配置和依赖
├── package-lock.json           # 依赖锁定文件
├── mcp-config-example.json     # Cursor 配置示例
├── README.md                   # 用户文档（面向最终用户）
├── DEVELOPER.md                # 开发者文档（本文件）
├── PUBLISH.md                  # 发布指南
├── publish.sh                  # 发布脚本（可选）
├── .npmignore                  # npm 发布排除文件
├── .gitignore                  # Git 忽略文件
├── api.json                    # Baklib API 完整文档（仅开发用，不发布）
├── test-all-apis.js            # 完整 API 测试脚本（仅开发用，不发布）
├── test-upload-*.js            # 各种上传测试脚本（仅开发用，不发布）
└── node_modules/               # 依赖包
```

## 📦 依赖说明

- **@modelcontextprotocol/sdk**：MCP SDK，用于实现 MCP 协议
- **form-data**：用于创建 multipart/form-data 请求
- **node-fetch**：用于发送 HTTP 请求

## 🧪 测试

### 运行测试脚本

```bash
# 测试所有 API 接口
node test-all-apis.js your-api-token
```

### 测试单个功能

```bash
# 测试文件上传（JSON API 格式）
node test-upload-jsonapi.js file-path your-api-token

# 测试文件上传（原生格式）
node test-upload-native.js file-path your-api-token

# 测试文件上传（基础格式）
node test-upload.js file-path
```

### 测试步骤

1. **配置**：`~/.config/` 中设置 `BAKLIB_MCP_TOKEN`
2. **运行测试**：使用上述测试脚本
3. **验证结果**：检查返回的响应和文件是否成功上传

### 调试技巧

服务器会将调试信息输出到 stderr：

```bash
# 直接运行查看输出
node index.js 2>&1 | tee debug.log

# 查看 Cursor 的 MCP 日志
# 在 Cursor 中查看 MCP 连接状态和工具调用的错误信息
```

### 常见测试问题

1. **API 认证失败**：检查 `BAKLIB_MCP_TOKEN` 是否正确
2. **文件上传失败**：检查文件路径和权限
3. **API 端点错误**：确认使用的是正确的 API 端点

## 📝 代码结构

### 主要函数

- `makeApiRequest()`: 通用 API 请求函数
- `uploadFileToBaklib()`: 文件上传功能
- `dam_*()`: 资源库相关函数
- `kb_*()`: 知识库相关函数

### API 端点

所有 API 端点基于 `BAKLIB_MCP_API_BASE`（默认：`https://open.baklib.com/api/v1`）：

- 资源库：`/dam/files`, `/dam/entities`
- 知识库：`/kb/spaces`, `/kb/spaces/{space_id}/articles`

**注意**：私有化部署用户可以通过设置 `BAKLIB_MCP_API_BASE` 来配置自己的 API 地址。

## 📋 API 接口实现状态

### 资源库（DAM）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/dam/files` | POST | 上传文件到资源库 | `dam_upload_entity` | ✅ 已实现 | |
| `/dam/entities` | GET | 获取资源库列表 | `dam_list_entities` | ✅ 已实现 | |
| `/dam/entities/{entity_id}` | GET | 获取资源详情 | `dam_get_entity` | ✅ 已实现 | |
| `/dam/entities/{entity_id}` | DELETE | 删除资源 | `dam_delete_entity` | ✅ 已实现 | |
| `/dam/files/{entity_id}` | PATCH | 更新文件元数据 | `dam_update_entity` | ✅ 已实现 | |
| `/dam/entities/{entity_id}/urls` | POST | 获取带过期时间的资源 URL | - | ⏳ 待实现 | 第二阶段计划 |
| `/dam/fragments` | POST | 添加知识片段 | - | ⏳ 待实现 | 第二阶段计划 |
| `/dam/fragments/{entity_id}` | PATCH | 更新知识片段 | - | ⏳ 待实现 | 第二阶段计划 |
| `/dam/links` | POST | 添加网址资源 | - | ⏳ 待实现 | 第二阶段计划 |
| `/dam/links/{entity_id}` | PATCH | 更新网址资源 | - | ⏳ 待实现 | 第二阶段计划 |
| `/dam/collections` | GET | 获取资源库集合列表 | - | ⏳ 待实现 | 第二阶段计划 |

**实现进度**：5/11 (45.5%)

### 知识库（KB）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/kb/spaces` | GET | 获取知识库列表 | `kb_list_knowledge_bases` | ✅ 已实现 | |
| `/kb/spaces` | POST | 创建知识库 | - | ❌ 不实现 | 安全和管理考虑 |
| `/kb/spaces/{space_id}` | GET | 获取知识库详情 | `kb_get_knowledge_base` | ✅ 已实现 | |
| `/kb/spaces/{space_id}` | PATCH | 更新知识库 | - | ❌ 不实现 | 安全和管理考虑 |
| `/kb/spaces/{space_id}` | DELETE | 删除知识库 | - | ❌ 不实现 | 安全和管理考虑 |
| `/kb/spaces/{space_id}/articles` | GET | 获取文章列表 | `kb_list_articles` | ✅ 已实现 | |
| `/kb/spaces/{space_id}/articles` | POST | 创建文章 | `kb_create_article` | ✅ 已实现 | |
| `/kb/spaces/{space_id}/articles/{article_id}` | GET | 获取文章详情 | `kb_get_article` | ✅ 已实现 | |
| `/kb/spaces/{space_id}/articles/{article_id}` | PATCH | 更新文章 | `kb_update_article` | ✅ 已实现 | |
| `/kb/spaces/{space_id}/articles/{article_id}` | DELETE | 删除文章 | `kb_delete_article` | ✅ 已实现 | |

**实现进度**：7/10 接口已实现 (70%) - 注：知识库的创建/更新/删除出于安全考虑不实现

### 站点页面（Site Pages）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/sites/{site_id}/pages` | GET | 获取站点页面列表 | `site_list_pages` | ✅ 已实现 | |
| `/sites/{site_id}/pages` | POST | 创建站点页面 | `site_create_page` | ✅ 已实现 | |
| `/sites/{site_id}/pages/{page_id}` | GET | 获取页面详情 | `site_get_page` | ✅ 已实现 | |
| `/sites/{site_id}/pages/{page_id}` | PATCH | 更新页面 | `site_update_page` | ✅ 已实现 | |
| `/sites/{site_id}/pages/{page_id}` | DELETE | 删除页面 | `site_delete_page` | ✅ 已实现 | |

**实现进度**：5/5 接口已实现 (100%)

### 站点标签（Site Tags）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/sites/{site_id}/tags` | GET | 获取站点标签列表 | `site_list_tags` | ✅ 已实现 | |
| `/sites/{site_id}/tags` | POST | 创建站点标签 | `site_create_tag` | ✅ 已实现 | |
| `/sites/{site_id}/tags/{tag_id}` | GET | 获取标签详情 | `site_get_tag` | ✅ 已实现 | |
| `/sites/{site_id}/tags/{tag_id}` | DELETE | 删除标签 | `site_delete_tag` | ✅ 已实现 | |

**实现进度**：4/4 接口已实现 (100%)

### 站点管理（Site Management）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/sites` | GET | 获取站点列表 | `site_list_sites` | ✅ 已实现 | |
| `/sites/{site_id}` | GET | 获取站点详情 | `site_get_site` | ✅ 已实现 | |
| `/sites` | POST | 创建站点 | - | ❌ 不实现 | 不在当前范围 |
| `/sites/{site_id}` | PATCH | 更新站点 | - | ❌ 不实现 | 不在当前范围 |

**实现进度**：2/4 接口已实现 (50%) - 注：仅实现查询接口，创建和更新接口不在当前范围

### 用户管理（User Management）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/users` | GET | 获取用户列表 | `user_list_users` | ✅ 已实现 | |
| `/user` | GET | 获取当前用户信息 | `user_get_current` | ✅ 已实现 | |
| `/users/{user_id}` | PUT | 更新用户数据 | - | ❌ 不实现 | 不在当前范围 |

**实现进度**：2/3 接口已实现 (66.7%) - 注：仅实现查询接口，更新接口不在当前范围

### 模板管理（Theme Management）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/themes` | GET | 获取模板列表 | `theme_list_themes` | ✅ 已实现 | |

**实现进度**：1/1 接口已实现 (100%)

### 组织成员管理（Member Management）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/members` | GET | 获取成员列表 | `member_list_members` | ✅ 已实现 | |
| `/members/{member_id}` | GET | 获取成员详情 | `member_get_member` | ✅ 已实现 | |
| `/members` | POST | 添加成员 | - | ❌ 不实现 | 不在当前范围 |
| `/members/{member_id}` | PATCH | 更新成员 | - | ❌ 不实现 | 不在当前范围 |
| `/members/{member_id}/enable` | PUT | 启用成员 | - | ❌ 不实现 | 不在当前范围 |
| `/members/{member_id}/disable` | PUT | 禁用成员 | - | ❌ 不实现 | 不在当前范围 |

**实现进度**：2/6 接口已实现 (33.3%) - 注：仅实现查询接口，其他接口不在当前范围

### 其他接口（不在当前 MCP Server 范围内）

| API 端点 | HTTP 方法 | 功能描述 | 状态 | 备注 |
|---------|----------|---------|------|------|
| `/organizations/departments` | GET/POST/PATCH/DELETE | 部门管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/groups` | GET/POST/PATCH/DELETE | 团队管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/employees` | GET/POST/PATCH/DELETE | 雇员管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/position-types` | GET/POST/PATCH/DELETE | 职位类型管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/positions` | GET/POST/PATCH/DELETE | 职位管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/suppliers` | GET/POST/PATCH/DELETE | 供应商管理 | ❌ 不实现 | 不在当前范围 |
| `/users/{user_id}/bindings` | GET/POST/DELETE | 用户绑定第三方账号 | ❌ 不实现 | 不在当前范围 |

### 接口状态说明

- ✅ **已实现**：功能已完成并通过测试
- ⏳ **待实现**：计划实现但尚未完成
- ❌ **不实现**：根据项目需求，暂不计划实现

### 实现进度总结

#### 第一阶段（已完成）✅
- **资源库核心功能**：文件上传、查询、更新、删除（5 个接口）
- **知识库核心功能**：文章创建、查询、更新、删除，知识库列表和详情（7 个接口）
- **站点页面管理**：页面列表、创建、查看、更新、删除（5 个接口）
- **站点标签管理**：标签列表、创建、查看、删除（4 个接口）
- **站点管理**：站点列表、站点详情（2 个接口）
- **用户管理**：用户列表、当前用户信息（2 个接口）
- **模板管理**：模板列表（1 个接口）
- **组织成员管理**：成员列表、成员详情（2 个接口）

#### 第二阶段（计划中）⏳
- **资源库扩展功能**（6 个接口待实现）：
  - 获取带过期时间的资源 URL
  - 知识片段管理（创建、更新）
  - 网址资源管理（创建、更新）
  - 资源库集合管理

#### 不实现接口 ❌
- **知识库管理接口**（3 个接口）：创建、更新、删除知识库 - 出于安全和管理考虑
- **站点管理接口**（2 个接口）：创建、更新站点 - 不在当前范围
- **用户管理接口**（1 个接口）：更新用户数据 - 不在当前范围
- **第三方功能集成接口**（7 个接口）：全部不实现 - 不在当前范围
- **组织成员管理接口**（4 个接口）：添加、更新、启用、禁用成员 - 不在当前范围
- **其他功能模块接口**（7 个接口）：部门管理、团队管理、雇员管理、职位类型、职位、供应商、用户绑定第三方账号等 - 不在当前 MCP Server 范围内

### 总体统计

- **资源库（DAM）**：5/11 接口已实现 (45.5%)
  - ✅ 已实现：5 个
  - ⏳ 待实现：6 个（第二阶段计划）
- **知识库（KB）**：7/10 接口已实现 (70%)
  - ✅ 已实现：7 个
  - ❌ 不实现：3 个（安全考虑）
- **站点页面（Site Pages）**：5/5 接口已实现 (100%)
  - ✅ 已实现：5 个
- **站点标签（Site Tags）**：4/4 接口已实现 (100%)
  - ✅ 已实现：4 个
- **站点管理（Site Management）**：2/4 接口已实现 (50%)
  - ✅ 已实现：2 个（查询接口）
  - ❌ 不实现：2 个（创建、更新接口）
- **用户管理（User Management）**：2/3 接口已实现 (66.7%)
  - ✅ 已实现：2 个（查询接口）
  - ❌ 不实现：1 个（更新接口）
- **模板管理（Theme Management）**：1/1 接口已实现 (100%)
  - ✅ 已实现：1 个
- **组织成员管理（Member Management）**：2/6 接口已实现 (33.3%)
  - ✅ 已实现：2 个（查询接口）
  - ❌ 不实现：4 个（其他接口）
- **其他模块**：0/7 接口已实现
  - ❌ 不实现：7 个（不在当前范围）
- **总计**：28/51 接口已实现 (54.9%)
  - ✅ 已实现：28 个
  - ⏳ 待实现：6 个
  - ❌ 不实现：17 个

**详细接口清单请查看 [API-STATUS.md](./API-STATUS.md)**

## 🔄 开发流程

### 添加新功能

1. 在 `index.js` 中实现新功能函数
2. 在 `ListToolsRequestSchema` 中添加工具定义
3. 在 `CallToolRequestSchema` 中添加工具处理逻辑
4. 更新 `README.md` 添加使用说明
5. 编写测试并验证

### 代码规范

- 使用 ES6+ 语法
- 使用 async/await 处理异步操作
- 添加适当的错误处理
- 添加注释说明关键逻辑

## 📦 发布流程

参考 [PUBLISH.md](./PUBLISH.md) 了解详细的发布流程。

### 快速发布

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 发布
npm publish --access public
```

## 🐛 调试

### 查看日志

服务器会将调试信息输出到 stderr：

```bash
node index.js 2>&1 | tee debug.log
```

### 常见问题

1. **依赖安装失败**：确保 Node.js 版本 >= 18.0.0
2. **API 请求失败**：检查网络连接和 token 配置
3. **文件上传失败**：检查文件路径和权限

## 📚 相关资源

- [Baklib API 文档](https://dev.baklib.cn/api)
- [MCP 协议文档](https://modelcontextprotocol.io)
- [npm 包页面](https://www.npmjs.com/package/@baklib/baklib-mcp-server)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

