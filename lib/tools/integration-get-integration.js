/**
 * Integration Get Integration Tool
 * 
 * Get integration record details by ID.
 * API: GET /integrations/{integration_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'integration_get_integration',
  description: 'Get integration record details by ID.',
  inputSchema: {
    type: 'object',
    properties: {
      integration_id: {
        type: 'string',
        description: 'Integration record ID to retrieve.',
      },
    },
    required: ['integration_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { integration_id } = args || {};
  if (!integration_id) {
    throw new Error('integration_id is required');
  }
  
  const result = await makeApiRequest(`/integrations/${integration_id}`, 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

