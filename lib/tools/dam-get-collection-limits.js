/**
 * DAM Get Collection Limits Tool
 *
 * API: GET /dam/collections/limits
 */

import { makeApiRequest } from '../api-client.js';

export const toolDefinition = {
  name: 'dam_get_collection_limits',
  description:
    'Get DAM collection tier limits for the organization (max_count, max_depth, current_count, current_max_depth).',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleTool() {
  const result = await makeApiRequest('/dam/collections/limits', 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}
