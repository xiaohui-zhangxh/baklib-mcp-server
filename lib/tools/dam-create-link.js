/**
 * DAM Create Link Tool
 *
 * API: POST /dam/links
 */

import { makeApiRequest } from '../api-client.js';

export const toolDefinition = {
  name: 'dam_create_link',
  description:
    'Create a DAM link (external URL) entity. Requires url; optional name, description, title, link_description, collection_ids, tag_ids (database ids).',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Target URL (required).',
      },
      name: {
        type: 'string',
        description: 'Link display name.',
      },
      description: {
        type: 'string',
        description: 'Entity description.',
      },
      title: {
        type: 'string',
        description: 'Link title.',
      },
      link_description: {
        type: 'string',
        description: 'Mapped to link entity description on server.',
      },
      collection_ids: {
        type: 'array',
        items: { type: 'number' },
        description: 'Collection database ids.',
      },
      tag_ids: {
        type: 'array',
        items: { type: 'number' },
        description: 'Tag database ids.',
      },
      include_signed_id: {
        type: 'boolean',
        description: 'When true, adds query include_signed_id=true (per server links#create).',
      },
      purpose: {
        type: 'string',
        description: 'Optional query purpose for signed_id rules on create response.',
      },
    },
    required: ['url'],
  },
};

export async function handleTool(args) {
  const {
    url,
    name,
    description,
    title,
    link_description,
    collection_ids,
    tag_ids,
    include_signed_id,
    purpose,
  } = args || {};
  if (!url) {
    throw new Error('url is required');
  }
  const attributes = { url: String(url) };
  if (name != null) attributes.name = name;
  if (description != null) attributes.description = description;
  if (title != null) attributes.title = title;
  if (link_description != null) attributes.link_description = link_description;
  if (collection_ids != null) attributes.collection_ids = collection_ids;
  if (tag_ids != null) attributes.tag_ids = tag_ids;

  const body = {
    data: {
      type: 'dam_entities',
      attributes,
    },
  };

  const query = {};
  if (include_signed_id === true) query.include_signed_id = 'true';
  if (purpose != null && String(purpose).trim() !== '') query.purpose = String(purpose).trim();

  const result = await makeApiRequest('/dam/links', 'POST', {
    body,
    query: Object.keys(query).length ? query : undefined,
  });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}
