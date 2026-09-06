# Token Forge

A design-tokens studio with a built-in WCAG contrast audit, built with
Next.js 16, React 19, TypeScript and Tailwind CSS v4.

Edit colours, spacing, radii and a modular type scale; watch a live preview
update; see **every** foreground/background pair graded against WCAG 2.1 in a
contrast matrix; fix failing pairs with one click; and export the whole set to
CSS variables, a Tailwind v4 `@theme` block, SCSS, or the W3C Design Tokens
(DTCG) draft format.

## Why this exists

Most palette tools check one pair at a time. Real interfaces combine every
colour with every other colour eventually, so the matrix view catches the
combinations nobody thought to test. The one-click fix keeps the hue and
saturation a designer chose and only moves lightness the minimal amount needed,
so the fix is something a designer would accept rather than "just use black".

## Features

- **Contrast matrix**: all colour tokens as text on all colour tokens as
  background, graded AAA / AA / AA Large / Fail with the exact ratio.
- **Fix in place**: choose AA (4.5:1) or AAA (7:1) as the target; each failing
  cell offers the closest accessible shade of the same hue.
- **Type scale**: base size plus a musical ratio (minor third, perfect fourth,
  golden ratio...) generates `xs` to `9xl` steps in px and rem.
- **Exports**: CSS custom properties, Tailwind v4 `@theme` namespaces
  (`--color-*`, `--spacing-*`, `--radius-*`, `--font-*`, `--text-*`), SCSS
  variables and maps, DTCG-style JSON, raw JSON.
- **Import** with validation (Zod) and readable error paths.
- **Persistence** in `localStorage`, guarded so private mode and SSR work.
- Keyboard-accessible tabs (`role="tablist"`), labelled inputs, dark mode via
  `prefers-color-scheme`.

## Running

```sh
npm install
npm run dev        # http://localhost:3000
```

```sh
npm run lint       # eslint (next/core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit
npm test           # vitest, jsdom + Testing Library
npm run build      # production build
```

## Project layout

```
src/lib/color.ts        hex parsing, relative luminance, contrast ratio, WCAG levels,
                        HSL conversion, minimal-change accessible shade search
src/lib/tokens.ts       Zod schema, defaults, parseTokens with readable errors
src/lib/type-scale.ts   modular scale generator and ratio presets
src/lib/export.ts       CSS / Tailwind / SCSS / DTCG / JSON serialisers
src/lib/storage.ts      guarded localStorage
src/components/         Studio (state + tabs), ColorsPanel (matrix), SpacingPanel,
                        TypographyPanel, ExportPanel, Preview
```

All colour math lives in pure functions with unit tests against the WCAG
reference values (for example `#767676` on white is 4.54:1, the well-known
"just passes AA" grey). Component tests drive the real UI with
`@testing-library/user-event`: type a failing colour, watch the cell turn to
Fail, click fix, watch it pass.

## Notes and limitations

- Contrast is WCAG 2.1 (luminance ratio). APCA / WCAG 3 is not implemented.
- The DTCG export follows the Community Group draft's `$type` / `$value`
  shape with string dimensions. The draft has changed the dimension shape over
  time, so check the tool you are feeding it into.
- The suggestion search only moves lightness. If no lightness of that hue
  reaches the target (for example two mid-greys at 21:1), it says so instead of
  inventing a different colour.

## License

MIT
