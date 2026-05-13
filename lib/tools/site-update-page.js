/**
 * Site Update Page Tool
 *
 * Update a page in a Baklib site.
 * API: PATCH /sites/{site_id}/pages/{page_id}
 */

import { expandDamIdImageMarkdownDeep } from '../dam-markdown-resolve.js';
import { makeApiRequest } from '../api-client.js';
import { mergeResponseMarkdownQuery } from '../bke-api-defaults.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_update_page',
  description:
    'Update a page in a Baklib site. Pass all dynamic fields in `template_variables` only. Use query `body_format=markdown` for Markdown in/out on richtext template_variables (Api::BodyFormatParam).',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID.',
      },
      page_id: {
        type: 'string',
        description: 'Page ID to update.',
      },
      name: {
        type: 'string',
        description: 'New page title.',
      },
      template_variables: {
        type: 'object',
        description: 'Template variables. All page dynamic content lives here; use BKE Markdown for richtext values. DAM images: `![alt](dam-id=<iid>)` in string values after upload.',
      },
      published: {
        type: 'boolean',
        description: 'Published status.',
      },
      position: {
        type: 'number',
        description: 'Sort order value.',
      },
      full_path: {
        type: 'string',
        description: 'Optional: Use full path instead of page_id.',
      },
    },
    required: ['site_id', 'page_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { site_id, page_id, name, template_variables, published, position, full_path } = args || {};
  if (!site_id || !page_id) {
    throw new Error('site_id and page_id are required');
  }
  const attributes = {};
  if (name) attributes.name = name;
  if (template_variables) {
    attributes.template_variables = await expandDamIdImageMarkdownDeep(structuredClone(template_variables));
  }
  if (published !== undefined) attributes.published = published;
  if (position !== undefined) attributes.position = position;

  const query = mergeResponseMarkdownQuery();
  if (full_path) query.full_path = full_path;

  const body = {
    data: {
      attributes: attributes,
    },
  };

  const result = await makeApiRequest(`/sites/${site_id}/pages/${page_id}`, 'PATCH', { body, query });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}
