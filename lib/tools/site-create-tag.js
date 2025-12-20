/**
 * Site Create Tag Tool
 * 
 * Create a new tag in a Baklib site.
 * API: POST /sites/{site_id}/tags
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_create_tag',
  description: 'Create a new tag in a Baklib site.',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID where the tag will be created.',
      },
      name: {
        type: 'string',
        description: 'Tag name (required).',
      },
      bg_color: {
        type: 'string',
        description: 'Tag background color (optional, e.g., "#FF0000").',
      },
    },
    required: ['site_id', 'name'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { site_id, name, bg_color } = args || {};
  if (!site_id || !name) {
    throw new Error('site_id and name are required');
  }
  
  const attributes = { name };
  if (bg_color) attributes.bg_color = bg_color;
  
  const body = {
    data: {
      attributes: attributes,
    },
  };
  
  const result = await makeApiRequest(`/sites/${site_id}/tags`, 'POST', { body });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

