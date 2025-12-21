/**
 * User Get Current Tool
 * 
 * Get current user information.
 * API: GET /user
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'user_get_current',
  description: 'Get current user information.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const result = await makeApiRequest('/user', 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

