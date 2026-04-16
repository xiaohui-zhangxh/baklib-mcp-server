# Baklib MCP Server

Baklib MCP Server 是一个 Model Context Protocol (MCP) 服务器，让 AI 助手可以直接访问和操作 Baklib 的资源库和知识库。

## 📋 功能特性

### 资源库（DAM）
- 上传文件到资源库
- 查看文件信息
- 更新文件元数据
- 删除文件
- 搜索和浏览文件列表

### 知识库（KB）
- 创建文章
- 查看文章内容
- 更新文章
- 删除文章
- 搜索和浏览文章列表
- 查看知识库列表

## 🚀 快速开始

### 1. 安装配置

在 Cursor 的 `.cursor/mcp.json` 文件中添加以下配置：

```json
{
  "mcpServers": {
    "baklib-mcp-server": {
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

**配置说明（固定优先级读取：环境变量中的密钥/地址 > 工作区 `.config` > `~/.config/`）**：
- `BAKLIB_MCP_TOKEN`（必需）：你的 Baklib API 密钥对，格式为 `access_key:secret_key`
- `BAKLIB_MCP_API_BASE`（可选）：API 基础地址，默认为 `https://open.baklib.com/api/v1`
  - 私有化部署用户可配置为 `https://your-domain.com/api/v1`
- `BAKLIB_MCP_WORKSPACE`（可选）：工作区根目录的绝对路径。若设置，会优先从 `$BAKLIB_MCP_WORKSPACE/.config/` 读取上述两项（文件内为纯文本）。在支持变量展开的 MCP 配置里可写为 `"BAKLIB_MCP_WORKSPACE": "${workspaceFolder}"`，由编辑器在启动子进程前展开为真实路径。

将配置写入以下位置（文件内容就是变量值本身，建议末尾保留换行）：
- 若已设置 `BAKLIB_MCP_WORKSPACE`：`$BAKLIB_MCP_WORKSPACE/.config/BAKLIB_MCP_TOKEN`（及可选的 `BAKLIB_MCP_API_BASE`）
- 否则：`~/.config/BAKLIB_MCP_TOKEN`
- 可选：`~/.config/BAKLIB_MCP_API_BASE`

**可选：通过 Cursor Skill 协助安装与使用**  
若希望对话中的 AI 按固定指引使用 Baklib MCP 与 BKE Markdown 相关能力，可从 [Baklib AI Skills](https://github.com/baklib-tools/skills) 安装技能（存放约定与更多技能见该仓库说明）：

```bash
npx skills add baklib-tools/skills --skill baklib-mcp --skill baklib-bke-markdown
```

也可手动将仓库内对应技能目录拷贝到你项目中的 Cursor 技能目录（常见为 `.cursor/skills/`）。具体以 [baklib-tools/skills](https://github.com/baklib-tools/skills) 文档为准。

### 2. 获取 API Token

1. 登录 Baklib 后台
2. 进入 **个人中心** → **API 密钥对**
3. 创建新的 API 密钥对
4. 复制 `access_key:secret_key` 格式的 token，替换配置中的 `your-api-token-here`

### 3. 重启 Cursor

配置完成后，重启 Cursor 使配置生效。

### 常见问题：`npx` 报 `sh: baklib-mcp-server: command not found`

若 **工作区就是本仓库根目录**（或用终端在本仓库里跑 `npx -y @baklib/baklib-mcp-server`），npm 会按本地包解析，但根目录的 `npm install` 有时不会生成 `node_modules/.bin/baklib-mcp-server`，会导致上述错误。**先在本仓库执行一次 `npm install`**（会运行 `postinstall` 补全链接）。若仍失败，可在 MCP 里改用 `"command": "node"`、`"args": ["${workspaceFolder}/index.js"]`（路径以你本机为准），或从任意**非本仓库**目录执行 `npx`。

## 💬 使用示例

配置完成后，你可以直接通过自然语言与 AI 助手对话，使用 Baklib 的功能。以下是一些示例：

### 资源库操作

**上传文件**
```
请帮我把 /path/to/image.jpg 上传到 Baklib 资源库
```

```
上传这个文件到资源库：/Users/me/document.pdf
```

**查看文件信息**
```
查看资源库中 ID 为 123456 的文件信息
```

**更新文件信息**
```
把资源库中 ID 为 123456 的文件名称改为"产品介绍.pdf"，描述改为"2025年产品介绍文档"
```

**搜索文件**
```
在资源库中搜索名称包含"产品"的文件
```

```
列出资源库中所有图片类型的文件，每页显示 20 个
```

**删除文件**
```
删除资源库中 ID 为 123456 的文件
```

### 知识库操作

**查看知识库列表**
```
列出我所有的知识库
```

```
显示我的知识库列表，每页 10 个
```

**查看知识库详情**
```
查看 ID 为 405 的知识库详情
```

**创建文章**
```
在知识库 405 中创建一篇文章，标题是"使用指南"，内容是"这是使用指南的内容..."
```

```
在知识库 405 中创建一篇标题为"快速开始"的文章，内容使用 Markdown 格式
```

**查看文章**
```
查看知识库 405 中 ID 为 212916 的文章内容
```

**更新文章**
```
更新知识库 405 中 ID 为 212916 的文章，把标题改为"新标题"，内容改为"新内容..."
```

**搜索文章**
```
在知识库 405 中搜索包含"API"的文章
```

```
列出知识库 405 中所有文章，每页 10 个
```

**创建子文章**
```
在知识库 405 中，在 ID 为 212916 的文章下创建一篇子文章，标题是"详细说明"
```

**删除文章**
```
删除知识库 405 中 ID 为 212916 的文章
```

### 组合操作示例

**上传图片并创建文章**
```
先上传 /path/to/image.jpg 到资源库，然后在知识库 405 中创建一篇文章，标题是"产品介绍"，内容中包含刚才上传的图片
```

**批量操作**
```
列出知识库 405 中的所有文章，然后更新每篇文章的标题，在前面加上"[2025]"
```

## ⚠️ 注意事项

1. **Token 格式**：Token 格式为 `access_key:secret_key`，不需要 `Bearer` 前缀
2. **知识库 ID**：知识库在 API 中称为 "spaces"，使用 `space_id` 参数
3. **文件大小**：注意 Baklib API 的文件大小限制
4. **权限**：确保你的 API Token 有相应的操作权限

## 📚 相关链接

- [Baklib API 文档](https://dev.baklib.cn/api)
- [npm 包页面](https://www.npmjs.com/package/@baklib/baklib-mcp-server)
- [GitHub 仓库](https://github.com/baklib/baklib-mcp-server)
- [开发者文档](./DEVELOPER.md) - 如需参与开发或了解更多技术细节

## 📝 更新日志

### v0.5.2 (2026-04-16)

- **依赖**：移除 `node-fetch`，使用 Node 18+ 内置 `fetch`，消除安装时的 `node-domexception` 弃用告警

详细变更请查看 [CHANGELOG.md](./CHANGELOG.md)

### v0.5.1 (2026-04-16)

- **修复**：在本仓库根目录使用 `npx @baklib/baklib-mcp-server` 时可能报 `baklib-mcp-server: command not found`；`npm install` 后由 `postinstall` 补全 `node_modules/.bin` 链接

详细变更请查看 [CHANGELOG.md](./CHANGELOG.md)

### v0.5.0 (2026-04-16)

- **BKE**：默认查询合并 `body_format=markdown`（`bke-api-defaults`）
- **KB**：创建/更新文章使用 `body_type=markdown`，与 BKE 约定一致
- **站点 / DAM**：说明与行为对齐 Markdown 读写语义；`dam_upload_entity` 返回含 `iid`
- **调试**：`BAKLIB_MCP_TRACE` 可选请求追踪；API 客户端响应解析增强

详细变更请查看 [CHANGELOG.md](./CHANGELOG.md)

### v0.4.0 (2026-04-09)

- **配置**：支持 `BAKLIB_MCP_WORKSPACE`，可从项目目录下 `.config/` 读取 token（例如在 MCP 中设置 `"BAKLIB_MCP_WORKSPACE": "${workspaceFolder}"`）
- **调试**：`BAKLIB_MCP_DEBUG=1` 可输出配置解析过程（不含密钥）

详细变更请查看 [CHANGELOG.md](./CHANGELOG.md)

### v0.3.0 (2026-04-09)

- **DAM**：`dam_get_entity` 支持 `include_signed_id`、`purpose` 查询参数，便于动态表单与富文本等场景获取 `signed_id`

详细变更请查看 [CHANGELOG.md](./CHANGELOG.md)

### v0.1.0 (2025-12-15)

#### 🎉 重大更新
- **新增 18 个 API 工具**，大幅扩展功能覆盖范围
- **代码架构重构**，将工具函数模块化，提高代码可维护性

#### ✨ 新增功能
- **站点管理**：站点页面和标签的完整 CRUD 操作，站点信息查询
- **用户和成员管理**：用户列表、当前用户信息、成员信息查询
- **主题管理**：模板主题列表查询
- **第三方集成**：集成列表和详情查询

#### 🔧 改进
- 代码架构优化，每个工具函数独立为单独文件
- 统一工具导出机制，更好的代码组织结构

详细变更请查看 [CHANGELOG.md](./CHANGELOG.md)

### v0.0.6 (2025-12-15)
- 初始版本发布
- 支持资源库完整功能（上传、查询、更新、删除文件）
- 支持知识库完整功能（创建、查询、更新、删除文章，获取知识库列表）
- 支持分页和筛选
- 自动 MIME 类型检测

---

**版本**：0.5.2  
**最后更新**：2026-04-16
