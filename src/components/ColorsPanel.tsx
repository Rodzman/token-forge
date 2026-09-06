"use client";

import { useState } from "react";
import { contrastRatio, formatRatio, parseHex, suggestAccessible, toHex, wcagLevel, type WcagLevel } from "@/lib/color";
import type { TokenSet } from "@/lib/tokens";
import { TokenRow, renameKey, uniqueKey } from "./TokenRow";

interface Props {
  tokens: TokenSet;
  onChange: (next: TokenSet) => void;
}

const LEVEL_STYLE: Record<WcagLevel, string> = {
  AAA: "bg-emerald-600 text-white",
  AA: "bg-emerald-500/90 text-white",
  "AA Large": "bg-amber-400 text-black",
  Fail: "bg-red-500 text-white",
};

export function ColorsPanel({ tokens, onChange }: Props) {
  const [target, setTarget] = useState<4.5 | 7>(4.5);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const names = Object.keys(tokens.colors);

  const setColor = (name: string, hex: string) => onChange({ ...tokens, colors: { ...tokens.colors, [name]: hex } });

  const onHexInput = (name: string, value: string) => {
    setDrafts({ ...drafts, [name]: value });
    const rgb = parseHex(value);
    if (rgb) {
      setColor(name, toHex(rgb));
      const { [name]: _drop, ...rest } = drafts;
      void _drop;
      setDrafts(rest);
    }
  };

  const add = () => {
    const key = uniqueKey(tokens.colors, "new-color");
    onChange({ ...tokens, colors: { ...tokens.colors, [key]: "#888888" } });
  };

  const remove = (name: string) => {
    const { [name]: _removed, ...rest } = tokens.colors;
    void _removed;
    onChange({ ...tokens, colors: rest });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold">Colour tokens</h2>
        <p className="mb-3 text-sm text-muted">Hex values. Names become CSS variables like <code className="font-mono">--color-primary</code>.</p>
        <ul className="space-y-2">
          {names.map((name) => {
            const value = tokens.colors[name] as string;
            const draft = drafts[name] ?? value;
            return (
              <TokenRow
                key={name}
                name={name}
                onRename={(next) => onChange({ ...tokens, colors: renameKey(tokens.colors, name, next) })}
                onRemove={() => remove(name)}
              >
                <input
                  type="color"
                  aria-label={`Pick ${name}`}
                  value={value}
                  onChange={(e) => setColor(name, e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
                />
                <input
                  aria-label={`Hex for ${name}`}
                  value={draft}
                  onChange={(e) => onHexInput(name, e.target.value)}
                  aria-invalid={parseHex(draft) ? undefined : true}
                  className="w-28 rounded-md border border-border bg-transparent px-2 py-1 font-mono text-xs aria-[invalid]:border-red-500"
                />
              </TokenRow>
            );
          })}
        </ul>
        <button type="button" onClick={add} className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-border/50">
          + Add colour
        </button>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Contrast matrix</h2>
            <p className="text-sm text-muted">
              Every token as text (rows) on every token as background (columns), graded against WCAG 2.1.
            </p>
          </div>
          <fieldset className="flex items-center gap-2 text-sm">
            <legend className="sr-only">Fix target</legend>
            <span className="text-muted">Fix to</span>
            {([4.5, 7] as const).map((t) => (
              <label key={t} className="flex items-center gap-1">
                <input type="radio" name="target" checked={target === t} onChange={() => setTarget(t)} />
                {t === 4.5 ? "AA (4.5:1)" : "AAA (7:1)"}
              </label>
            ))}
          </fieldset>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1 text-xs" aria-label="Contrast matrix">
            <thead>
              <tr>
                <th scope="col" className="text-left font-normal text-muted">text ↓ / background →</th>
                {names.map((bg) => (
                  <th key={bg} scope="col" className="font-mono font-normal">
                    <span className="inline-block h-3 w-3 rounded-sm border border-border align-middle" style={{ background: tokens.colors[bg] }} /> {bg}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {names.map((fg) => (
                <tr key={fg}>
                  <th scope="row" className="text-left font-mono font-normal">
                    <span className="inline-block h-3 w-3 rounded-sm border border-border align-middle" style={{ background: tokens.colors[fg] }} /> {fg}
                  </th>
                  {names.map((bg) => {
                    if (fg === bg) return <td key={bg} className="text-center text-muted">—</td>;
                    const f = parseHex(tokens.colors[fg] as string)!;
                    const b = parseHex(tokens.colors[bg] as string)!;
                    const ratio = contrastRatio(f, b);
                    const level = wcagLevel(ratio);
                    const needsFix = ratio < target;
                    const suggestion = needsFix ? suggestAccessible(f, b, target) : null;
                    return (
                      <td key={bg} className="align-top">
                        <div
                          className="rounded-md border border-border p-1.5 text-center"
                          style={{ background: tokens.colors[bg], color: tokens.colors[fg] }}
                          data-testid={`cell-${fg}-${bg}`}
                        >
                          <div className="font-semibold">{formatRatio(ratio)}</div>
                          <span className={`inline-block rounded px-1 text-[10px] font-semibold ${LEVEL_STYLE[level]}`}>{level}</span>
                          {needsFix && (
                            <div className="mt-1">
                              {suggestion ? (
                                <button
                                  type="button"
                                  onClick={() => setColor(fg, toHex(suggestion))}
                                  title={`Change ${fg} to ${toHex(suggestion)}`}
                                  className="rounded bg-white/90 px-1 font-mono text-[10px] text-black hover:bg-white"
                                >
                                  fix → {toHex(suggestion)}
                                </button>
                              ) : (
                                <span className="text-[10px] opacity-70">no fix at this hue</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">
          &ldquo;fix&rdquo; keeps the hue and saturation of the text colour and moves its lightness the smallest amount that reaches the target.
        </p>
      </div>
    </div>
  );
}
