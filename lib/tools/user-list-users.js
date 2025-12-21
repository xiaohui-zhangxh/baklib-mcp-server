/**
 * User List Users Tool
 * 
 * List all users in the organization with optional pagination.
 * API: GET /users
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'user_list_users',
  description: 'List all users in the organization with optional pagination.',
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
  
  const result = await makeApiRequest('/users', 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

