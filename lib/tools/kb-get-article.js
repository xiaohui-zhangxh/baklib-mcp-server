/**
 * KB Get Article Tool
 * 
 * Get article details from a Baklib knowledge base by space ID and article ID.
 * API: GET /kb/spaces/{space_id}/articles/{article_id}
 */

import { makeApiRequest } from '../api-client.js';
import { mergeResponseMarkdownQuery } from '../bke-api-defaults.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'kb_get_article',
  description:
    'Get a knowledge base article by space ID and article ID.',
  inputSchema: {
    type: 'object',
    description:
      'Requests the article with `body_format=markdown`. The returned `attributes.body` is BKE Markdown.',
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
  
  const result = await makeApiRequest(`/kb/spaces/${space_id}/articles/${article_id}`, 'GET', {
    query: mergeResponseMarkdownQuery(),
  });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

