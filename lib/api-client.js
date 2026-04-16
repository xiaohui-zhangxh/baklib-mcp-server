/**
 * Baklib API Client
 * 
 * Provides a common API request function for all Baklib API endpoints
 */

import { readBaklibMcpConfig } from './config.js';

/** Node 18+ 内置 fetch（undici），无需 node-fetch，避免 fetch-blob → node-domexception 的弃用告警 */

function traceEnabled() {
  const v = (process.env.BAKLIB_MCP_TRACE || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function traceLog(label, payload) {
  if (!traceEnabled()) return;
  const max = Number(process.env.BAKLIB_MCP_TRACE_MAX_CHARS || 12000);
  const s = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  const out = s.length > max ? `${s.slice(0, max)}\n… (${s.length} chars, truncated)` : s;
  console.error(`[MCP-TRACE] ${label}\n${out}`);
}

// Configuration
const { token: BAKLIB_TOKEN, apiBase: BAKLIB_API_BASE } = await readBaklibMcpConfig();

// Validate configuration
if (!BAKLIB_TOKEN) {
  console.error(
    '错误：未找到 BAKLIB_MCP_TOKEN 配置。请在环境变量、$BAKLIB_MCP_WORKSPACE/.config/ 或 ~/.config/ 中设置。',
  );
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
export async function makeApiRequest(endpoint, method = 'GET', options = {}) {
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
  traceLog('HTTP request body', body || '(none)');

  const response = await fetch(url.toString(), {
    method,
    headers,
    body,
  });

  const responseText = await response.text();

  if (!response.ok) {
    traceLog(`HTTP error ${response.status} body`, responseText);
    throw new Error(`Baklib API error (${response.status}): ${responseText}`);
  }

  // Handle empty response (e.g., DELETE)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    traceLog('HTTP response', '(empty)');
    return { success: true };
  }

  traceLog(`HTTP ${response.status} response body`, responseText || '(empty)');

  const trimmed = responseText.trim();
  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed);
  } catch (e) {
    throw new Error(`Baklib API returned non-JSON (${response.status}): ${responseText.slice(0, 500)}`);
  }
}

export { BAKLIB_API_BASE, BAKLIB_TOKEN };

