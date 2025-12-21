#!/usr/bin/env node

/**
 * Baklib MCP Server - Complete Implementation
 * 
 * This MCP server implements Baklib API functionality including:
 * - DAM (Digital Asset Management) - Resource library
 * - KB (Knowledge Base) - Knowledge base management
 * - Site Pages - Site page management
 * - Site Tags - Site tag management
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
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import all tools
import { getAllToolDefinitions, getToolHandler } from './lib/tools/index.js';

// Get version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, 'package.json'), 'utf-8')
);
const VERSION = packageJson.version;

// ============================================================================
// MCP Server Setup
// ============================================================================

// Create MCP server
const server = new Server(
  {
    name: 'baklib-mcp-server',
    version: VERSION,
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
    tools: getAllToolDefinitions(),
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const handler = getToolHandler(name);
    if (!handler) {
      return formatError(`Unknown tool: ${name}`);
    }

    const result = await handler(args);
    return formatResponse(result);
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
  console.error(`Baklib MCP Server v${VERSION} started`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
