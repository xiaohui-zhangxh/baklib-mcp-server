/**
 * Site Delete Tag Tool
 * 
 * Delete a tag from a Baklib site.
 * API: DELETE /sites/{site_id}/tags/{tag_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_delete_tag',
  description: 'Delete a tag from a Baklib site.',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID.',
      },
      tag_id: {
        type: 'string',
        description: 'Tag ID to delete.',
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
  
  await makeApiRequest(`/sites/${site_id}/tags/${tag_id}`, 'DELETE', { query });
  return { success: true };
}

