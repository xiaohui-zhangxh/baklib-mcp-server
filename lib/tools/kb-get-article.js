/**
 * KB Get Article Tool
 * 
 * Get article details from a Baklib knowledge base by space ID and article ID.
 * API: GET /kb/spaces/{space_id}/articles/{article_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'kb_get_article',
  description: 'Get article details from a Baklib knowledge base by space ID and article ID.',
  inputSchema: {
    type: 'object',
    properties: {
      space_id: {
        type: 'string',
        description: 'Knowledge base (space) ID.',
      },
      article_id: {
        type: 'string',
        description: 'Article ID to retrieve.',
      },
    },
    required: ['space_id', 'article_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { space_id, article_id } = args || {};
  if (!space_id || !article_id) {
    throw new Error('space_id and article_id are required');
  }
  
  const result = await makeApiRequest(`/kb/spaces/${space_id}/articles/${article_id}`, 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

