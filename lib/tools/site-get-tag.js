/**
 * Site Get Tag Tool
 * 
 * Get tag details from a Baklib site by site ID and tag ID.
 * API: GET /sites/{site_id}/tags/{tag_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_get_tag',
  description: 'Get tag details from a Baklib site by site ID and tag ID.',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID.',
      },
      tag_id: {
        type: 'string',
        description: 'Tag ID to retrieve.',
      },
      name: {
        type: 'string',
        description: 'Optional: Use tag name instead of tag_id.',
      },
    },
    required: ['site_id', 'tag_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { site_id, tag_id, name } = args || {};
  if (!site_id || !tag_id) {
    throw new Error('site_id and tag_id are required');
  }
  
  const query = {};
  if (name) query.name = name;
  
  const result = await makeApiRequest(`/sites/${site_id}/tags/${tag_id}`, 'GET', { query });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

