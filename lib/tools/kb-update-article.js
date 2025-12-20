/**
 * KB Update Article Tool
 * 
 * Update an article in a Baklib knowledge base.
 * API: PATCH /kb/spaces/{space_id}/articles/{article_id}
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'kb_update_article',
  description: 'Update an article in a Baklib knowledge base.',
  inputSchema: {
    type: 'object',
    properties: {
      space_id: {
        type: 'string',
        description: 'Knowledge base (space) ID.',
      },
      article_id: {
        type: 'string',
        description: 'Article ID to update.',
      },
      title: {
        type: 'string',
        description: 'New article title.',
      },
      body: {
        type: 'string',
        description: 'New article content (HTML or Markdown).',
      },
      position: {
        type: 'string',
        description: 'Sort order value.',
      },
      parent_id: {
        type: 'string',
        description: 'Parent article ID.',
      },
    },
    required: ['space_id', 'article_id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { space_id, article_id, title, body, position, parent_id } = args || {};
  if (!space_id || !article_id) {
    throw new Error('space_id and article_id are required');
  }
  
  const attributes = {};
  if (title) attributes.title = title;
  if (body) attributes.body = body;
  if (position) attributes.position = String(position);
  if (parent_id) attributes.parent_id = String(parent_id);
  
  const body_data = {
    data: {
      attributes: attributes,
    },
  };
  
  const result = await makeApiRequest(`/kb/spaces/${space_id}/articles/${article_id}`, 'PATCH', { body: body_data });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

