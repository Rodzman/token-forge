import type { CSSProperties } from "react";
import { contrastRatio, formatRatio, parseHex, wcagLevel } from "@/lib/color";
import type { TokenSet } from "@/lib/tokens";
import { typeScale } from "@/lib/type-scale";

interface Props {
  tokens: TokenSet;
}

/** Live sample UI driven entirely by the current tokens through CSS variables. */
export function Preview({ tokens }: Props) {
  const c = (name: string, fallback: string) => tokens.colors[name] ?? fallback;
  const s = (name: string, fallback: number) => `${tokens.spacing[name] ?? fallback}px`;
  const r = (name: string, fallback: number) => `${tokens.radii[name] ?? fallback}px`;
  const scale = typeScale(tokens.typography.baseSize, tokens.typography.ratio, tokens.typography.stepsAbove);
  const size = (name: string) => `${scale.find((x) => x.name === name)?.px ?? tokens.typography.baseSize}px`;

  const vars = {
    "--p-surface": c("surface", "#ffffff"),
    "--p-surface-muted": c("surface-muted", "#eeeeee"),
    "--p-text": c("text", "#111111"),
    "--p-text-muted": c("text-muted", "#666666"),
    "--p-primary": c("primary", "#2f6fed"),
    "--p-primary-contrast": c("primary-contrast", "#ffffff"),
    "--p-accent": c("accent", "#8a4fd8"),
    "--p-danger": c("danger", "#d64545"),
    "--p-sans": tokens.typography.sans,
    "--p-mono": tokens.typography.mono,
  } as CSSProperties;

  const primary = parseHex(c("primary", "#2f6fed"));
  const primaryContrast = parseHex(c("primary-contrast", "#ffffff"));
  const buttonRatio = primary && primaryContrast ? contrastRatio(primary, primaryContrast) : null;

  return (
    <div className="rounded-2xl border border-border bg-panel p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted">Live preview</h2>
      <div
        style={{ ...vars, background: "var(--p-surface)", color: "var(--p-text)", fontFamily: "var(--p-sans)", padding: s("lg", 24), borderRadius: r("lg", 20), border: "1px solid var(--p-surface-muted)" }}
        data-testid="preview-card"
      >
        <span style={{ display: "inline-block", background: "var(--p-accent)", color: "var(--p-primary-contrast)", padding: `2px ${s("sm", 8)}`, borderRadius: r("pill", 999), fontSize: size("xs"), fontFamily: "var(--p-mono)" }}>
          {tokens.name}
        </span>
        <h3 style={{ fontSize: size("2xl"), lineHeight: 1.15, margin: `${s("md", 16)} 0 ${s("xs", 4)}`, fontWeight: 700 }}>Ship tokens with confidence</h3>
        <p style={{ color: "var(--p-text-muted)", fontSize: size("base"), margin: `0 0 ${s("md", 16)}`, lineHeight: 1.6 }}>
          Every colour pair is graded live. Exports stay in sync with what you see here.
        </p>
        <div style={{ display: "flex", gap: s("sm", 8), flexWrap: "wrap" }}>
          <button type="button" style={{ background: "var(--p-primary)", color: "var(--p-primary-contrast)", border: 0, padding: `${s("sm", 8)} ${s("md", 16)}`, borderRadius: r("md", 10), fontSize: size("base"), fontWeight: 600 }}>
            Primary action
          </button>
          <button type="button" style={{ background: "var(--p-surface-muted)", color: "var(--p-text)", border: 0, padding: `${s("sm", 8)} ${s("md", 16)}`, borderRadius: r("md", 10), fontSize: size("base") }}>
            Secondary
          </button>
        </div>
        <div style={{ marginTop: s("md", 16), background: "var(--p-surface-muted)", padding: s("sm", 8), borderRadius: r("sm", 4), fontFamily: "var(--p-mono)", fontSize: size("sm") }}>
          <code>--color-primary: {c("primary", "#2f6fed")}</code>
        </div>
      </div>
      {buttonRatio !== null && (
        <p className="mt-3 text-xs text-muted">
          Button text contrast: <span className="font-mono">{formatRatio(buttonRatio)}</span> ({wcagLevel(buttonRatio)})
        </p>
      )}
      <p className="mt-1 text-xs text-muted">
        The preview looks for tokens named <code className="font-mono">surface</code>, <code className="font-mono">text</code>, <code className="font-mono">primary</code>, <code className="font-mono">primary-contrast</code>, <code className="font-mono">accent</code> and spacing/radii <code className="font-mono">xs sm md lg pill</code>.
      </p>
    </div>
  );
}
