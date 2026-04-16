/**
 * BKE / 富文本 API 约定：与 Baklib `Api::BodyFormatParam` 对齐。
 * MCP 侧统一用 Markdown 与模型交互（读取为 markdown，写入知识库正文为 markdown）。
 */

/** 附加到 GET/PATCH/POST 的 query，使响应中 body、fragment body、template_variables 等按 Markdown 序列化 */
export const RESPONSE_MARKDOWN_QUERY = { body_format: 'markdown' };

export function mergeResponseMarkdownQuery(query = {}) {
  return { ...query, ...RESPONSE_MARKDOWN_QUERY };
}
