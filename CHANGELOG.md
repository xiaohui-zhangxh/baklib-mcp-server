# Changelog

本文档记录 Baklib MCP Server 的所有版本变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

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

[0.1.0]: https://github.com/baklib/baklib-mcp-server/compare/v0.0.6...v0.1.0
[0.0.6]: https://github.com/baklib/baklib-mcp-server/releases/tag/v0.0.6

