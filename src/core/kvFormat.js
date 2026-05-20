/**
 * 自定义键值文本格式（"key" value）的解析与序列化。
 * 用于编辑、导入、导出操作。
 */

// HTML 转义，防止 XSS 和显示错乱
const ESCAPE_CHARS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};
export const escapeHTML = str => str.replace(/[&<>"]/g, char => ESCAPE_CHARS[char]);

/**
 * 解析一行文本，提取双引号包裹的键和剩余部分作为值。
 * 例：  "apple | fruit | red" A sweet red fruit
 * 返回： { key: "apple | fruit | red", value: "A sweet red fruit" }
 */
function parseKVLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//')) return null;

  let i = 0;
  while (i < trimmed.length && trimmed[i] === ' ') i++;
  if (i >= trimmed.length || trimmed[i] !== '"') return null;

  i++;
  let key = '';
  let escaped = false;

  for (; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (escaped) {
      key += c;
      escaped = false;
      continue;
    }
    if (c === '\\') { escaped = true; continue; }
    if (c === '"') { i++; break; }
    key += c;
  }

  const value = trimmed.slice(i).trim();
  return { key, value };
}

/**
 * 解析完整的键值文本。
 * 格式：若干行 "key" value，用 "---" 分隔可选的频率区。
 * 频率区每行格式："key" number
 * @param {string} text
 * @returns {{ tags: Array<{key: string, value: string}>, freqs: Record<string, number> }}
 */
export function parseKVText(text) {
  const lines = text.split('\n');
  const tags = [];
  const freqs = {};
  let inFreq = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed === '---') { inFreq = true; continue; }

    const parsed = parseKVLine(trimmed);
    if (!parsed) continue;

    if (inFreq) {
      const n = parseInt(parsed.value, 10);
      if (!isNaN(n) && n > 0) freqs[parsed.key] = n;
    } else {
      tags.push(parsed);
    }
  }

  return { tags, freqs };
}

/**
 * 转义键中的反斜杠和双引号，保证用双引号包裹时不破坏边界。
 * 只做最小转义，与 parseKVLine 配合保证可逆。
 */
export function escapeKVKey(key) {
  return key.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * 将键值格式化为一行 "key" value
 */
export function formatKVEntry(key, value) {
  return `"${escapeKVKey(key)}" ${value}`;
}
