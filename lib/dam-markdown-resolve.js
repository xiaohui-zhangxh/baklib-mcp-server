/**
 * Resolve DAM image shorthand in BKE Markdown before POST/PATCH.
 *
 * `![alt](dam-id=123)` is parsed as a normal link destination and becomes
 * `<img src="dam-id=123">` in HTML (broken). BKE expects either the
 * placeholder from baklib-bke-markdown: `![](<> "dam-id=123")`, or a real URL
 * plus dam-id in the title: `![alt](https://… "dam-id=123")`.
 *
 * When possible we GET `/dam/entities/{id}` (same id users pass after upload
 * MCP: workbench iid or JSON:API id — whichever the API accepts) and rewrite
 * to the URL + title form. On failure we fall back to `![](<> "dam-id=id")`
 * via {@link ./dam-markdown-normalize.js}.
 */

import { makeApiRequest } from './api-client.js';
import { mergeResponseMarkdownQuery } from './bke-api-defaults.js';
import { normalizeDamIdImageMarkdown, normalizeDamIdImageMarkdownDeep } from './dam-markdown-normalize.js';

const DAM_IMAGE_SHORTHAND = /!\[([^\]]*)\]\(\s*dam-id\s*[:=]\s*(\d+)\s*\)/g;

/** `<img ... src="dam-id=123" ...>` produced by bad round-trips / paste */
const HTML_IMG_DAM_SRC = /<img\b([^>]*)\>/gi;

function damResolveDisabled() {
  const v = (process.env.BAKLIB_MCP_DAM_MARKDOWN_NO_RESOLVE || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/**
 * Wrap URL for markdown image destination when it contains spaces or parens.
 * @param {string} url
 */
export function wrapMarkdownImageDestination(url) {
  if (!url || typeof url !== 'string') return url;
  if (/[\s()]/.test(url)) return `<${url}>`;
  return url;
}

/**
 * @param {string} inner img tag inner HTML
 */
function htmlImgToDamMarkdown(inner) {
  const srcM = /src\s*=\s*["']dam-id\s*[:=]\s*(\d+)["']/i.exec(inner);
  if (!srcM) return null;
  const id = srcM[1];
  const altM = /\balt\s*=\s*["']([^"']*)["']/i.exec(inner);
  const alt = altM ? altM[1] : '';
  return `![${alt}](dam-id=${id})`;
}

/**
 * @param {string} input
 * @param {(endpoint: string, method?: string, options?: object) => Promise<any>} [fetchFn]
 * @returns {Promise<string>}
 */
export async function expandDamIdImageMarkdown(input, fetchFn = makeApiRequest) {
  if (damResolveDisabled() || typeof input !== 'string' || input.length === 0) {
    return normalizeDamIdImageMarkdown(input);
  }

  let s = input.replace(HTML_IMG_DAM_SRC, (full, inner) => {
    const md = htmlImgToDamMarkdown(inner);
    return md || full;
  });

  const ids = new Set();
  let m;
  const reCollect = new RegExp(DAM_IMAGE_SHORTHAND.source, 'g');
  while ((m = reCollect.exec(s)) !== null) ids.add(m[2]);

  /** @type {Map<string, { url: string, damTitleId: string } | null>} */
  const resolved = new Map();
  await Promise.all(
    [...ids].map(async (id) => {
      try {
        const result = await fetchFn(`/dam/entities/${encodeURIComponent(id)}`, 'GET', {
          query: mergeResponseMarkdownQuery(),
        });
        const attrs = result?.data?.attributes;
        const url = attrs?.url;
        if (!url || typeof url !== 'string') {
          resolved.set(id, null);
          return;
        }
        const damTitleId =
          attrs?.iid != null && attrs.iid !== ''
            ? String(attrs.iid)
            : String(result?.data?.id ?? id);
        resolved.set(id, { url: wrapMarkdownImageDestination(url), damTitleId });
      } catch {
        resolved.set(id, null);
      }
    }),
  );

  s = s.replace(new RegExp(DAM_IMAGE_SHORTHAND.source, 'g'), (full, alt, id) => {
    const info = resolved.get(id);
    if (!info) return `![${alt}](<> "dam-id=${id}")`;
    return `![${alt}](${info.url} "dam-id=${info.damTitleId}")`;
  });

  return normalizeDamIdImageMarkdown(s);
}

/**
 * @param {unknown} value
 * @param {(endpoint: string, method?: string, options?: object) => Promise<any>} [fetchFn]
 * @returns {Promise<unknown>}
 */
export async function expandDamIdImageMarkdownDeep(value, fetchFn = makeApiRequest) {
  if (damResolveDisabled()) return normalizeDamIdImageMarkdownDeep(value);
  if (value == null) return value;
  if (typeof value === 'string') return expandDamIdImageMarkdown(value, fetchFn);
  if (Array.isArray(value)) {
    return Promise.all(value.map((v) => expandDamIdImageMarkdownDeep(v, fetchFn)));
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = await expandDamIdImageMarkdownDeep(v, fetchFn);
    }
    return out;
  }
  return value;
}
