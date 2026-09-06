"use client";

import { useState } from "react";
import { defaultTokens } from "@/lib/tokens";
import { useTokens } from "@/lib/tokens-store";
import { ColorsPanel } from "./ColorsPanel";
import { SpacingPanel } from "./SpacingPanel";
import { TypographyPanel } from "./TypographyPanel";
import { ExportPanel } from "./ExportPanel";
import { Preview } from "./Preview";

const TABS = [
  { id: "colors", label: "Colours" },
  { id: "spacing", label: "Spacing & radii" },
  { id: "typography", label: "Typography" },
  { id: "export", label: "Import / export" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Studio() {
  const [tokens, setTokens] = useTokens();
  const [tab, setTab] = useState<TabId>("colors");

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 rounded-2xl border border-border bg-panel">
        <div role="tablist" aria-label="Token groups" className="flex flex-wrap gap-1 border-b border-border p-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={tab === t.id ? `panel-${t.id}` : undefined}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-brand text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 pr-1">
            <label className="sr-only" htmlFor="set-name">
              Token set name
            </label>
            <input
              id="set-name"
              value={tokens.name}
              onChange={(e) => setTokens({ ...tokens, name: e.target.value })}
              className="w-40 rounded-md border border-border bg-transparent px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => setTokens(defaultTokens)}
              className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="p-5">
          {tab === "colors" && <ColorsPanel tokens={tokens} onChange={setTokens} />}
          {tab === "spacing" && <SpacingPanel tokens={tokens} onChange={setTokens} />}
          {tab === "typography" && <TypographyPanel tokens={tokens} onChange={setTokens} />}
          {tab === "export" && <ExportPanel tokens={tokens} onChange={setTokens} />}
        </div>
      </section>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Preview tokens={tokens} />
      </aside>
    </main>
  );
}
