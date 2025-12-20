/**
 * Site Create Page Tool
 * 
 * Create a new page in a Baklib site.
 * API: POST /sites/{site_id}/pages
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'site_create_page',
  description: 'Create a new page in a Baklib site.',
  inputSchema: {
    type: 'object',
    properties: {
      site_id: {
        type: 'string',
        description: 'Site ID where the page will be created.',
      },
      name: {
        type: 'string',
        description: 'Page title (required).',
      },
      template_name: {
        type: 'string',
        description: 'Template type (required, e.g., "page").',
      },
      parent_id: {
        type: 'string',
        description: 'Parent page ID (optional).',
      },
      template_variables: {
        type: 'object',
        description: 'Template variables (optional, e.g., { content: "...", title: "..." }).',
      },
      published: {
        type: 'boolean',
        description: 'Whether to publish the page (optional).',
      },
      position: {
        type: 'number',
        description: 'Sort order value (optional).',
      },
    },
    required: ['site_id', 'name', 'template_name'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { site_id, name, template_name, parent_id, template_variables, published, position } = args || {};
  if (!site_id || !name || !template_name) {
    throw new Error('site_id, name, and template_name are required');
  }
  const attributes = { name, template_name };
  if (parent_id) attributes.parent_id = parent_id;
  if (template_variables) attributes.template_variables = template_variables;
  if (published !== undefined) attributes.published = published;
  if (position !== undefined) attributes.position = position;
  
  const body = {
    data: {
      attributes: attributes,
    },
  };
  
  const result = await makeApiRequest(`/sites/${site_id}/pages`, 'POST', { body });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

