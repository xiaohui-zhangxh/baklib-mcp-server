/**
 * Member Get Member Tool
 * 
 * Get organization member details by ID.
 * API: GET /members/{member_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'member_get_member',
  description: 'Get organization member details by ID.',
  inputSchema: {
    type: 'object',
    properties: {
      member_id: {
        type: 'string',
        description: 'Member ID to retrieve.',
      },
    },
    required: ['member_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { member_id } = args || {};
  if (!member_id) {
    throw new Error('member_id is required');
  }
  
  const result = await makeApiRequest(`/members/${member_id}`, 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

