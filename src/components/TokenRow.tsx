"use client";

interface Props {
  name: string;
  onRename: (next: string) => void;
  onRemove: () => void;
  children: React.ReactNode;
}

/** Shared row chrome: editable name on the left, control in the middle, remove on the right. */
export function TokenRow({ name, onRename, onRemove, children }: Props) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
      <input
        aria-label={`Token name ${name}`}
        value={name}
        onChange={(e) => onRename(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
        className="w-36 rounded-md border border-border bg-transparent px-2 py-1 font-mono text-xs"
      />
      <div className="flex flex-1 items-center gap-3">{children}</div>
      <button
        type="button"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
        className="rounded-md px-2 py-1 text-xs text-muted hover:bg-border hover:text-foreground"
      >
        ✕
      </button>
    </li>
  );
}

/** Rename a key in an object while preserving insertion order. */
export function renameKey<V>(obj: Record<string, V>, from: string, to: string): Record<string, V> {
  if (from === to || !to || to in obj) return obj;
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k === from ? to : k, v]));
}

export function uniqueKey(obj: Record<string, unknown>, base: string): string {
  if (!(base in obj)) return base;
  let i = 2;
  while (`${base}-${i}` in obj) i++;
  return `${base}-${i}`;
}
