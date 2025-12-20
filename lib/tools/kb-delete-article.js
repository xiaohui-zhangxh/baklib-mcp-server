/**
 * KB Delete Article Tool
 * 
 * Delete an article from a Baklib knowledge base.
 * API: DELETE /kb/spaces/{space_id}/articles/{article_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'kb_delete_article',
  description: 'Delete an article from a Baklib knowledge base.',
  inputSchema: {
    type: 'object',
    properties: {
      space_id: {
        type: 'string',
        description: 'Knowledge base (space) ID.',
      },
      article_id: {
        type: 'string',
        description: 'Article ID to delete.',
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
  
  await makeApiRequest(`/kb/spaces/${space_id}/articles/${article_id}`, 'DELETE');
  return { success: true };
}

