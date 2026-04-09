import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const DEFAULT_API_BASE = 'https://open.baklib.com/api/v1';

function isDebugEnabled() {
  const v = (process.env.BAKLIB_MCP_DEBUG || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function debugLog(message) {
  if (!isDebugEnabled()) return;
  console.error(`[baklib-mcp config] ${message}`);
}

async function readTextFileIfExists(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    const value = String(text).trim();
    return value ? value : null;
  } catch {
    return null;
  }
}

export async function readBaklibMcpConfig() {
  const tokenKey = 'BAKLIB_MCP_TOKEN';
  const apiBaseKey = 'BAKLIB_MCP_API_BASE';
  const workspaceKey = 'BAKLIB_MCP_WORKSPACE';

  // Fixed precedence:
  // 1) command ENV (process.env) for token/api base
  // 2) $BAKLIB_MCP_WORKSPACE/.config/<KEY> — set by MCP host, e.g. "env": { "BAKLIB_MCP_WORKSPACE": "${workspaceFolder}" }
  // 3) ~/.config/<KEY>
  const envToken = (process.env[tokenKey] || '').trim();
  const envApiBase = (process.env[apiBaseKey] || '').trim();

  const workspaceRoot = (process.env[workspaceKey] || '').trim();
  let workspaceToken = null;
  let workspaceApiBase = null;
  let wsConfigDir = null;
  let wsTokenPath = null;
  let wsApiBasePath = null;
  if (workspaceRoot) {
    wsConfigDir = path.join(path.resolve(workspaceRoot), '.config');
    wsTokenPath = path.join(wsConfigDir, tokenKey);
    wsApiBasePath = path.join(wsConfigDir, apiBaseKey);
    workspaceToken = await readTextFileIfExists(wsTokenPath);
    workspaceApiBase = await readTextFileIfExists(wsApiBasePath);
  }

  const userTokenPath = path.join(os.homedir(), '.config', tokenKey);
  const userApiBasePath = path.join(os.homedir(), '.config', apiBaseKey);
  const userToken = await readTextFileIfExists(userTokenPath);
  const userApiBase = await readTextFileIfExists(userApiBasePath);

  const token = envToken || workspaceToken || userToken || '';
  const apiBase = envApiBase || workspaceApiBase || userApiBase || DEFAULT_API_BASE;

  if (isDebugEnabled()) {
    debugLog(`BAKLIB_MCP_DEBUG=1`);
    debugLog(
      `BAKLIB_MCP_WORKSPACE raw=${JSON.stringify(process.env[workspaceKey] ?? '')} (length=${(process.env[workspaceKey] || '').length})`,
    );
    if (!workspaceRoot) {
      debugLog(
        'hint: workspace empty — use "BAKLIB_MCP_WORKSPACE": "${workspaceFolder}" in mcp.json (curly braces required)',
      );
    } else {
      if (
        workspaceRoot === '$workspaceFolder' ||
        workspaceRoot === '${workspaceFolder}'
      ) {
        debugLog(
          'ERROR: BAKLIB_MCP_WORKSPACE was not expanded by the editor. Use "${workspaceFolder}" with curly braces in mcp.json env — not "$workspaceFolder". After saving, reload the window.',
        );
      }
      debugLog(`resolved workspaceRoot=${path.resolve(workspaceRoot)}`);
      debugLog(`try token file: ${wsTokenPath} -> ${workspaceToken ? 'found' : 'missing'}`);
      debugLog(`try api base file: ${wsApiBasePath} -> ${workspaceApiBase ? 'found' : 'missing'}`);
    }
    debugLog(`try ~/.config token file: ${userTokenPath} -> ${userToken ? 'found' : 'missing'}`);
    debugLog(`env ${tokenKey} set: ${envToken ? `yes (${envToken.length} chars)` : 'no'}`);
    const tokenSource = envToken
      ? 'env'
      : workspaceToken
        ? 'workspace .config file'
        : userToken
          ? '~/.config file'
          : 'none';
    debugLog(`token source: ${tokenSource}${token ? ` (length=${token.length})` : ''}`);
    const apiSource = envApiBase
      ? 'env'
      : workspaceApiBase
        ? 'workspace .config file'
        : userApiBase
          ? '~/.config file'
          : 'default';
    debugLog(`apiBase source: ${apiSource}`);
  }

  return {
    token,
    apiBase,
  };
}

export { DEFAULT_API_BASE };
