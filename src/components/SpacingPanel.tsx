"use client";

import type { TokenSet } from "@/lib/tokens";
import { TokenRow, renameKey, uniqueKey } from "./TokenRow";

interface Props {
  tokens: TokenSet;
  onChange: (next: TokenSet) => void;
}

type Group = "spacing" | "radii";

export function SpacingPanel({ tokens, onChange }: Props) {
  const update = (group: Group, next: Record<string, number>) => onChange({ ...tokens, [group]: next });

  const renderGroup = (group: Group, title: string, hint: string, preview: (v: number) => React.ReactNode) => {
    const entries = Object.entries(tokens[group]);
    return (
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mb-3 text-sm text-muted">{hint}</p>
        <ul className="space-y-2">
          {entries.map(([name, value]) => (
            <TokenRow
              key={name}
              name={name}
              onRename={(next) => update(group, renameKey(tokens[group], name, next))}
              onRemove={() => {
                const { [name]: _removed, ...rest } = tokens[group];
                void _removed;
                update(group, rest);
              }}
            >
              <input
                type="number"
                min={0}
                aria-label={`${title} ${name} in px`}
                value={value}
                onChange={(e) => update(group, { ...tokens[group], [name]: Math.max(0, Number(e.target.value) || 0) })}
                className="w-20 rounded-md border border-border bg-transparent px-2 py-1 font-mono text-xs"
              />
              <span className="text-xs text-muted">px</span>
              {preview(value)}
            </TokenRow>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => update(group, { ...tokens[group], [uniqueKey(tokens[group], "new")]: 8 })}
          className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-border/50"
        >
          + Add {group === "spacing" ? "space" : "radius"}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderGroup("spacing", "Spacing", "Used for padding, gaps and margins.", (v) => (
        <span className="h-3 rounded-sm bg-brand" style={{ width: Math.min(v, 200) }} aria-hidden />
      ))}
      {renderGroup("radii", "Radii", "Corner rounding for cards, inputs and buttons.", (v) => (
        <span className="h-6 w-10 border-2 border-brand" style={{ borderRadius: Math.min(v, 24) }} aria-hidden />
      ))}
    </div>
  );
}
