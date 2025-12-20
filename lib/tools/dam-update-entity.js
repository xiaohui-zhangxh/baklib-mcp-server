/**
 * DAM Update Entity Tool
 * 
 * Update file metadata (name, description) in Baklib DAM system.
 * API: PATCH /dam/files/{entity_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'dam_update_entity',
  description: 'Update file metadata (name, description) in Baklib DAM system.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'File ID to update.',
      },
      name: {
        type: 'string',
        description: 'New file name.',
      },
      description: {
        type: 'string',
        description: 'File description.',
      },
    },
    required: ['id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { id, name, description } = args || {};
  if (!id) {
    throw new Error('id is required');
  }
  
  const attributes = {};
  if (name) attributes.name = name;
  if (description) attributes.description = description;
  
  const body = {
    data: {
      type: 'dam_files',
      id: id,
      attributes: attributes,
    },
  };
  
  const result = await makeApiRequest(`/dam/files/${id}`, 'PATCH', { body });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

