/**
 * Theme List Themes Tool
 * 
 * List templates (themes) including organization templates and public templates.
 * API: GET /themes
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'theme_list_themes',
  description: 'List templates (themes) including organization templates and public templates with optional filtering and pagination.',
  inputSchema: {
    type: 'object',
    properties: {
      from: {
        type: 'string',
        description: 'Template source: "org" for organization templates, "public" for public templates.',
        enum: ['org', 'public'],
      },
      scope: {
        type: 'string',
        description: 'Template application type: "cms" or "wiki".',
        enum: ['cms', 'wiki'],
      },
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
  const { from, scope, page, per_page } = args || {};
  
  const query = {};
  if (from) query.from = from;
  if (scope) query.scope = scope;
  if (page) query['page[number]'] = page;
  if (per_page) query['page[size]'] = per_page;
  
  const result = await makeApiRequest('/themes', 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

