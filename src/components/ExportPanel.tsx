"use client";

import { useEffect, useRef, useState } from "react";
import { EXPORT_FORMATS, exportTokens, type ExportFormat } from "@/lib/export";
import { parseTokens, type TokenSet } from "@/lib/tokens";

interface Props {
  tokens: TokenSet;
  onChange: (next: TokenSet) => void;
}

export function ExportPanel({ tokens, onChange }: Props) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the "Copied" reset timer if the panel unmounts (e.g. the user switches tabs).
  useEffect(() => () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
  }, []);

  const code = exportTokens(tokens, format);
  const file = EXPORT_FORMATS.find((f) => f.id === format)?.file ?? "tokens.txt";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const doImport = () => {
    const result = parseTokens(draft);
    if (result.ok) {
      onChange(result.tokens);
      setImportError(null);
      setDraft("");
    } else {
      setImportError(result.error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-base font-semibold">Export</h2>
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={format === f.id}
              onClick={() => setFormat(f.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${format === f.id ? "bg-brand text-white" : "border border-border text-muted hover:text-foreground"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-background px-3 py-1.5 font-mono text-xs text-muted">
            <span>{file}</span>
            <button type="button" onClick={copy} className="rounded border border-border px-2 py-0.5 hover:text-foreground">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="max-h-96 overflow-auto rounded-b-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed" aria-label="Exported tokens">
            <code>{code}</code>
          </pre>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold">Import</h2>
        <p className="mb-2 text-sm text-muted">Paste a tokens JSON document (the &ldquo;Raw JSON&rdquo; export format). It is validated before replacing the current set.</p>
        <textarea
          aria-label="Tokens JSON to import"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          spellCheck={false}
          className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
          placeholder='{ "name": "My tokens", "colors": { ... }, ... }'
        />
        {importError && (
          <pre role="alert" className="mt-2 whitespace-pre-wrap rounded-md border border-red-500/50 bg-red-500/10 p-2 font-mono text-xs text-red-600 dark:text-red-300">
            {importError}
          </pre>
        )}
        <button type="button" onClick={doImport} disabled={!draft.trim()} className="mt-2 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
          Import tokens
        </button>
      </div>
    </div>
  );
}
