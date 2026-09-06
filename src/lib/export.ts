import type { TokenSet } from './tokens';
import { typeScale } from './type-scale';

export type ExportFormat = 'css' | 'tailwind' | 'scss' | 'dtcg' | 'json';

export const EXPORT_FORMATS: ReadonlyArray<{ id: ExportFormat; label: string; file: string }> = [
  { id: 'css', label: 'CSS variables', file: 'tokens.css' },
  { id: 'tailwind', label: 'Tailwind v4 @theme', file: 'theme.css' },
  { id: 'scss', label: 'SCSS', file: '_tokens.scss' },
  { id: 'dtcg', label: 'Design Tokens (DTCG)', file: 'tokens.tokens.json' },
  { id: 'json', label: 'Raw JSON', file: 'tokens.json' },
];

interface Flat {
  colors: [string, string][];
  spacing: [string, string][];
  radii: [string, string][];
  fonts: [string, string][];
  text: [string, string][];
}

function flatten(t: TokenSet): Flat {
  const px = (n: number) => `${n}px`;
  return {
    colors: Object.entries(t.colors),
    spacing: Object.entries(t.spacing).map(([k, v]) => [k, px(v)]),
    radii: Object.entries(t.radii).map(([k, v]) => [k, px(v)]),
    fonts: [
      ['sans', t.typography.sans],
      ['mono', t.typography.mono],
    ],
    text: typeScale(t.typography.baseSize, t.typography.ratio, t.typography.stepsAbove).map((s) => [s.name, s.rem]),
  };
}

function cssBlock(selector: string, f: Flat, prefixes: Record<keyof Flat, string>): string {
  const lines: string[] = [];
  (Object.keys(f) as (keyof Flat)[]).forEach((group, i) => {
    if (i > 0) lines.push('');
    lines.push(`  /* ${group} */`);
    for (const [k, v] of f[group]) lines.push(`  --${prefixes[group]}-${k}: ${v};`);
  });
  return `${selector} {\n${lines.join('\n')}\n}\n`;
}

export function toCssVariables(t: TokenSet): string {
  return `/* ${t.name} */\n` + cssBlock(':root', flatten(t), { colors: 'color', spacing: 'space', radii: 'radius', fonts: 'font', text: 'text' });
}

/** Tailwind v4 CSS-first theme: namespaces map to utilities (bg-primary, p-md, rounded-lg, font-sans, text-xl). */
export function toTailwindTheme(t: TokenSet): string {
  return `/* ${t.name} — import after "tailwindcss" */\n` + cssBlock('@theme', flatten(t), { colors: 'color', spacing: 'spacing', radii: 'radius', fonts: 'font', text: 'text' });
}

export function toScss(t: TokenSet): string {
  const f = flatten(t);
  const out: string[] = [`// ${t.name}`];
  const groups: [keyof Flat, string][] = [['colors', 'color'], ['spacing', 'space'], ['radii', 'radius'], ['fonts', 'font'], ['text', 'text']];
  for (const [group, prefix] of groups) {
    out.push('', `// ${group}`);
    for (const [k, v] of f[group]) out.push(`$${prefix}-${k}: ${v};`);
    out.push(`$${group}: (`);
    out.push(...f[group].map(([k]) => `  "${k}": $${prefix}-${k},`));
    out.push(');');
  }
  return out.join('\n') + '\n';
}

/**
 * W3C Design Tokens Community Group format (draft). Uses `$type`/`$value`
 * with string dimensions; check the current draft before feeding this to a
 * specific tool, as the dimension shape has changed between drafts.
 */
export function toDtcg(t: TokenSet): string {
  const f = flatten(t);
  const group = (entries: [string, string][], type: string) =>
    Object.fromEntries(entries.map(([k, v]) => [k, { $type: type, $value: v }]));
  const doc = {
    color: group(f.colors, 'color'),
    space: group(f.spacing, 'dimension'),
    radius: group(f.radii, 'dimension'),
    font: group(f.fonts, 'fontFamily'),
    text: group(f.text, 'dimension'),
  };
  return JSON.stringify(doc, null, 2) + '\n';
}

export function exportTokens(t: TokenSet, format: ExportFormat): string {
  switch (format) {
    case 'css':
      return toCssVariables(t);
    case 'tailwind':
      return toTailwindTheme(t);
    case 'scss':
      return toScss(t);
    case 'dtcg':
      return toDtcg(t);
    case 'json':
      return JSON.stringify(t, null, 2) + '\n';
  }
}
