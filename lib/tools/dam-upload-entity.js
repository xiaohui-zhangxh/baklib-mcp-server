/**
 * DAM Upload Entity Tool
 * 
 * Upload a file to Baklib DAM (Digital Asset Management) system.
 * Returns a signed_id that can be used in knowledge base articles.
 * API: POST /dam/files
 */

import { BAKLIB_API_BASE, BAKLIB_TOKEN } from '../api-client.js';
import fs from 'fs/promises';
import http from 'http';
import https from 'https';
import path from 'path';
import { URL } from 'url';
import FormData from 'form-data';

/**
 * POST multipart with npm `form-data` piped into Node core `http(s).request`.
 * Avoids undici `fetch` + multipart bugs (empty body → Baklib Rack::Multipart::EmptyContentError),
 * including when the MCP host runs the tool in a subprocess.
 */
function postMultipart(urlString, authHeader, form) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlString);
    const isHttps = u.protocol === 'https:';
    const lib = isHttps ? https : http;
    const port = u.port || (isHttps ? 443 : 80);
    const opts = {
      method: 'POST',
      hostname: u.hostname,
      port,
      path: `${u.pathname}${u.search}`,
      headers: {
        Authorization: authHeader,
        ...form.getHeaders(),
      },
    };

    const req = lib.request(opts, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Baklib API error (${res.statusCode}): ${raw}`));
          return;
        }
        const trimmed = raw.trim();
        if (!trimmed) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(trimmed));
        } catch {
          reject(new Error(`Baklib API returned non-JSON (${res.statusCode}): ${trimmed.slice(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    form.pipe(req);
  });
}

/**
 * MCP Tool Definition
 */
export const toolDefinition = {
  name: 'dam_upload_entity',
  description:
    'Upload a file to Baklib DAM (Digital Asset Management). Response includes JSON:API data.id as id, and attributes.iid as iid. In BKE Markdown bodies use DAM images as `![alt](dam-id=<iid>)` with **iid** from this response (not `data.id`).',
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

    // JSON:API multipart: data[type] + data[attributes][file]
    const formData = new FormData();
    formData.append('data[type]', 'dam_files');
    formData.append('data[attributes][file]', fileBuffer, {
      filename: finalFileName,
      contentType: mimeType,
    });

    const apiUrl = `${BAKLIB_API_BASE}/dam/files`;

    console.error(`[DEBUG] Uploading file to: ${apiUrl}`);
    console.error(`[DEBUG] File: ${finalFileName} (${(fileBuffer.length / 1024).toFixed(2)} KB)`);

    const result = await postMultipart(apiUrl, BAKLIB_TOKEN, formData);
    
    // Extract signed_id from JSON API response
    // Response format: { data: { id: "...", attributes: { ... } } }
    const signedId = result.data?.id || result.id || result.signed_id || result.data?.attributes?.signed_id;
    const attrs = result.data?.attributes;
    const fileUrl = attrs?.url || result.url || result.data?.url;
    /** BKE Markdown `dam-id` must use **iid** from this response (workbench), not JSON:API `data.id`. */
    const iid = attrs?.iid;

    return {
      success: true,
      id: signedId,
      iid,
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

