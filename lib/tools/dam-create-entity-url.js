/**
 * DAM Create Entity URL Tool
 *
 * Generate a time-limited portal URL for a DAM file entity.
 * API: POST /dam/entities/{entity_id}/urls
 */

import { makeApiRequest } from '../api-client.js';

export const toolDefinition = {
  name: 'dam_create_entity_url',
  description:
    'Generate a portal URL for a DAM file entity (signed or numeric id). Optional purpose and expires_in (seconds). Returns JSON { url, expires_at }.',
  inputSchema: {
    type: 'object',
    properties: {
      entity_id: {
        type: 'string',
        description: 'DAM entity id (numeric) or signed id for a file entity.',
      },
      purpose: {
        type: 'string',
        description: 'Optional URL purpose; server defaults to organization referenced purpose if omitted.',
      },
      expires_in: {
        type: 'number',
        description: 'Optional TTL in seconds from now for the generated URL.',
      },
    },
    required: ['entity_id'],
  },
};

export async function handleTool(args) {
  const { entity_id, purpose, expires_in } = args || {};
  if (!entity_id) {
    throw new Error('entity_id is required');
  }
  const body = {};
  if (purpose != null && String(purpose).trim() !== '') body.purpose = String(purpose).trim();
  if (expires_in != null && expires_in !== '') body.expires_in = Number(expires_in);

  const result = await makeApiRequest(`/dam/entities/${encodeURIComponent(entity_id)}/urls`, 'POST', {
    body: Object.keys(body).length ? body : {},
  });
  return {
    success: true,
    url: result.url,
    expires_at: result.expires_at,
    full_response: result,
  };
}
