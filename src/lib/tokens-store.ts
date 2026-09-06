import { useSyncExternalStore } from 'react';
import { loadTokens, saveTokens } from './storage';
import { defaultTokens, type TokenSet } from './tokens';

/**
 * A tiny external store so the UI can hydrate from localStorage without
 * setting state inside an effect: the server snapshot is always the defaults,
 * the client snapshot lazily loads what the user saved last time.
 */
let state: TokenSet = defaultTokens;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded(): void {
  if (loaded) return;
  loaded = true;
  const stored = loadTokens();
  if (stored) state = stored;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): TokenSet {
  ensureLoaded();
  return state;
}

export function getServerSnapshot(): TokenSet {
  return defaultTokens;
}

export function setTokens(next: TokenSet): void {
  state = next;
  saveTokens(next);
  for (const listener of listeners) listener();
}

/** Forget everything, as if the page were loaded fresh. For tests. */
export function resetTokensStore(): void {
  state = defaultTokens;
  loaded = false;
}

export function useTokens(): [TokenSet, (next: TokenSet) => void] {
  const tokens = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [tokens, setTokens];
}
