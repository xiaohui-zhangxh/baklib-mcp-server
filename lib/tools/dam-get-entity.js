/**
 * DAM Get Entity Tool
 * 
 * Get file information from Baklib DAM system by ID.
 * API: GET /dam/entities/{entity_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'dam_get_entity',
  description: 'Get file information from Baklib DAM system by ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'File ID (signed_id) to retrieve.',
      },
    },
    required: ['id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { id } = args || {};
  if (!id) {
    throw new Error('id is required');
  }
  
  const result = await makeApiRequest(`/dam/entities/${id}`, 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

