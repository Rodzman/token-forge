"use client";

import type { TokenSet } from "@/lib/tokens";
import { RATIO_PRESETS, typeScale } from "@/lib/type-scale";

interface Props {
  tokens: TokenSet;
  onChange: (next: TokenSet) => void;
}

export function TypographyPanel({ tokens, onChange }: Props) {
  const t = tokens.typography;
  const set = (patch: Partial<TokenSet["typography"]>) => onChange({ ...tokens, typography: { ...t, ...patch } });
  const scale = typeScale(t.baseSize, t.ratio, t.stepsAbove);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-muted">Sans family</span>
          <input value={t.sans} onChange={(e) => set({ sans: e.target.value })} className="w-full rounded-md border border-border bg-transparent px-2 py-1 font-mono text-xs" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Mono family</span>
          <input value={t.mono} onChange={(e) => set({ mono: e.target.value })} className="w-full rounded-md border border-border bg-transparent px-2 py-1 font-mono text-xs" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Base size (px)</span>
          <input
            type="number"
            min={8}
            max={32}
            value={t.baseSize}
            onChange={(e) => set({ baseSize: Math.min(32, Math.max(8, Number(e.target.value) || 16)) })}
            className="w-full rounded-md border border-border bg-transparent px-2 py-1 font-mono text-xs"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Scale ratio</span>
          <select
            value={String(t.ratio)}
            onChange={(e) => set({ ratio: Number(e.target.value) })}
            className="w-full rounded-md border border-border bg-transparent px-2 py-1 text-xs"
          >
            {RATIO_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.name} ({p.value})
              </option>
            ))}
            {!RATIO_PRESETS.some((p) => p.value === t.ratio) && <option value={t.ratio}>Custom ({t.ratio})</option>}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Steps above base: {t.stepsAbove}</span>
          <input type="range" min={1} max={10} value={t.stepsAbove} onChange={(e) => set({ stepsAbove: Number(e.target.value) })} className="w-full" />
        </label>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold">Type scale</h2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {[...scale].reverse().map((step) => (
            <li key={step.name} className="flex items-baseline gap-4 px-3 py-2">
              <span className="w-12 font-mono text-xs text-muted">{step.name}</span>
              <span className="w-24 font-mono text-xs text-muted">
                {step.px}px · {step.rem}
              </span>
              <span className="truncate" style={{ fontSize: step.px, fontFamily: t.sans, lineHeight: 1.2 }}>
                The quick brown fox
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
