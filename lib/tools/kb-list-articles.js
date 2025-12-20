/**
 * KB List Articles Tool
 * 
 * List articles in a Baklib knowledge base with optional filtering and pagination.
 * API: GET /kb/spaces/{space_id}/articles
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'kb_list_articles',
  description: 'List articles in a Baklib knowledge base with optional filtering and pagination.',
  inputSchema: {
    type: 'object',
    properties: {
      space_id: {
        type: 'string',
        description: 'Knowledge base (space) ID to list articles from.',
      },
      page: {
        type: 'number',
        description: 'Page number for pagination.',
      },
      per_page: {
        type: 'number',
        description: 'Number of items per page.',
      },
      keywords: {
        type: 'string',
        description: 'Search keywords to filter articles.',
      },
      parent_id: {
        type: 'string',
        description: 'Filter by parent article ID (to get sub-articles).',
      },
    },
    required: ['space_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { space_id, page, per_page, keywords, parent_id } = args || {};
  if (!space_id) {
    throw new Error('space_id is required');
  }
  
  const query = {};
  if (page) query['page[number]'] = page;
  if (per_page) query['page[size]'] = per_page;
  if (keywords) query.keywords = keywords;
  if (parent_id) query.parent_id = parent_id;
  
  const result = await makeApiRequest(`/kb/spaces/${space_id}/articles`, 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

