/**
 * DAM Get Entity Tool
 *
 * Get file information from Baklib DAM system by ID.
 * API: GET /dam/entities/{entity_id}
 * Query: include_signed_id, purpose (for signed_id generation rules)
 */

import { makeApiRequest } from '../api-client.js';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'dam_get_entity',
  description:
    'Get file information from Baklib DAM by entity id. Optional include_signed_id + purpose: use purpose "dynamic_form" with include_signed_id true when filling image_picker, video_picker, or other dynamic form fields on site pages; for rich text editor embedding, set include_signed_id true and omit purpose, then use the returned signed_id in the editor HTML/attributes as required.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description:
          'DAM entity id (numeric id from upload or list responses, e.g. data.id).',
      },
      include_signed_id: {
        type: 'boolean',
        description:
          'When true, response includes signed_id for embedding (editors, dynamic forms, avatars, etc.).',
      },
      purpose: {
        type: 'string',
        description:
          'Scenario for signed_id generation. Use "dynamic_form" for image_picker, video_picker, and page dynamic forms. Omit for rich text editor usage.',
      },
    },
    required: ['id'],
  },
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { id, include_signed_id, purpose } = args || {};
  if (!id) {
    throw new Error('id is required');
  }

  const query = {};
  if (include_signed_id !== undefined && include_signed_id !== null) {
    query.include_signed_id = include_signed_id ? 'true' : 'false';
  }
  if (purpose != null && String(purpose).trim() !== '') {
    query.purpose = String(purpose).trim();
  }

  const result = await makeApiRequest(`/dam/entities/${id}`, 'GET', {
    query: Object.keys(query).length ? query : undefined,
  });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

