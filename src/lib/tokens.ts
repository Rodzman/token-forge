import * as z from 'zod';

const tokenName = z.string().regex(/^[a-z][a-z0-9-]*$/, 'token names must be kebab-case (a-z, 0-9, -)');
const hexColor = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'expected a hex colour like #1a2b3c');

export const TokenSetSchema = z.object({
  name: z.string().min(1),
  colors: z.record(tokenName, hexColor),
  /** Spacing steps in px. */
  spacing: z.record(tokenName, z.number().nonnegative()),
  /** Border radii in px. */
  radii: z.record(tokenName, z.number().nonnegative()),
  typography: z.object({
    sans: z.string().min(1),
    mono: z.string().min(1),
    baseSize: z.number().min(8).max(32),
    ratio: z.number().min(1.01).max(2),
    stepsAbove: z.number().int().min(1).max(10),
  }),
});

export type TokenSet = z.infer<typeof TokenSetSchema>;

export const defaultTokens: TokenSet = {
  name: 'Forge default',
  colors: {
    primary: '#2f6fed',
    'primary-contrast': '#ffffff',
    accent: '#8a4fd8',
    surface: '#ffffff',
    'surface-muted': '#eef1f6',
    text: '#1c2130',
    'text-muted': '#5b6474',
    success: '#1f9d55',
    warning: '#e9a23b',
    danger: '#d64545',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
  radii: { sm: 4, md: 10, lg: 20, pill: 999 },
  typography: {
    sans: 'Inter, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
    baseSize: 16,
    ratio: 1.25,
    stepsAbove: 5,
  },
};

export type ParseResult = { ok: true; tokens: TokenSet } | { ok: false; error: string };

/** Parse and validate a tokens JSON document with readable error messages. */
export function parseTokens(json: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
  const result = TokenSetSchema.safeParse(data);
  if (result.success) return { ok: true, tokens: result.data };
  const lines = result.error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : '(root)';
    // Zod reports bad record keys generically; add the naming rule for humans.
    const message = issue.message.startsWith('Invalid key')
      ? `${issue.message} (token names must be kebab-case: a-z, 0-9, -)`
      : issue.message;
    return `${path}: ${message}`;
  });
  return { ok: false, error: lines.join('\n') };
}
