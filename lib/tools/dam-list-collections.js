/**
 * DAM List Collections Tool
 *
 * API: GET /dam/collections
 */

import { makeApiRequest } from '../api-client.js';

export const toolDefinition = {
  name: 'dam_list_collections',
  description:
    'List DAM collections with optional pagination and ransack filters (q[name_eq], q[name_cont], q[parent_id_eq]).',
  inputSchema: {
    type: 'object',
    properties: {
      page: { type: 'number', description: 'Page number (page[number]).' },
      per_page: { type: 'number', description: 'Page size (page[size], max 100).' },
      name_eq: { type: 'string', description: 'Exact name match (sent as q[name_eq]).' },
      name_cont: { type: 'string', description: 'Name contains (q[name_cont]).' },
      parent_id_eq: { type: 'number', description: 'Parent collection database id (q[parent_id_eq]).' },
    },
  },
};

export async function handleTool(args) {
  const { page, per_page, name_eq, name_cont, parent_id_eq } = args || {};
  const query = {};
  if (page) query['page[number]'] = page;
  if (per_page) query['page[size]'] = per_page;
  if (name_eq != null && String(name_eq) !== '') query['q[name_eq]'] = String(name_eq);
  if (name_cont != null && String(name_cont) !== '') query['q[name_cont]'] = String(name_cont);
  if (parent_id_eq != null && parent_id_eq !== '') query['q[parent_id_eq]'] = parent_id_eq;

  const result = await makeApiRequest('/dam/collections', 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}
