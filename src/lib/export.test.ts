import { describe, expect, it } from 'vitest';
import { exportTokens, toCssVariables, toDtcg, toScss, toTailwindTheme } from './export';
import { defaultTokens, type TokenSet } from './tokens';

const small: TokenSet = {
  name: 'Mini',
  colors: { primary: '#2f6fed' },
  spacing: { sm: 8 },
  radii: { md: 10 },
  typography: { sans: 'Inter, sans-serif', mono: 'monospace', baseSize: 16, ratio: 1.25, stepsAbove: 1 },
};

describe('exports', () => {
  it('emits CSS custom properties grouped by kind', () => {
    const css = toCssVariables(small);
    expect(css).toContain(':root {');
    expect(css).toContain('--color-primary: #2f6fed;');
    expect(css).toContain('--space-sm: 8px;');
    expect(css).toContain('--radius-md: 10px;');
    expect(css).toContain('--font-sans: Inter, sans-serif;');
    expect(css).toContain('--text-base: 1rem;');
    expect(css).toContain('--text-lg: 1.25rem;');
    expect(css).toContain('--text-xs: 0.64rem;');
  });

  it('uses Tailwind v4 namespaces', () => {
    const tw = toTailwindTheme(small);
    expect(tw).toContain('@theme {');
    expect(tw).toContain('--spacing-sm: 8px;');
    expect(tw).toContain('--color-primary: #2f6fed;');
  });

  it('emits SCSS variables and maps', () => {
    const scss = toScss(small);
    expect(scss).toContain('$color-primary: #2f6fed;');
    expect(scss).toContain('$colors: (');
    expect(scss).toContain('"primary": $color-primary,');
  });

  it('emits DTCG-style typed tokens as valid JSON', () => {
    const doc = JSON.parse(toDtcg(small));
    expect(doc.color.primary).toEqual({ $type: 'color', $value: '#2f6fed' });
    expect(doc.space.sm).toEqual({ $type: 'dimension', $value: '8px' });
  });

  it('exportTokens dispatches every format', () => {
    for (const f of ['css', 'tailwind', 'scss', 'dtcg', 'json'] as const) {
      expect(exportTokens(defaultTokens, f).length).toBeGreaterThan(50);
    }
    expect(JSON.parse(exportTokens(defaultTokens, 'json'))).toEqual(defaultTokens);
  });
});
