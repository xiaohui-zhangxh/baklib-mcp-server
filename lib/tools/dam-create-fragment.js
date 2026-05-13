/**
 * DAM Create Fragment Tool
 *
 * Create a text knowledge fragment (知识片段) in Baklib DAM.
 * API: POST /dam/fragments
 */

import { expandDamIdImageMarkdown } from '../dam-markdown-resolve.js';
import { makeApiRequest } from '../api-client.js';
import { mergeResponseMarkdownQuery } from '../bke-api-defaults.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'dam_create_fragment',
  description:
    'Create a text knowledge fragment (知识片段) in Baklib DAM. JSON:API `attributes` must include `body_format: "markdown"` when `body` is BKE Markdown. Server parses with `FragmentValue.from_markdown` (DAM 路径禁用知识库专用的首行「文档标题」节点；首行 `#` 为普通 h1). Query `body_format=markdown` only affects API response serialization. DAM images: after `dam_upload_entity`, use `![alt](dam-id=<iid>)` where **iid** is `attributes.iid` (not JSON:API `data.id`). Embed another fragment as a block: HTML comment pair `bke:fragment` with `dam-id="<iid>"` (see baklib `lib/bke_editor/kramdown/fragment.rb`); `[label](dam-id:1376)` is only a plain link, not an embed.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Fragment display name / title.',
      },
      body: {
        type: 'string',
        description: 'Fragment content as BKE Markdown.',
      },
      body_format: {
        type: 'string',
        enum: ['markdown', 'html'],
        description:
          'Must be `markdown` when body is BKE Markdown (server parses like KB articles). Use `html` only if body is already BKE HTML. Default applied by MCP: `markdown` whenever body is sent.',
      },
      description: {
        type: 'string',
        description: 'Optional short description.',
      },
    },
    required: ['name', 'body'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { name, body, description, body_format } = args || {};
  if (!name || !body) {
    throw new Error('name and body are required');
  }

  const fmt = (body_format || 'markdown').toString().toLowerCase();
  if (fmt !== 'markdown' && fmt !== 'html') {
    throw new Error('body_format must be markdown or html');
  }
  let bodyStr = String(body);
  if (fmt === 'markdown') {
    bodyStr = await expandDamIdImageMarkdown(bodyStr);
  }
  const attributes = {
    name: String(name).trim(),
    body: bodyStr,
    body_format: fmt,
  };
  if (description != null && String(description).trim() !== '') {
    attributes.description = String(description).trim();
  }

  const requestBody = {
    data: {
      type: 'dam_fragments',
      attributes,
    },
  };

  const result = await makeApiRequest('/dam/fragments', 'POST', {
    body: requestBody,
    query: mergeResponseMarkdownQuery(),
  });

  const attrs = result.data?.attributes;
  const iid = attrs?.iid;

  return {
    success: true,
    id: result.data?.id,
    iid,
    data: result.data,
    full_response: result,
  };
}
