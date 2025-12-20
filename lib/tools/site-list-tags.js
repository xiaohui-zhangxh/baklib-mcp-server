/**
 * Site List Tags Tool
 * 
 * List tags in a Baklib site with optional pagination.
 * API: GET /sites/{site_id}/tags
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_list_tags',
  description: 'List tags in a Baklib site with optional pagination.',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID to list tags from.',
      },
      page: {
        type: 'number',
        description: 'Page number for pagination.',
      },
      per_page: {
        type: 'number',
        description: 'Number of items per page.',
      },
    },
    required: ['site_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { site_id, page, per_page } = args || {};
  if (!site_id) {
    throw new Error('site_id is required');
  }
  
  const query = {};
  if (page) query['page[number]'] = page;
  if (per_page) query['page[size]'] = per_page;
  
  const result = await makeApiRequest(`/sites/${site_id}/tags`, 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

