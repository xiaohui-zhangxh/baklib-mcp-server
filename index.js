#!/usr/bin/env node

/**
 * Baklib MCP Server - Complete Implementation
 * 
 * This MCP server implements Baklib API functionality including:
 * - DAM (Digital Asset Management) - Resource library
 * - KB (Knowledge Base) - Knowledge base management
 * 
 * Phase 1: Knowledge Base and Resource Library interfaces
 * 
 * Based on Baklib API: https://dev.baklib.cn/api
 * Uses JSON API format for requests and responses
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const BAKLIB_TOKEN = process.env.BAKLIB_TOKEN || '';
// Baklib API base URL - can be overridden via environment variable for private deployments
const BAKLIB_API_BASE = process.env.BAKLIB_API_BASE || 'https://open.baklib.com/api/v1';

// Validate configuration
if (!BAKLIB_TOKEN) {
  console.error('Error: BAKLIB_TOKEN environment variable must be set');
  process.exit(1);
}

/**
 * Make API request to Baklib
 * 
 * @param {string} endpoint - API endpoint (e.g., '/dam/files')
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {Object} options - Request options
 * @param {Object} options.body - Request body (for JSON requests)
 * @param {FormData} options.formData - FormData (for multipart requests)
 * @param {Object} options.query - Query parameters
 * @returns {Promise<Object>} API response
 */
async function makeApiRequest(endpoint, method = 'GET', options = {}) {
  const url = new URL(`${BAKLIB_API_BASE}${endpoint}`);
  
  // Add query parameters
  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }

  const headers = {
    'Authorization': BAKLIB_TOKEN,  // No Bearer prefix
  };

  let body = null;

  // Handle FormData (multipart/form-data)
  if (options.formData) {
    Object.assign(headers, options.formData.getHeaders());
    body = options.formData;
  } 
  // Handle JSON body
  else if (options.body) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  console.error(`[DEBUG] ${method} ${url.toString()}`);

  const response = await fetch(url.toString(), {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Baklib API error (${response.status}): ${errorText}`);
  }

  // Handle empty response (e.g., DELETE)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { success: true };
  }

  return await response.json();
}

/**
 * Upload file to Baklib DAM system
 * 
 * @param {string} filePath - Local file path to upload
 * @param {string} type - Resource type (image, file, etc.)
 * @param {string} name - File name (optional, defaults to filename from path)
 * @returns {Promise<Object>} Upload result with signed_id
 */
async function uploadFileToBaklib(filePath, type = 'file', name = null) {
  try {
    // Validate file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('File path is required and must be a string');
    }

    // Resolve absolute path
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);

    // Check if file exists
    try {
      await fs.access(absolutePath);
    } catch (error) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    // Get file stats
    const stats = await fs.stat(absolutePath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${absolutePath}`);
    }

    // Get file name
    const fileName = name || path.basename(absolutePath);
    
    // Read file buffer
    const fileBuffer = await fs.readFile(absolutePath);
    
    // Get MIME type
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.md': 'text/markdown',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    // Create form data using JSON API format
    // Based on server code: Api::Dam::FilesController uses jsonapi_parse
    // Format: data[type] and data[attributes][file]
    const formData = new FormData();
    formData.append('data[type]', 'dam_files');
    formData.append('data[attributes][file]', fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });

    // Upload to Baklib API
    // Official endpoint: POST /dam/files
    const apiUrl = `${BAKLIB_API_BASE}/dam/files`;
    
    console.error(`[DEBUG] Uploading file to: ${apiUrl}`);
    console.error(`[DEBUG] File: ${fileName} (${(fileBuffer.length / 1024).toFixed(2)} KB)`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': BAKLIB_TOKEN,  // No Bearer prefix according to API docs
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Baklib API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    // Extract signed_id from JSON API response
    // Response format: { data: { id: "...", attributes: { ... } } }
    const signedId = result.data?.id || result.id || result.signed_id || result.data?.attributes?.signed_id;
    const fileUrl = result.data?.attributes?.url || result.url || result.data?.url;
    
    // Return the signed_id (can be used in knowledge base articles)
    return {
      success: true,
      id: signedId,
      name: fileName,
      type: type,
      size: fileBuffer.length,
      mime_type: mimeType,
      url: fileUrl,
      full_response: result,
    };
  } catch (error) {
    console.error(`[ERROR] Upload failed: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// DAM (Digital Asset Management) - Resource Library Functions
// ============================================================================

/**
 * Get file information from DAM
 * API: GET /dam/entities/{entity_id}
 */
async function getDamEntity(id) {
  const result = await makeApiRequest(`/dam/entities/${id}`, 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

/**
 * Update file metadata in DAM
 * API: PATCH /dam/files/{entity_id}
 */
async function updateDamEntity(id, attributes = {}) {
  const body = {
    data: {
      type: 'dam_files',
      id: id,
      attributes: attributes,
    },
  };
  const result = await makeApiRequest(`/dam/files/${id}`, 'PATCH', { body });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

/**
 * Delete file from DAM
 * API: DELETE /dam/entities/{entity_id}
 */
async function deleteDamEntity(id) {
  await makeApiRequest(`/dam/entities/${id}`, 'DELETE');
  return { success: true };
}

/**
 * List files in DAM
 * API: GET /dam/entities
 */
async function listDamEntities(options = {}) {
  const query = {};
  // Use page[number] and page[size] format according to API docs
  if (options.page) query['page[number]'] = options.page;
  if (options.per_page) query['page[size]'] = options.per_page;
  if (options.type) query.type = options.type;
  if (options.name) query.name = options.name; // API uses 'name' not 'search'
  if (options.deleted !== undefined) query.deleted = options.deleted;

  const result = await makeApiRequest('/dam/entities', 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

// ============================================================================
// KB (Knowledge Base) Functions
// ============================================================================

/**
 * Create article in knowledge base
 * API: POST /kb/spaces/{space_id}/articles
 */
async function createKbArticle(spaceId, title, body, options = {}) {
  const attributes = {
    title,
  };
  
  // body is optional according to API docs
  if (body) {
    attributes.body = body;
  }
  
  // position and parent_id are optional
  if (options.position) {
    attributes.position = String(options.position);
  }
  if (options.parent_id) {
    attributes.parent_id = String(options.parent_id);
  }

  const requestBody = {
    data: {
      attributes,
    },
  };

  const result = await makeApiRequest(`/kb/spaces/${spaceId}/articles`, 'POST', { body: requestBody });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

/**
 * Get article from knowledge base
 * API: GET /kb/spaces/{space_id}/articles/{article_id}
 */
async function getKbArticle(spaceId, articleId) {
  const result = await makeApiRequest(`/kb/spaces/${spaceId}/articles/${articleId}`, 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

/**
 * Update article in knowledge base
 * API: PATCH /kb/spaces/{space_id}/articles/{article_id}
 */
async function updateKbArticle(spaceId, articleId, attributes = {}) {
  const body = {
    data: {
      attributes: attributes,
    },
  };
  const result = await makeApiRequest(`/kb/spaces/${spaceId}/articles/${articleId}`, 'PATCH', { body });
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

/**
 * Delete article from knowledge base
 * API: DELETE /kb/spaces/{space_id}/articles/{article_id}
 */
async function deleteKbArticle(spaceId, articleId) {
  await makeApiRequest(`/kb/spaces/${spaceId}/articles/${articleId}`, 'DELETE');
  return { success: true };
}

/**
 * List articles in knowledge base
 * API: GET /kb/spaces/{space_id}/articles
 */
async function listKbArticles(spaceId, options = {}) {
  const query = {};
  // Use page[number] and page[size] format according to API docs
  if (options.page) query['page[number]'] = options.page;
  if (options.per_page) query['page[size]'] = options.per_page;
  if (options.keywords) query.keywords = options.keywords; // API uses 'keywords' not 'search'
  if (options.parent_id) query.parent_id = options.parent_id;

  const result = await makeApiRequest(`/kb/spaces/${spaceId}/articles`, 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

/**
 * List knowledge bases (spaces)
 * API: GET /kb/spaces
 */
async function listKbKnowledgeBases(options = {}) {
  const query = {};
  // Use page[number] and page[size] format according to API docs
  if (options.page) query['page[number]'] = options.page;
  if (options.per_page) query['page[size]'] = options.per_page;

  const result = await makeApiRequest('/kb/spaces', 'GET', { query });
  return {
    success: true,
    data: result.data || [],
    meta: result.meta,
    full_response: result,
  };
}

/**
 * Get knowledge base details
 * API: GET /kb/spaces/{space_id}
 */
async function getKbKnowledgeBase(id) {
  const result = await makeApiRequest(`/kb/spaces/${id}`, 'GET');
  return {
    success: true,
    data: result.data,
    full_response: result,
  };
}

// ============================================================================
// MCP Server Setup
// ============================================================================

// Create MCP server
const server = new Server(
  {
    name: 'baklib-mcp-server',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // DAM (Resource Library) Tools
      {
        name: 'dam_upload_entity',
        description: 'Upload a file to Baklib DAM (Digital Asset Management) system. Returns a signed_id that can be used in knowledge base articles.',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Local file path to upload. Can be absolute or relative to current working directory.',
            },
            type: {
              type: 'string',
              description: 'Resource type: "image", "file", "video", "audio", etc. Defaults to "file".',
              enum: ['image', 'file', 'video', 'audio'],
              default: 'file',
            },
            name: {
              type: 'string',
              description: 'Optional file name. If not provided, uses the filename from file_path.',
            },
          },
          required: ['file_path'],
        },
      },
      {
        name: 'dam_get_entity',
        description: 'Get file information from Baklib DAM system by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'File ID (signed_id) to retrieve.',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'dam_update_entity',
        description: 'Update file metadata (name, description) in Baklib DAM system.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'File ID to update.',
            },
            name: {
              type: 'string',
              description: 'New file name.',
            },
            description: {
              type: 'string',
              description: 'File description.',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'dam_delete_entity',
        description: 'Delete a file from Baklib DAM system.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'File ID to delete.',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'dam_list_entities',
        description: 'List files in Baklib DAM system with optional filtering and pagination.',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number for pagination.',
            },
            per_page: {
              type: 'number',
              description: 'Number of items per page.',
            },
            type: {
              type: 'string',
              description: 'Filter by resource type (e.g., "link", "file", etc.).',
            },
            name: {
              type: 'string',
              description: 'Filter by resource name.',
            },
            deleted: {
              type: 'boolean',
              description: 'Filter by deleted status.',
            },
          },
        },
      },
      // KB (Knowledge Base) Tools
      {
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
      },
      {
        name: 'kb_get_article',
        description: 'Get article details from a Baklib knowledge base by space ID and article ID.',
        inputSchema: {
          type: 'object',
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
      },
      {
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
      },
      {
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
      },
      {
        name: 'kb_list_articles',
        description: 'List articles in a Baklib knowledge base with optional filtering and pagination.',
        inputSchema: {
          type: 'object',
          properties: {
            space_id: {
              type: 'string',
              description: 'Knowledge base (space) ID to list articles from.',
            },
            page: {
              type: 'number',
              description: 'Page number for pagination.',
            },
            per_page: {
              type: 'number',
              description: 'Number of items per page.',
            },
            keywords: {
              type: 'string',
              description: 'Search keywords to filter articles.',
            },
            parent_id: {
              type: 'string',
              description: 'Filter by parent article ID (to get sub-articles).',
            },
          },
          required: ['space_id'],
        },
      },
      {
        name: 'kb_list_knowledge_bases',
        description: 'List all knowledge bases (spaces) accessible by the user.',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number for pagination.',
            },
            per_page: {
              type: 'number',
              description: 'Number of items per page.',
            },
          },
        },
      },
      {
        name: 'kb_get_knowledge_base',
        description: 'Get knowledge base (space) details by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            space_id: {
              type: 'string',
              description: 'Knowledge base (space) ID to retrieve.',
            },
          },
          required: ['space_id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // DAM (Resource Library) Tools
    if (name === 'dam_upload_entity') {
      const { file_path, type = 'file', name: fileName } = args || {};
      if (!file_path) {
        throw new Error('file_path is required');
      }
      const result = await uploadFileToBaklib(file_path, type, fileName);
      return formatResponse(result);
    }

    if (name === 'dam_get_entity') {
      const { id } = args || {};
      if (!id) {
        throw new Error('id is required');
      }
      const result = await getDamEntity(id);
      return formatResponse(result);
    }

    if (name === 'dam_update_entity') {
      const { id, name, description } = args || {};
      if (!id) {
        throw new Error('id is required');
      }
      const attributes = {};
      if (name) attributes.name = name;
      if (description) attributes.description = description;
      const result = await updateDamEntity(id, attributes);
      return formatResponse(result);
    }

    if (name === 'dam_delete_entity') {
      const { id } = args || {};
      if (!id) {
        throw new Error('id is required');
      }
      const result = await deleteDamEntity(id);
      return formatResponse(result);
    }

    if (name === 'dam_list_entities') {
      const { page, per_page, type, name, deleted } = args || {};
      const result = await listDamEntities({ page, per_page, type, name, deleted });
      return formatResponse(result);
    }

    // KB (Knowledge Base) Tools
    if (name === 'kb_create_article') {
      const { space_id, title, body, position, parent_id } = args || {};
      if (!space_id || !title) {
        throw new Error('space_id and title are required');
      }
      const result = await createKbArticle(space_id, title, body, {
        position,
        parent_id,
      });
      return formatResponse(result);
    }

    if (name === 'kb_get_article') {
      const { space_id, article_id } = args || {};
      if (!space_id || !article_id) {
        throw new Error('space_id and article_id are required');
      }
      const result = await getKbArticle(space_id, article_id);
      return formatResponse(result);
    }

    if (name === 'kb_update_article') {
      const { space_id, article_id, title, body, position, parent_id } = args || {};
      if (!space_id || !article_id) {
        throw new Error('space_id and article_id are required');
      }
      const attributes = {};
      if (title) attributes.title = title;
      if (body) attributes.body = body;
      if (position) attributes.position = String(position);
      if (parent_id) attributes.parent_id = String(parent_id);
      const result = await updateKbArticle(space_id, article_id, attributes);
      return formatResponse(result);
    }

    if (name === 'kb_delete_article') {
      const { space_id, article_id } = args || {};
      if (!space_id || !article_id) {
        throw new Error('space_id and article_id are required');
      }
      const result = await deleteKbArticle(space_id, article_id);
      return formatResponse(result);
    }

    if (name === 'kb_list_articles') {
      const { space_id, page, per_page, keywords, parent_id } = args || {};
      if (!space_id) {
        throw new Error('space_id is required');
      }
      const result = await listKbArticles(space_id, {
        page,
        per_page,
        keywords,
        parent_id,
      });
      return formatResponse(result);
    }

    if (name === 'kb_list_knowledge_bases') {
      const { page, per_page } = args || {};
      const result = await listKbKnowledgeBases({ page, per_page });
      return formatResponse(result);
    }

    if (name === 'kb_get_knowledge_base') {
      const { space_id } = args || {};
      if (!space_id) {
        throw new Error('space_id is required');
      }
      const result = await getKbKnowledgeBase(space_id);
      return formatResponse(result);
    }

    // Unknown tool
    return formatError(`Unknown tool: ${name}`);
  } catch (error) {
    return formatError(error.message, error.stack);
  }
});

/**
 * Format successful response
 */
function formatResponse(data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Format error response
 */
function formatError(message, stack = null) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          error: message,
          ...(stack && { stack }),
        }, null, 2),
      },
    ],
    isError: true,
  };
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Baklib MCP Server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
