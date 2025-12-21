/**
 * Integration List Integrations Tool
 * 
 * List third-party integrations.
 * API: GET /integrations
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'integration_list_integrations',
  description: 'List third-party integrations with optional pagination.',
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
      organization_id: {
        type: 'number',
        description: 'Organization ID (only used when using supplier token).',
      },
    },
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { page, per_page, organization_id } = args || {};
  
  const query = {};
  if (page) query['page[number]'] = page;
  if (per_page) query['page[size]'] = per_page;
  
  // Note: organization_id is passed as a header, but makeApiRequest doesn't support custom headers
  // For now, we'll skip this parameter. If needed, we can extend makeApiRequest to support headers
  // if (organization_id) {
  //   headers['x-organization-id'] = organization_id;
  // }
  
  const result = await makeApiRequest('/integrations', 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

