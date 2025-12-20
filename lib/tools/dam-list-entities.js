/**
 * DAM List Entities Tool
 * 
 * List files in Baklib DAM system with optional filtering and pagination.
 * API: GET /dam/entities
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'dam_list_entities',
  description: 'List files in Baklib DAM system with optional filtering and pagination.',
  inputSchema: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        description: 'Page number for pagination.',
      },
      per_page: {
        type: 'number',
        description: 'Number of items per page.',
      },
      type: {
        type: 'string',
        description: 'Filter by resource type (e.g., "link", "file", etc.).',
      },
      name: {
        type: 'string',
        description: 'Filter by resource name.',
      },
      deleted: {
        type: 'boolean',
        description: 'Filter by deleted status.',
      },
    },
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { page, per_page, type, name, deleted } = args || {};
  
  const query = {};
  if (page) query['page[number]'] = page;
  if (per_page) query['page[size]'] = per_page;
  if (type) query.type = type;
  if (name) query.name = name;
  if (deleted !== undefined) query.deleted = deleted;
  
  const result = await makeApiRequest('/dam/entities', 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

