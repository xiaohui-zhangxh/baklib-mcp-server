/**
 * Rewrite shorthand DAM image markdown before calling Baklib APIs.
 *
 * Public / documented form: `![alt](dam-id=<iid>)` where `<iid>` is
 * `attributes.iid` from `dam_upload_entity` (not JSON:API `data.id`).
 * Also accepts `![alt](dam-id:<iid>)` in the link destination only (colon
 * is normalized to the same pipeline as equals for this shorthand).
 *
 * The server-side BKE parser expects `dam-id` in the image link title;
 * this module expands the shorthand so callers only need the documented form.
 */

const DAM_ID_SHORT_IMG = /!\[([^\]]*)\]\(\s*dam-id\s*[:=]\s*(\d+)\s*\)/g;

/**
 * @param {string} input
 * @returns {string}
 */
export function normalizeDamIdImageMarkdown(input) {
  if (typeof input !== 'string' || input.length === 0) return input;
  return input.replace(DAM_ID_SHORT_IMG, '![$1](<> "dam-id=$2")');
}

/**
 * Walk JSON-like structures (objects, arrays) and normalize every string leaf.
 * Used for site `template_variables` where rich text may nest in values.
 *
 * @param {unknown} value
 * @returns {unknown}
 */
export function normalizeDamIdImageMarkdownDeep(value) {
  if (value == null) return value;
  if (typeof value === 'string') return normalizeDamIdImageMarkdown(value);
  if (Array.isArray(value)) return value.map((v) => normalizeDamIdImageMarkdownDeep(v));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeDamIdImageMarkdownDeep(v);
    }
    return out;
  }
  return value;
}
