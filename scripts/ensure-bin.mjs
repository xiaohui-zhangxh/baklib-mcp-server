#!/usr/bin/env node
/**
 * 保证本仓库根目录存在 node_modules/.bin/baklib-mcp-server。
 *
 * 背景：在本仓库目录下执行 `npx -y @baklib/baklib-mcp-server@…` 时，npm 会按「本地包」解析，
 * 但根项目执行 `npm install` 时往往不会把 package.json 里声明的 bin 链到 node_modules/.bin；
 * 若依赖里也没有任何带 bin 的包，则可能连 node_modules/.bin 都不存在。此时 npx 会退化为用 sh
 * 执行命令名 baklib-mcp-server，从而出现：sh: baklib-mcp-server: command not found。
 *
 * 作为依赖被安装时，npm 会正常生成 .bin，本脚本在检测到已存在链接时直接退出。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.join(__dirname, '..');
const indexJs = path.join(packageRoot, 'index.js');
const binDir = path.join(packageRoot, 'node_modules', '.bin');
const linkPath = path.join(binDir, 'baklib-mcp-server');

function main() {
  // 作为依赖安装在 node_modules/@baklib/baklib-mcp-server 时，由 npm 在宿主项目的 .bin 生成链接，勿写嵌套目录
  const normalized = packageRoot.split(path.sep).join('/');
  if (normalized.includes('/node_modules/@baklib/baklib-mcp-server')) return;

  if (!fs.existsSync(indexJs)) return;
  fs.mkdirSync(binDir, { recursive: true });
  if (fs.existsSync(linkPath)) return;

  const rel = path.relative(binDir, indexJs);
  try {
    fs.symlinkSync(rel, linkPath);
  } catch (err) {
    if (err && (err.code === 'EEXIST' || err.code === 'ENOENT')) return;
    if (process.platform === 'win32') {
      const cmdPath = `${linkPath}.cmd`;
      if (fs.existsSync(cmdPath)) return;
      const abs = path.resolve(indexJs);
      fs.writeFileSync(cmdPath, `@ECHO OFF\r\nnode "${abs}" %*\r\n`, 'utf8');
      return;
    }
    console.warn(
      '[@baklib/baklib-mcp-server] ensure-bin: could not create .bin link:',
      err.message,
    );
  }
}

main();
