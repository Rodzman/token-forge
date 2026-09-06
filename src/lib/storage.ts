import { parseTokens, type TokenSet } from './tokens';

export const STORAGE_KEY = 'token-forge:tokens';

/** localStorage can be missing or throw (private mode, SSR); treat it as best-effort. */
export function loadTokens(): TokenSet | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseTokens(raw);
    return parsed.ok ? parsed.tokens : null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: TokenSet): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    /* ignore */
  }
}
