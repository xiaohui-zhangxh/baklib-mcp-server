/**
 * DAM Upload Entity Tool
 * 
 * Upload a file to Baklib DAM (Digital Asset Management) system.
 * Returns a signed_id that can be used in knowledge base articles.
 * API: POST /dam/files
 */

import { makeApiRequest, BAKLIB_API_BASE, BAKLIB_TOKEN } from '../api-client.js';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
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
};

/**
 * Tool Handler
 */
export async function handleTool(args) {
  const { file_path, type = 'file', name: fileName } = args || {};
  if (!file_path) {
    throw new Error('file_path is required');
  }
  
  try {
    // Validate file path
    if (!file_path || typeof file_path !== 'string') {
      throw new Error('File path is required and must be a string');
    }

    // Resolve absolute path
    const absolutePath = path.isAbsolute(file_path) 
      ? file_path 
      : path.resolve(process.cwd(), file_path);

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
    const finalFileName = fileName || path.basename(absolutePath);
    
    // Read file buffer
    const fileBuffer = await fs.readFile(absolutePath);
    
    // Get MIME type
    const ext = path.extname(finalFileName).toLowerCase();
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
      filename: finalFileName,
      contentType: mimeType,
    });

    // Upload to Baklib API
    // Official endpoint: POST /dam/files
    const apiUrl = `${BAKLIB_API_BASE}/dam/files`;
    
    console.error(`[DEBUG] Uploading file to: ${apiUrl}`);
    console.error(`[DEBUG] File: ${finalFileName} (${(fileBuffer.length / 1024).toFixed(2)} KB)`);

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
      name: finalFileName,
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

