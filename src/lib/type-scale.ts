export interface TypeStep {
  name: string;
  /** Font size in px, rounded to 2 decimals. */
  px: number;
  /** Relative to the base size, e.g. "1.25rem". */
  rem: string;
}

const ABOVE = ['lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];
const BELOW = ['sm', 'xs'];

/** Modular type scale: base size multiplied by `ratio` per step, 2 steps below and `stepsAbove` above. */
export function typeScale(baseSize: number, ratio: number, stepsAbove: number): TypeStep[] {
  const steps: TypeStep[] = [];
  const make = (name: string, exponent: number): TypeStep => {
    const px = Math.round(baseSize * ratio ** exponent * 100) / 100;
    return { name, px, rem: `${Math.round((px / baseSize) * 1000) / 1000}rem` };
  };
  for (let i = BELOW.length; i >= 1; i--) steps.push(make(BELOW[i - 1] as string, -i));
  steps.push(make('base', 0));
  for (let i = 1; i <= Math.min(stepsAbove, ABOVE.length); i++) steps.push(make(ABOVE[i - 1] as string, i));
  return steps;
}

export const RATIO_PRESETS: ReadonlyArray<{ name: string; value: number }> = [
  { name: 'Minor second', value: 1.067 },
  { name: 'Major second', value: 1.125 },
  { name: 'Minor third', value: 1.2 },
  { name: 'Major third', value: 1.25 },
  { name: 'Perfect fourth', value: 1.333 },
  { name: 'Augmented fourth', value: 1.414 },
  { name: 'Perfect fifth', value: 1.5 },
  { name: 'Golden ratio', value: 1.618 },
];
