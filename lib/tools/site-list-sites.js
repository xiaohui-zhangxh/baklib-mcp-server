/**
 * Site List Sites Tool
 * 
 * List all sites (organizations) accessible by the user.
 * API: GET /sites
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_list_sites',
  description: 'List all sites (organizations) accessible by the user with optional pagination.',
  inputSchema: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        description: 'Page number for pagination.',
      },
      per_page: {
        type: 'number',
        description: 'Number of items per page (default: 10, max: 50).',
      },
    },
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { page, per_page } = args || {};
  
  const query = {};
  if (page) query['page[number]'] = page;
  if (per_page) query['page[size]'] = per_page;
  
  const result = await makeApiRequest('/sites', 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

