/**
 * Site Update Tag Tool
 *
 * API: PATCH /sites/{site_id}/tags/{tag_id}
 */

import { makeApiRequest } from '../api-client.js';

export const toolDefinition = {
  name: 'site_update_tag',
  description:
    'Update a site tag name and/or background color. Reference tags (ref_id set) cannot be updated per server rules.',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID.',
      },
      tag_id: {
        type: 'string',
        description: 'Tag id (same as other site tag tools).',
      },
      name: {
        type: 'string',
        description: 'New tag name.',
      },
      bg_color: {
        type: 'string',
        description: 'New background color (e.g. #00FF00).',
      },
    },
    required: ['site_id', 'tag_id'],
  },
};

export async function handleTool(args) {
  const { site_id, tag_id, name, bg_color } = args || {};
  if (!site_id || !tag_id) {
    throw new Error('site_id and tag_id are required');
  }
  const attributes = {};
  if (name !== undefined) attributes.name = name;
  if (bg_color !== undefined) attributes.bg_color = bg_color;
  if (Object.keys(attributes).length === 0) {
    throw new Error('At least one of name or bg_color is required');
  }

  const body = {
    data: {
      attributes,
    },
  };

  const result = await makeApiRequest(`/sites/${site_id}/tags/${encodeURIComponent(tag_id)}`, 'PATCH', { body });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}
