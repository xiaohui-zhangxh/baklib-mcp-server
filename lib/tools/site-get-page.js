/**
 * Site Get Page Tool
 * 
 * Get page details from a Baklib site by site ID and page ID.
 * API: GET /sites/{site_id}/pages/{page_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_get_page',
  description: 'Get page details from a Baklib site by site ID and page ID.',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID.',
      },
      page_id: {
        type: 'string',
        description: 'Page ID to retrieve.',
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
  const { site_id, page_id, full_path } = args || {};
  if (!site_id || !page_id) {
    throw new Error('site_id and page_id are required');
  }
  
  const query = {};
  if (full_path) query.full_path = full_path;
  
  const result = await makeApiRequest(`/sites/${site_id}/pages/${page_id}`, 'GET', { query });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

