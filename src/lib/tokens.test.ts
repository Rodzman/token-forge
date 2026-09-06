import { describe, expect, it } from 'vitest';
import { defaultTokens, parseTokens } from './tokens';

describe('parseTokens', () => {
  it('round-trips the default token set', () => {
    const result = parseTokens(JSON.stringify(defaultTokens));
    expect(result).toEqual({ ok: true, tokens: defaultTokens });
  });

  it('reports invalid JSON', () => {
    const result = parseTokens('{ nope');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Invalid JSON/);
  });

  it('reports schema errors with paths', () => {
    const bad = { ...defaultTokens, colors: { Primary: '#fff', ok: 'blue' }, spacing: { sm: -1 } };
    const result = parseTokens(JSON.stringify(bad));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/kebab-case/);
      expect(result.error).toMatch(/colors\.ok: expected a hex colour/);
      expect(result.error).toMatch(/spacing\.sm/);
    }
  });
});
