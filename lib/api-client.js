/**
 * Baklib API Client
 * 
 * Provides a common API request function for all Baklib API endpoints
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const BAKLIB_TOKEN = process.env.BAKLIB_TOKEN || '';
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

export { BAKLIB_API_BASE, BAKLIB_TOKEN };

