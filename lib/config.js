import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const DEFAULT_API_BASE = 'https://open.baklib.com/api/v1';

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

  // Fixed precedence:
  // 1) command ENV (process.env)
  // 2) ~/.config/<KEY>
  const envToken = (process.env[tokenKey] || '').trim();
  const envApiBase = (process.env[apiBaseKey] || '').trim();

  const userToken = await readTextFileIfExists(path.join(os.homedir(), '.config', tokenKey));

  const userApiBase = await readTextFileIfExists(path.join(os.homedir(), '.config', apiBaseKey));

  const token = envToken || userToken || '';
  const apiBase = envApiBase || userApiBase || DEFAULT_API_BASE;

  return {
    token,
    apiBase,
  };
}

export { DEFAULT_API_BASE };
