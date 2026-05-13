# Baklib MCP Server - API 接口实现状态清单

本文档列出本仓库对照的 Baklib Open API 接口实现状态（与 [`lib/tools/index.js`](lib/tools/index.js) 注册的 MCP 工具一致）。

## 📊 状态说明

- ✅ **已实现**：已提供对应 MCP 工具，可通过 AI 助手调用
- ❌ **不实现**：根据项目范围与安全考虑，暂不提供 MCP 工具

---

## 1. 资源库（DAM - Digital Asset Management）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/dam/files` | POST | 上传文件到资源库 | `dam_upload_entity` | ✅ 已实现 | |
| `/dam/entities` | GET | 获取资源库列表 | `dam_list_entities` | ✅ 已实现 | |
| `/dam/entities/{entity_id}` | GET | 获取资源详情 | `dam_get_entity` | ✅ 已实现 | |
| `/dam/entities/{entity_id}` | DELETE | 删除资源 | `dam_delete_entity` | ✅ 已实现 | |
| `/dam/files/{entity_id}` | PATCH | 更新文件元数据 | `dam_update_entity` | ✅ 已实现 | |
| `/dam/entities/{entity_id}/urls` | POST | 获取带过期时间的资源 URL | `dam_create_entity_url` | ✅ 已实现 | |
| `/dam/fragments` | POST | 添加知识片段 | `dam_create_fragment` | ✅ 已实现 | `attributes.body_format=markdown` |
| `/dam/fragments/{entity_id}` | PATCH | 更新知识片段 | `dam_update_fragment` | ✅ 已实现 | 同上 |
| `/dam/links` | POST | 添加网址资源 | `dam_create_link` | ✅ 已实现 | |
| `/dam/links/{entity_id}` | PATCH | 更新网址资源 | `dam_update_link` | ✅ 已实现 | |
| `/dam/collections` | GET | 获取资源库集合列表 | `dam_list_collections` | ✅ 已实现 | |
| `/dam/collections/limits` | GET | 获取合集存储限额等 | `dam_get_collection_limits` | ✅ 已实现 | |

**实现进度**：12/12 (100%)

---

## 2. 知识库（KB - Knowledge Base）接口

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

**实现进度**：7/10 接口已实现 (70%)
- ✅ 已实现：7 个
- ❌ 不实现：3 个（知识库的创建/更新/删除出于安全考虑不实现）

---

## 3. 站点页面（Site Pages）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/sites/{site_id}/pages` | GET | 获取站点页面列表 | `site_list_pages` | ✅ 已实现 | |
| `/sites/{site_id}/pages` | POST | 创建站点页面 | `site_create_page` | ✅ 已实现 | |
| `/sites/{site_id}/pages/{page_id}` | GET | 获取页面详情 | `site_get_page` | ✅ 已实现 | |
| `/sites/{site_id}/pages/{page_id}` | PATCH | 更新页面 | `site_update_page` | ✅ 已实现 | |
| `/sites/{site_id}/pages/{page_id}` | DELETE | 删除页面 | `site_delete_page` | ✅ 已实现 | |

**实现进度**：5/5 接口已实现 (100%)

---

## 4. 站点标签（Site Tags）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/sites/{site_id}/tags` | GET | 获取站点标签列表 | `site_list_tags` | ✅ 已实现 | |
| `/sites/{site_id}/tags` | POST | 创建站点标签 | `site_create_tag` | ✅ 已实现 | |
| `/sites/{site_id}/tags/{tag_id}` | GET | 获取标签详情 | `site_get_tag` | ✅ 已实现 | |
| `/sites/{site_id}/tags/{tag_id}` | PATCH | 更新标签 | `site_update_tag` | ✅ 已实现 | |
| `/sites/{site_id}/tags/{tag_id}` | DELETE | 删除标签 | `site_delete_tag` | ✅ 已实现 | |

**实现进度**：5/5 接口已实现 (100%)

---

## 5. 站点管理（Site Management）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/sites` | GET | 获取站点列表 | `site_list_sites` | ✅ 已实现 | |
| `/sites/{site_id}` | GET | 获取站点详情 | `site_get_site` | ✅ 已实现 | |
| `/sites` | POST | 创建站点 | - | ❌ 不实现 | 不在当前范围 |
| `/sites/{site_id}` | PATCH | 更新站点 | - | ❌ 不实现 | 不在当前范围 |

**实现进度**：2/4 接口已实现 (50%)

---

## 6. 用户管理（User Management）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/users` | GET | 获取用户列表 | `user_list_users` | ✅ 已实现 | |
| `/user` | GET | 获取当前用户信息 | `user_get_current` | ✅ 已实现 | |
| `/users/{user_id}` | PUT | 更新用户数据 | - | ❌ 不实现 | 不在当前范围 |

**实现进度**：2/3 接口已实现 (66.7%)

---

## 7. 模板管理（Theme Management）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/themes` | GET | 获取模板列表 | `theme_list_themes` | ✅ 已实现 | |

**实现进度**：1/1 接口已实现 (100%)

---

## 8. 组织成员管理（Member Management）接口

| API 端点 | HTTP 方法 | 功能描述 | MCP 工具 | 状态 | 备注 |
|---------|----------|---------|---------|------|------|
| `/members` | GET | 获取成员列表 | `member_list_members` | ✅ 已实现 | |
| `/members/{member_id}` | GET | 获取成员详情 | `member_get_member` | ✅ 已实现 | |
| `/members` | POST | 添加成员 | - | ❌ 不实现 | 不在当前范围 |
| `/members/{member_id}` | PATCH | 更新成员 | - | ❌ 不实现 | 不在当前范围 |
| `/members/{member_id}/enable` | PUT | 启用成员 | - | ❌ 不实现 | 不在当前范围 |
| `/members/{member_id}/disable` | PUT | 禁用成员 | - | ❌ 不实现 | 不在当前范围 |

**实现进度**：2/6 接口已实现 (33.3%)

---

## 9. 其他接口（不在当前 MCP Server 范围内）

| API 端点 | HTTP 方法 | 功能描述 | 状态 | 备注 |
|---------|----------|---------|------|------|
| `/organizations/departments` | GET/POST/PATCH/DELETE | 部门管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/groups` | GET/POST/PATCH/DELETE | 团队管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/employees` | GET/POST/PATCH/DELETE | 雇员管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/position-types` | GET/POST/PATCH/DELETE | 职位类型管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/positions` | GET/POST/PATCH/DELETE | 职位管理 | ❌ 不实现 | 不在当前范围 |
| `/organizations/suppliers` | GET/POST/PATCH/DELETE | 供应商管理 | ❌ 不实现 | 不在当前范围 |
| `/users/{user_id}/bindings` | GET/POST/DELETE | 用户绑定第三方账号 | ❌ 不实现 | 不在当前范围 |

**实现进度**：0/7 接口已实现

---

## 10. 明确不纳入 MCP 的 Open API（本路线图）

以下路由存在于 Baklib 产品中，但**本仓库不实现**对应 MCP 工具；亦未计入上文各模块表格行数。

| 说明 | 备注 |
|------|------|
| `GET /kb/spaces/{space_id}/limits` | 知识库限额查询 |
| 站点页面 `smart_create`、draft、versions 等扩展接口 | 仅保留基础页面 CRUD（第 3 节） |

### 后续可选（未排期）

- **`GET /dam/tags`** 及 DAM 标签相关 CRUD：与打标流程强相关时再评估。

---

## 📊 总体统计

### 按模块统计（第 1–9 节表格）

| 模块 | 已实现 | 不实现 | 总计 | 实现率 |
|------|--------|--------|------|--------|
| 资源库（DAM） | 12 | 0 | 12 | 100% |
| 知识库（KB） | 7 | 3 | 10 | 70.0% |
| 站点页面 | 5 | 0 | 5 | 100% |
| 站点标签 | 5 | 0 | 5 | 100% |
| 站点管理 | 2 | 2 | 4 | 50.0% |
| 用户管理 | 2 | 1 | 3 | 66.7% |
| 模板管理 | 1 | 0 | 1 | 100% |
| 成员管理 | 2 | 4 | 6 | 33.3% |
| 其他模块 | 0 | 7 | 7 | 0% |
| **总计** | **36** | **17** | **53** | **67.9%** |

### 按状态统计

- ✅ **已实现**：36 个接口（对应 36 个 MCP 工具）
- ❌ **不实现**：17 个接口

### 已实现的 MCP 工具列表（36 个）

#### 资源库（DAM）- 12 个

1. `dam_upload_entity` - 上传文件到资源库
2. `dam_list_entities` - 获取资源库列表
3. `dam_get_entity` - 获取资源详情
4. `dam_update_entity` - 更新文件元数据
5. `dam_delete_entity` - 删除资源
6. `dam_create_fragment` - 添加知识片段
7. `dam_create_entity_url` - 获取带过期时间的资源 URL
8. `dam_update_fragment` - 更新知识片段
9. `dam_create_link` - 添加网址资源
10. `dam_update_link` - 更新网址资源
11. `dam_list_collections` - 获取资源库集合列表
12. `dam_get_collection_limits` - 获取合集存储限额

#### 知识库（KB）- 7 个

13. `kb_list_knowledge_bases` - 获取知识库列表
14. `kb_get_knowledge_base` - 获取知识库详情
15. `kb_list_articles` - 获取文章列表
16. `kb_create_article` - 创建文章
17. `kb_get_article` - 获取文章详情
18. `kb_update_article` - 更新文章
19. `kb_delete_article` - 删除文章

#### 站点页面 - 5 个

20. `site_list_pages` - 获取站点页面列表
21. `site_create_page` - 创建站点页面
22. `site_get_page` - 获取页面详情
23. `site_update_page` - 更新页面
24. `site_delete_page` - 删除页面

#### 站点标签 - 5 个

25. `site_list_tags` - 获取站点标签列表
26. `site_create_tag` - 创建站点标签
27. `site_get_tag` - 获取标签详情
28. `site_update_tag` - 更新标签
29. `site_delete_tag` - 删除标签

#### 站点管理 - 2 个

30. `site_list_sites` - 获取站点列表
31. `site_get_site` - 获取站点详情

#### 用户管理 - 2 个

32. `user_list_users` - 获取用户列表
33. `user_get_current` - 获取当前用户信息

#### 模板管理 - 1 个

34. `theme_list_themes` - 获取模板列表

#### 成员管理 - 2 个

35. `member_list_members` - 获取成员列表
36. `member_get_member` - 获取成员详情

---

## 📝 实现说明

### 已实现能力概览

1. **DAM**：文件与实体 CRUD、临时 URL、知识片段、网址链接、合集与限额查询均已接入 MCP。
2. **KB**：文章 CRUD 与知识库查询已接入；知识库创建/更新/删除不接入。
3. **站点**：页面与标签完整 CRUD（含标签 PATCH）；站点仅列表与详情查询。
4. **安全与范围**：成员/组织写操作、站点创建与更新、用户资料更新等不在 MCP 范围内。

### 不实现接口的原因

1. **安全和管理考虑**：知识库的创建/更新/删除。
2. **不在当前范围**：站点创建/更新、用户数据更新、成员写操作、组织类模块、用户第三方绑定等。
3. **明确排除**：见第 10 节（如 `kb/spaces/.../limits`、站点页面扩展路由）。

---

**最后更新**：2026-05-12  
**版本**：v0.6.0（以 `package.json` 为准）
