import { describe, expect, it } from 'vitest';
import { typeScale } from './type-scale';

describe('typeScale', () => {
  it('builds two steps below, base, and N above', () => {
    const scale = typeScale(16, 1.25, 3);
    expect(scale.map((s) => s.name)).toEqual(['xs', 'sm', 'base', 'lg', 'xl', '2xl']);
    expect(scale.find((s) => s.name === 'base')).toEqual({ name: 'base', px: 16, rem: '1rem' });
    expect(scale.find((s) => s.name === 'xl')?.px).toBe(25);
    expect(scale.find((s) => s.name === 'sm')?.px).toBe(12.8);
  });
  it('caps the number of steps above at the available names', () => {
    expect(typeScale(16, 1.2, 50)).toHaveLength(2 + 1 + 10);
  });
});
