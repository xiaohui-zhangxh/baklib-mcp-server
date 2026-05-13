/**
 * DAM Update Link Tool
 *
 * API: PATCH /dam/links/{entity_id}
 */

import { makeApiRequest } from '../api-client.js';

export const toolDefinition = {
  name: 'dam_update_link',
  description:
    'Update a DAM link entity. Pass entity_id and any of name, description, url, title, link_description, collection_ids, tag_ids (database ids).',
  inputSchema: {
    type: 'object',
    properties: {
      entity_id: {
        type: 'string',
        description: 'Link entity id.',
      },
      name: { type: 'string' },
      description: { type: 'string' },
      url: { type: 'string' },
      title: { type: 'string' },
      link_description: { type: 'string' },
      collection_ids: {
        type: 'array',
        items: { type: 'number' },
      },
      tag_ids: {
        type: 'array',
        items: { type: 'number' },
      },
    },
    required: ['entity_id'],
  },
};

export async function handleTool(args) {
  const {
    entity_id,
    name,
    description,
    url,
    title,
    link_description,
    collection_ids,
    tag_ids,
  } = args || {};
  if (!entity_id) {
    throw new Error('entity_id is required');
  }
  const attributes = {};
  if (name !== undefined) attributes.name = name;
  if (description !== undefined) attributes.description = description;
  if (url !== undefined) attributes.url = url;
  if (title !== undefined) attributes.title = title;
  if (link_description !== undefined) attributes.link_description = link_description;
  if (collection_ids !== undefined) attributes.collection_ids = collection_ids;
  if (tag_ids !== undefined) attributes.tag_ids = tag_ids;

  if (Object.keys(attributes).length === 0) {
    throw new Error('At least one attribute to update is required');
  }

  const body = {
    data: {
      type: 'dam_entities',
      attributes,
    },
  };

  const result = await makeApiRequest(`/dam/links/${encodeURIComponent(entity_id)}`, 'PATCH', { body });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}
