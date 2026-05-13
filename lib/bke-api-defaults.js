/**
 * BKE / 富文本：与 Baklib `Api::BodyFormatParam`（`params[:body_format]`）对齐。
 *
 * - **body_format**（URL 查询参数）：`markdown` 时序列化器把正文/片段/template_variables
 *   等富文本按 BKE Markdown 输出；站点页面 POST/PATCH 时同一 query 表示 **template_variables 里富文本的输入格式**
 *  （见 `Api::Sites::PagesController`）。
 * - **body_format**（知识库文章 JSON:API **attributes**）：`markdown` / `html`，表示本次提交的 `body`
 *   是 BKE Markdown 还是 HTML（`Api::Kb::ArticlesController#article_params`）。对外文档与集成统一使用此名（与 query 一致）。
 *
 * MCP：请求 URL 合并本对象的 **body_format**；KB 创建/更新在 JSON attributes 里写 **body_format**（与 Baklib 主仓一致）。
 */

/** 查询参数：`body_format=markdown` */
export const RESPONSE_MARKDOWN_QUERY = { body_format: 'markdown' };

export function mergeResponseMarkdownQuery(query = {}) {
  return { ...query, ...RESPONSE_MARKDOWN_QUERY };
}
