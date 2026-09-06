import { describe, expect, it } from 'vitest';
import { contrastRatio, formatRatio, hslToRgb, parseHex, rgbToHsl, suggestAccessible, toHex, wcagLevel } from './color';

const hex = (s: string) => parseHex(s)!;

describe('parseHex / toHex', () => {
  it('accepts 3 and 6 digit forms with or without #', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('1A2b3C')).toEqual({ r: 26, g: 43, b: 60 });
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('red')).toBeNull();
  });
  it('round-trips and clamps', () => {
    expect(toHex(hex('#1a2b3c'))).toBe('#1a2b3c');
    expect(toHex({ r: 300, g: -5, b: 12.6 })).toBe('#ff000d');
  });
});

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio(hex('#000'), hex('#fff'))).toBeCloseTo(21, 5);
    expect(contrastRatio(hex('#fff'), hex('#fff'))).toBeCloseTo(1, 5);
    // #767676 on white is the classic "just passes AA" grey.
    expect(contrastRatio(hex('#767676'), hex('#ffffff'))).toBeCloseTo(4.54, 2);
    expect(contrastRatio(hex('#777777'), hex('#ffffff'))).toBeCloseTo(4.48, 2);
  });
  it('is symmetric', () => {
    expect(contrastRatio(hex('#2f6fed'), hex('#fff'))).toBe(contrastRatio(hex('#fff'), hex('#2f6fed')));
  });
});

describe('wcagLevel / formatRatio', () => {
  it('applies the 3 / 4.5 / 7 thresholds', () => {
    expect(wcagLevel(7)).toBe('AAA');
    expect(wcagLevel(6.99)).toBe('AA');
    expect(wcagLevel(4.5)).toBe('AA');
    expect(wcagLevel(4.49)).toBe('AA Large');
    expect(wcagLevel(3)).toBe('AA Large');
    expect(wcagLevel(2.99)).toBe('Fail');
  });
  it('formats truncated to 2 decimals', () => {
    expect(formatRatio(4.479)).toBe('4.47:1');
    expect(formatRatio(21)).toBe('21.00:1');
  });
});

describe('hsl conversion', () => {
  it('round-trips representative colours', () => {
    for (const c of ['#ff0000', '#00ff00', '#0000ff', '#2f6fed', '#8a4fd8', '#123456', '#808080']) {
      expect(toHex(hslToRgb(rgbToHsl(hex(c))))).toBe(c);
    }
  });
});

describe('suggestAccessible', () => {
  it('returns the input when it already passes', () => {
    expect(suggestAccessible(hex('#000'), hex('#fff'))).toEqual(hex('#000'));
  });
  it('darkens a light-on-white colour just enough to reach AA and keeps the hue', () => {
    const fg = hex('#8ab4f8');
    const fixed = suggestAccessible(fg, hex('#ffffff'), 4.5)!;
    expect(fixed).not.toBeNull();
    expect(contrastRatio(fixed, hex('#fff'))).toBeGreaterThanOrEqual(4.5);
    expect(Math.abs(rgbToHsl(fixed).h - rgbToHsl(fg).h)).toBeLessThanOrEqual(2);
    // Minimal change: one step lighter in lightness would fail again.
    const hsl = rgbToHsl(fixed);
    expect(contrastRatio(hslToRgb({ ...hsl, l: hsl.l + 0.02 }), hex('#fff'))).toBeLessThan(4.5);
  });
  it('lightens a dark-on-dark colour', () => {
    const fixed = suggestAccessible(hex('#333333'), hex('#111111'), 4.5)!;
    expect(rgbToHsl(fixed).l).toBeGreaterThan(0.3);
    expect(contrastRatio(fixed, hex('#111111'))).toBeGreaterThanOrEqual(4.5);
  });
  it('returns null when the target is unreachable', () => {
    expect(suggestAccessible(hex('#777777'), hex('#777777'), 21)).toBeNull();
  });
});
