/**
 * Member List Members Tool
 * 
 * List organization members with optional pagination.
 * API: GET /members
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'member_list_members',
  description: 'List organization members with optional pagination.',
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
  
  const result = await makeApiRequest('/members', 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

