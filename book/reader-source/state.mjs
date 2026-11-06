export const KEY = 'mercury-design-book:v1';
export const palettes = {
  light: { background: '#FFFFFF', foreground: '#000000', surface: '#F5F5F5', accent: '#4E46B4' },
  dark: { background: '#111113', foreground: '#EDEEF0', surface: '#212225', accent: '#B1A9FF' },
};
export const fonts = {
  mercury: '"DM Sans", system-ui, sans-serif',
  system: 'system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
};
export const defaults = () => ({ version: 1, theme: 'light', font: 'mercury', size: 1, leading: 1.75, measure: 68, units: 'rem', colors: { ...palettes.light } });
export function hex(value) {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value.trim())) throw new Error('Use a six-digit hex color, such as #4E46B4.');
  return value.trim().toUpperCase();
}
export function validate(value) {
  if (!value || typeof value !== 'object' || value.version !== 1) throw new Error('Unsupported preferences.');
  const next = defaults();
  if (!['light', 'dark'].includes(value.theme) || !Object.hasOwn(fonts, value.font) || !['rem', 'px'].includes(value.units)) throw new Error('Unsupported appearance.');
  for (const [key, min, max] of [['size', 1, 2], ['leading', 1.5, 2], ['measure', 45, 80]]) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < min || value[key] > max) throw new Error('Invalid reading dimensions.');
    next[key] = value[key];
  }
  for (const key of Object.keys(next.colors)) next.colors[key] = hex(value.colors?.[key]);
  return { ...next, theme: value.theme, font: value.font, units: value.units };
}
export function decode(raw) { return validate(JSON.parse(raw)); }
export function rgb(value) { const n = hex(value).slice(1); return [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16)); }
export function contrast(a, b) {
  const luminance = color => rgb(color).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((total, n, i) => total + n * [.2126, .7152, .0722][i], 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export const passes = (ratio, threshold = 4.5) => ratio >= threshold;
export function toPx(rem, root) {
  if (![rem, root].every(Number.isFinite) || root <= 0) throw new Error('A measured root size is required.');
  return Math.round(rem * root * 100) / 100;
}
export function tokens(value) {
  const v = validate(value);
  return { schema_version: 1, status: 'reader-experiment', source: 'Mercury interface edition 1.0', theme: v.theme,
    typography: { font_family: fonts[v.font], body_size_rem: v.size, line_height: v.leading, measure_ch: v.measure },
    colors: { '--bg-primary': rgb(v.colors.background).join(' '), '--fg-primary': rgb(v.colors.foreground).join(' '), '--bg-tertiary': rgb(v.colors.surface).join(' '), '--fg-brand': rgb(v.colors.accent).join(' ') } };
}
export function css(value) {
  const v = tokens(value);
  return '/* Reader experiment; not an approved Mercury brand revision. */\n.mercury-book-experiment {\n' + Object.entries(v.colors).map(([k, n]) => `  ${k}: ${n};`).join('\n') + `\n  --book-font: ${v.typography.font_family};\n  --book-size: ${v.typography.body_size_rem}rem;\n  --book-leading: ${v.typography.line_height};\n  --book-measure: ${v.typography.measure_ch}ch;\n  color: rgb(var(--fg-primary));\n  background: rgb(var(--bg-primary));\n  font: var(--book-size)/var(--book-leading) var(--book-font);\n  max-inline-size: var(--book-measure);\n}\n`;
}
export function safeHref(url) { return typeof url === 'string' && /^https:\/\/[^\s<>"']+$/.test(url) ? url : null; }
export function inline(text) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;
  return String(text).split(pattern).filter(Boolean).map(part => {
    if (part.startsWith('`') && part.endsWith('`')) return { type: 'code', text: part.slice(1, -1) };
    if (part.startsWith('**') && part.endsWith('**')) return { type: 'strong', text: part.slice(2, -2) };
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link && safeHref(link[2])) return { type: 'link', text: link[1], href: link[2] };
    return { type: 'text', text: part };
  });
}
