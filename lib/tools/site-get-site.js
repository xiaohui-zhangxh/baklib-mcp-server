/**
 * Site Get Site Tool
 * 
 * Get site (organization) details by ID.
 * API: GET /sites/{site_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_get_site',
  description: 'Get site (organization) details by ID.',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID to retrieve.',
      },
    },
    required: ['site_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { site_id } = args || {};
  if (!site_id) {
    throw new Error('site_id is required');
  }
  
  const result = await makeApiRequest(`/sites/${site_id}`, 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

