/**
 * KB Get Knowledge Base Tool
 * 
 * Get knowledge base (space) details by ID.
 * API: GET /kb/spaces/{space_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'kb_get_knowledge_base',
  description: 'Get knowledge base (space) details by ID.',
  inputSchema: {
    type: 'object',
    properties: {
      space_id: {
        type: 'string',
        description: 'Knowledge base (space) ID to retrieve.',
      },
    },
    required: ['space_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { space_id } = args || {};
  if (!space_id) {
    throw new Error('space_id is required');
  }
  
  const result = await makeApiRequest(`/kb/spaces/${space_id}`, 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

