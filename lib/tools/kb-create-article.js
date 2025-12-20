/**
 * KB Create Article Tool
 * 
 * Create a new article in a Baklib knowledge base.
 * API: POST /kb/spaces/{space_id}/articles
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'kb_create_article',
  description: 'Create a new article in a Baklib knowledge base.',
  inputSchema: {
    type: 'object',
    properties: {
      space_id: {
        type: 'string',
        description: 'Knowledge base (space) ID where the article will be created.',
      },
      title: {
        type: 'string',
        description: 'Article title (required).',
      },
      body: {
        type: 'string',
        description: 'Article content (optional, HTML or Markdown).',
      },
      position: {
        type: 'string',
        description: 'Sort order value (optional).',
      },
      parent_id: {
        type: 'string',
        description: 'Parent article ID (optional, for creating sub-articles).',
      },
    },
    required: ['space_id', 'title'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { space_id, title, body, position, parent_id } = args || {};
  if (!space_id || !title) {
    throw new Error('space_id and title are required');
  }
  
  const attributes = { title };
  if (body) attributes.body = body;
  if (position) attributes.position = String(position);
  if (parent_id) attributes.parent_id = String(parent_id);
  
  const requestBody = {
    data: {
      attributes,
    },
  };
  
  const result = await makeApiRequest(`/kb/spaces/${space_id}/articles`, 'POST', { body: requestBody });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

