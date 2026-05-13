/**
 * DAM Update Fragment Tool
 *
 * API: PATCH /dam/fragments/{entity_id}
 */

import { expandDamIdImageMarkdown } from '../dam-markdown-resolve.js';
import { makeApiRequest } from '../api-client.js';
import { mergeResponseMarkdownQuery } from '../bke-api-defaults.js';

export const toolDefinition = {
  name: 'dam_update_fragment',
  description:
    'Update a DAM knowledge fragment. When updating `body` as BKE Markdown, set JSON attribute `body_format` to `markdown` (server parses like KB articles). URL query `body_format=markdown` only affects response shape.',
  inputSchema: {
    type: 'object',
    properties: {
      entity_id: {
        type: 'string',
        description: 'Fragment entity id.',
      },
      name: {
        type: 'string',
        description: 'Fragment name.',
      },
      description: {
        type: 'string',
        description: 'Short description.',
      },
      body: {
        type: 'string',
        description: 'Fragment body (BKE Markdown).',
      },
      body_format: {
        type: 'string',
        enum: ['markdown', 'html'],
        description:
          'When `body` is present: use `markdown` for BKE Markdown (default), or `html` for raw BKE HTML.',
      },
      collection_ids: {
        type: 'array',
        items: { type: 'number' },
        description: 'Optional collection database ids (replaces when provided).',
      },
      tag_ids: {
        type: 'array',
        items: { type: 'number' },
        description: 'Optional tag database ids (replaces when provided).',
      },
    },
    required: ['entity_id'],
  },
};

export async function handleTool(args) {
  const { entity_id, name, description, body, body_format, collection_ids, tag_ids } = args || {};
  if (!entity_id) {
    throw new Error('entity_id is required');
  }
  const attributes = {};
  if (name != null) attributes.name = name;
  if (description != null) attributes.description = description;
  if (body != null) {
    const fmt = (body_format || 'markdown').toString().toLowerCase();
    if (fmt !== 'markdown' && fmt !== 'html') {
      throw new Error('body_format must be markdown or html');
    }
    let bodyStr = String(body);
    if (fmt === 'markdown') {
      bodyStr = await expandDamIdImageMarkdown(bodyStr);
    }
    attributes.body = bodyStr;
    attributes.body_format = fmt;
  }
  if (collection_ids != null) attributes.collection_ids = collection_ids;
  if (tag_ids != null) attributes.tag_ids = tag_ids;

  if (Object.keys(attributes).length === 0) {
    throw new Error('At least one of name, description, body, collection_ids, tag_ids is required');
  }

  const requestBody = {
    data: {
      type: 'dam_entities',
      attributes,
    },
  };

  const result = await makeApiRequest(`/dam/fragments/${encodeURIComponent(entity_id)}`, 'PATCH', {
    body: requestBody,
    query: mergeResponseMarkdownQuery(),
  });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}
