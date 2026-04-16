# Changelog

本文档记录 Baklib MCP Server 的所有版本变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.5.2] - 2026-04-16

### 🔧 改进

- **依赖**：移除 `node-fetch`，改用 Node 18+ 内置 `fetch`，安装时不再出现 `npm warn deprecated node-domexception@1.0.0`（该告警来自 `node-fetch` → `fetch-blob` 依赖链）。

## [0.5.1] - 2026-04-16

### 🔧 修复

- **本地开发 / npx**：在克隆本仓库的根目录执行 `npx -y @baklib/baklib-mcp-server@…` 时，若 `node_modules/.bin/baklib-mcp-server` 不存在，会出现 `sh: baklib-mcp-server: command not found`。新增 `postinstall` 脚本 `scripts/ensure-bin.mjs`，在 `npm install` 后补全该链接（与 Cursor 将工作区打开为本仓库时的行为一致）。

## [0.5.0] - 2026-04-16

### ✨ 新增与改进

- **BKE 默认查询**：新增 `lib/bke-api-defaults.js`，统一合并 `body_format=markdown` 等默认查询参数
- **知识库（KB）**：创建/更新文章使用 `body_type=markdown`，工具描述与 Baklib 知识引擎（BKE）约定对齐
- **站点 / DAM**：读取类工具与说明中明确区分 Markdown 响应与写入格式
- **`dam_upload_entity`**：工具返回中补充 `iid`
- **API 客户端**（`lib/api-client.js`）：增强响应解析；支持环境变量 `BAKLIB_MCP_TRACE` 进行可选请求追踪

## [0.4.0] - 2026-04-09

### ✨ 新增功能

- **配置**：支持 `BAKLIB_MCP_WORKSPACE`（例如 MCP `env` 中设为 `${workspaceFolder}`），从 `$WORKSPACE/.config/` 读取 `BAKLIB_MCP_TOKEN` 与 `BAKLIB_MCP_API_BASE`，优先级介于进程环境变量与 `~/.config/` 之间
- **调试**：`BAKLIB_MCP_DEBUG=1` 时在 stderr 输出配置解析路径与来源（不输出密钥内容）；检测到未展开的 `$workspaceFolder` 占位符时给出明确提示

### 📚 文档

- 更新 `README.md`、`DEVELOPER.md` 与 `mcp-config-example.json` 中的配置说明与示例

## [0.3.0] - 2026-04-09

### ✨ 新增功能

- **DAM**：`dam_get_entity` 支持可选查询参数 `include_signed_id`、`purpose`，用于按场景获取 `signed_id`（如动态表单 `dynamic_form`、富文本嵌入等）

### 🔧 改进

- 明确工具参数说明：`id` 为 DAM 实体 id（非 `signed_id`）

### 📚 测试

- `test-all-apis.js` 增加带 `include_signed_id` 与 `purpose` 的 DAM 实体查询用例

## [0.2.0] - 2026-03-31

### 🔧 改进

- 配置读取方式统一为从命令行环境变量或 `~/.config/` 读取
- 配置项更名为 `BAKLIB_MCP_TOKEN` 与 `BAKLIB_MCP_API_BASE`

### 📚 文档更新

- 更新 `README.md`、`DEVELOPER.md`、`AGENTS.md` 与示例配置，迁移到新的配置方式

## [0.1.0] - 2025-12-15

### 🎉 重大更新

这是一个重要的功能更新版本，新增了大量 API 工具支持，并进行了代码架构重构。

### ✨ 新增功能

#### 站点管理功能
- **站点页面管理**：完整的站点页面 CRUD 操作
  - `site_list_pages` - 获取站点页面列表
  - `site_create_page` - 创建站点页面
  - `site_get_page` - 获取页面详情
  - `site_update_page` - 更新页面
  - `site_delete_page` - 删除页面

- **站点标签管理**：站点标签的创建、查询和删除
  - `site_list_tags` - 获取站点标签列表
  - `site_create_tag` - 创建站点标签
  - `site_get_tag` - 获取标签详情
  - `site_delete_tag` - 删除标签

- **站点查询**：站点信息查询
  - `site_list_sites` - 获取站点列表
  - `site_get_site` - 获取站点详情

#### 用户和成员管理
- **用户管理**：用户信息查询
  - `user_list_users` - 获取用户列表
  - `user_get_current` - 获取当前用户信息

- **成员管理**：团队成员信息查询
  - `member_list_members` - 获取成员列表
  - `member_get_member` - 获取成员详情

#### 其他功能
- **主题管理**：模板主题查询
  - `theme_list_themes` - 获取模板列表

### 🔧 改进

- **代码架构重构**：
  - 将工具函数从 `index.js` 中模块化拆分
  - 每个工具函数独立为单独的文件，提高代码可维护性
  - 统一工具导出机制，使用 `lib/tools/index.js` 集中管理

- **代码组织优化**：
  - 改进 `lib/tools/index.js` 的导出方式，从直接 export 改为先 import 再统一 export
  - 更好的代码结构和可读性

### 📚 文档更新

- 更新 `DEVELOPER.md`，添加新增功能的 API 实现状态说明
- 完善 API 接口实现进度统计

### 📊 统计

- **新增工具数量**：16 个（已移除第三方集成功能）
- **代码变更**：26 个文件变更，新增 1640 行，删除 861 行
- **API 覆盖范围**：
  - 站点页面：5/5 (100%)
  - 站点标签：4/4 (100%)
  - 站点管理：2/4 (50%)
  - 用户管理：2/3 (66.7%)
  - 主题管理：1/1 (100%)
  - 成员管理：2/2 (100%)

---

## [0.0.6] - 2025-12-15

### 初始版本

- 支持资源库（DAM）完整功能（上传、查询、更新、删除文件）
- 支持知识库（KB）完整功能（创建、查询、更新、删除文章，获取知识库列表）
- 支持分页和筛选
- 自动 MIME 类型检测
- 支持私有化部署（通过 `BAKLIB_API_BASE` 环境变量）

---

[0.5.2]: https://github.com/baklib/baklib-mcp-server/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/baklib/baklib-mcp-server/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/baklib/baklib-mcp-server/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/baklib/baklib-mcp-server/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/baklib/baklib-mcp-server/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/baklib/baklib-mcp-server/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/baklib/baklib-mcp-server/compare/v0.0.6...v0.1.0
[0.0.6]: https://github.com/baklib/baklib-mcp-server/releases/tag/v0.0.6

