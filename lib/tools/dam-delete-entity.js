/**
 * DAM Delete Entity Tool
 * 
 * Delete a file from Baklib DAM system.
 * API: DELETE /dam/entities/{entity_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'dam_delete_entity',
  description: 'Delete a file from Baklib DAM system.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'File ID to delete.',
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
  
  await makeApiRequest(`/dam/entities/${id}`, 'DELETE');
  return { success: true };
}

