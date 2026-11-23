@docs/REACT_GUIDELINES.md
# Staff Gateway redesign

React 19 + Vite + Tailwind v4 + shadcn/ui (Radix base, RTL enabled). Bilingual EN / AR.
Figma file: `08wInfeJA5uiVFzMub0ZNs` (Staff Gateway Redesign).

## Translating Figma MCP output

`get_design_context` returns Tailwind with raw values such as
`bg-[var(--color\/glass-surface,rgba(255,255,255,0.55))]`. Never paste those as-is.
Map them to the tokens in `src/index.css`:

| Figma variable / value                   | Use                                    |
| ---------------------------------------- | -------------------------------------- |
| `color/brand/primary`, `primary-dark`, `on-primary` | `bg-primary`, `bg-primary-dark`, `text-on-primary` |
| `color/<name>` (text, text-muted, glass-surface, field, input-edge, hover …) | same name: `text-text-muted`, `bg-glass-surface`, `border-input-edge` |
| `status/<name>`                          | `text-destructive`, `bg-success-bg` …  |
| `tag/<name>`                             | `text-walaa`, `bg-direct-bg` …         |
| `chart/<name>`                           | `chart-` prefix: `bg-chart-series-3`   |
| Radius 22/18/14/20/12/8/6/999            | `rounded-card` / `block`·`section-card` / `field` / `textarea` / `icon-box` / `chart-box` / `tick` / `pill` |
| Spacing xs 4 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · 3xl 32 | Tailwind scale `1 · 2 · 3 · 4 · 5 · 6 · 8` (do **not** add `--spacing-sm/lg/xl`; they shadow `max-w-*`) |
| Layout spacing page 32 / page-mobile 16 / card 24 / card-mobile 18 / section 52 / grid-gap 16 | `p-page`, `px-page-mobile`, `p-card`, `p-card-mobile`, `gap-section`, `gap-grid-gap` |
| Glass/Section title · Body · Label · Caption · Button · Button small | `text-section-title` · `text-body` · `text-label` · `text-caption` · `text-button` · `text-button-sm` (12/18 hints: `text-hint`) |
| Primary glow drop shadow                 | `drop-shadow-primary-glow`             |
| Panel / Lift / Section card elevation    | `shadow-panel` / `shadow-lift` / `shadow-section-card` |

The default Tailwind palette is removed on purpose (`--color-*: initial`): `bg-blue-600` won't compile.
If a value has no token, raise it rather than hard-coding it.

## Rules

- Reuse `src/components/ui/*` (`Button`, `TextField`, `SelectField`, `TextareaField`, `Icon`) before writing markup.
- RTL: use logical utilities only (`ps-/pe-`, `ms-/me-`, `start-/end-`, `text-start`, `rounded-s-`), never `pl-/pr-/left-/right-`.
- Labels are sentence case; never `uppercase`. No letter-spacing on Arabic (`text-section-title` already zeroes it under `:lang(ar)`).
- Fonts: Outfit (Latin) and Noto Kufi Arabic (Arabic), weights 300/400/500/600 only.
- Icons from Figma go in `src/assets/icons` and are rendered with `<Icon>` (CSS mask, `currentColor`) so they follow the theme.
- UI strings live in `src/i18n/strings.ts`, with both `en` and `ar`.
- `cn()` in `src/lib/utils.ts` uses a tailwind-merge config extended with the custom font-size, radius and shadow tokens. Register new ones there.
- Preview a state: `?theme=dark|light|system&lang=ar|en`.
