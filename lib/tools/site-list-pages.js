/**
 * Site List Pages Tool
 * 
 * List pages in a Baklib site with optional filtering and pagination.
 * API: GET /sites/{site_id}/pages
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_list_pages',
  description: 'List pages in a Baklib site with optional filtering and pagination.',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID to list pages from.',
      },
      page: {
        type: 'number',
        description: 'Page number for pagination.',
      },
      per_page: {
        type: 'number',
        description: 'Number of items per page.',
      },
      parent_id: {
        type: 'string',
        description: 'Filter by parent page ID.',
      },
      deleted: {
        type: 'boolean',
        description: 'Filter by deleted status.',
      },
      published: {
        type: 'boolean',
        description: 'Filter by published status.',
      },
      keywords: {
        type: 'string',
        description: 'Search keywords to filter pages.',
      },
      tags: {
        type: 'string',
        description: 'Filter by tags.',
      },
    },
    required: ['site_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { site_id, page, per_page, parent_id, deleted, published, keywords, tags } = args || {};
  if (!site_id) {
    throw new Error('site_id is required');
  }
  
  const query = {};
  if (page) query['page[number]'] = page;
  if (per_page) query['page[size]'] = per_page;
  if (parent_id) query.parent_id = parent_id;
  if (deleted !== undefined) query.deleted = deleted;
  if (published !== undefined) query.published = published;
  if (keywords) query.keywords = keywords;
  if (tags) query.tags = tags;
  
  const result = await makeApiRequest(`/sites/${site_id}/pages`, 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

