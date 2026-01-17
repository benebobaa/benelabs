# AGENTS Guide for Benelabs Astro

## Purpose
- Agent-facing runbook for this repo; root scope covers the whole project including `sanity-studio/`.
- Favor minimal diffs, deterministic builds, and keep content grounded in the existing patterns.
- No Cursor or Copilot rule files detected; this document is the source of truth.

## Core Commands (root project)
- `npm install`: install dependencies (Astro + Tailwind + Mixpanel + Sanity client).
- `npm run dev`: start Astro dev server.
- `npm run build`: production build; primary regression check.
- `npm run preview`: serve the built site for QA.
- `npm run astro -- check`: type/syntax check via Astro CLI.
- `npm run astro -- <cmd>`: pass-through to other Astro CLI utilities when needed.
- `npm run seed:sanity`: seed a remote Sanity dataset (requires env vars below).

## Sanity Studio Commands (in `sanity-studio/`)
- Run inside `sanity-studio`: `npm install` then `npm run dev|build|start|deploy` via `scripts/run.mjs`.
- Studio uses `sanity` v3 with React 18; `.sanity/runtime` is generated—do not edit.
- Avoid touching `sanity-studio/node_modules/`; prefer schema edits in `sanity-studio/schemas/`.

## Tests and Linting
- No automated tests or linters are configured in either workspace.
- There is no single-test command today. If you add tests, expose `npm test` plus `npm test -- <pattern>` and document the runner here.
- For now, rely on `npm run build` and targeted manual checks of `/`, `/blog`, `/projects`, `/contact`.

## Repository Layout
- `src/pages/`: route-level Astro files; dynamic routes use bracketed params (e.g., `blog/[slug].astro`).
- `src/components/`: shared UI in PascalCase (e.g., `SiteHeader.astro`, `TagList.astro`).
- `src/layouts/`: wrappers like `BaseLayout.astro`—every page should opt into it for meta tags and structure.
- `src/lib/`: data helpers (`sanity.ts`, `format.ts`), shared types (`types.ts`), and fallback content (`sample-content.ts`).
- `src/styles/global.css`: Tailwind 4 setup, design tokens, utilities, and bespoke classes (e.g., `.card-surface`, `.tag-chip`).
- `public/`: static assets and SEO files (`robots.txt`, `sitemap.xml`, `og/`).
- `scripts/seed-sanity.mjs`: CLI seeding utility for Sanity content.
- `sanity-studio/`: standalone Sanity Studio project; keep schemas in sync with frontend expectations.

## Environment Variables
- `.env` at repo root drives both Astro and seeding. Required for live Sanity: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_TOKEN`, optional `SANITY_API_VERSION`, `SANITY_USE_CDN`.
- Public analytics/env: `PUBLIC_MIXPANEL_TOKEN`, `PUBLIC_MIXPANEL_API_HOST`, `PUBLIC_MIXPANEL_AUTOCAPTURE`, `PUBLIC_MIXPANEL_TRACK_PAGEVIEW`, `PUBLIC_MIXPANEL_SESSION_REPLAY`, `PUBLIC_MIXPANEL_SESSION_REPLAY_PERCENT`.
- Server analytics/env: `MIXPANEL_PROJECT_TOKEN`, `MIXPANEL_API_HOST`.
- Astro falls back to `src/lib/sample-content.ts` when Sanity vars are missing; do not break this offline path.
- Keep secrets out of the repo; update `.env.example` if new variables are introduced.

## Data & Content Flow
- Fetch data through `src/lib/sanity.ts`; prefer extending helpers over ad-hoc queries.
- Sample content mirrors Sanity shapes; maintain parity when adding fields.
- `format.ts` holds presentation helpers (dates, durations); reuse instead of duplicating logic.
- `getBlogPosts`/`getProjects` coerce Portable Text to HTML; honor escape/cleanup logic when adding fields.

## Astro Page Conventions
- Each page imports `BaseLayout` and sets `title`, `description`, and Open Graph props via layout props.
- Use `Astro.site` for canonical URLs; always pass canonical-friendly `ogImage` when adding new OG assets.
- Keep frontmatter minimal; compute defaults inside frontmatter with `const` and pure functions.
- Mark analytics attributes where needed (`data-analytics`, `data-analytics-content`, `data-analytics-slug`).

## Component Patterns
- Components in PascalCase; props read from `Astro.props` with defaults (`const { prop = default } = Astro.props`).
- Favor small presentational components; keep data fetching in pages or `lib/` utilities.
- For conditional rendering, return `null` instead of empty wrappers; see `TagList.astro` pattern.
- Reuse shared classes from `global.css` before adding new bespoke styles.
- Avoid inline styles unless unavoidable; prefer Tailwind utilities plus tokens.

## Styling & Tokens
- Tailwind 4 is imported via `@import "tailwindcss"`; typography plugin enabled.
- Use 2-space indentation; prefer single quotes in CSS custom property values when needed.
- Reference design tokens in `:root` (fonts, colors, radii, spacing, typography scales). Do not rename tokens without updating usages.
- Custom utility classes live under `@layer utilities` (`.text-balance`, `.animate-rise`, etc.); prefer reuse.
- Respect motion preferences: animations have reduced-motion guards; preserve these when adding animations.

## Imports & Formatting
- Order imports: Node/built-ins -> third-party -> internal (`src/...`) -> relative paths. Keep a blank line between groups when helpful.
- Use `import type` for type-only imports (pattern seen in `sanity.ts`).
- Prefer `const` and arrow functions; avoid hoisting surprises.
- Multi-line objects/arrays use trailing commas; keep 2-space indent across Astro, TS, and CSS.
- Strings use single quotes; template literals for interpolation. Avoid double quotes in TS/JS unless JSON.

## Types & Data Shaping
- Types live in `src/lib/types.ts`; add/adjust there before consuming new fields.
- Favor type aliases over interfaces to stay consistent with current code.
- Exported functions should declare return types explicitly, especially async helpers.
- Normalize external data defensively (see `normalizeStringArray`, `mapMedia`); preserve graceful fallbacks.

## Error Handling & Logging
- Fail soft when remote data is unavailable: prefer returning sample content or `null` over throwing during render.
- Log with context: `console.warn('Sanity request failed:', error);` style—keep user-facing pages resilient.
- Do not swallow errors in CLI scripts; exit with non-zero status on fatal seeding failures.
- Validate env vars before network calls; see `seed-sanity.mjs` guard clause.

## Analytics & Consent
- Mixpanel only initializes when `PUBLIC_MIXPANEL_TOKEN` exists and consent is granted (if required).
- Respect consent flow (if implemented) and keep `data-session-replay` flag wiring intact.
- When adding new tracked elements, use semantic `data-analytics` + `data-label` attributes; avoid noisy event spam.

## Analytics Debugging
- When troubleshooting Mixpanel tracking, add `?debug_mixpanel` to any page URL to enable debug logging in browser console.
- Debug mode outputs: initialization status, event payloads being sent, configuration values, and any errors during initialization.
- Example: `https://benelabs.tech/contact?debug_mixpanel`
- Debug logging respects browser console and is safe for production use (no performance impact).

## Accessibility & Performance
- Maintain readable font sizes and contrast per `global.css` tokens.
- Prefer semantic HTML tags; headings should remain hierarchical.
- Optimize images via `public/og/` assets; set `alt` text and dimensions when available.
- Avoid blocking scripts; keep inline scripts minimal and scoped.
- Honor reduced-motion media queries; do not add autoplaying animations without guards.

## Naming Conventions
- Files: PascalCase for components, lowercase with brackets for dynamic routes, kebab-case for assets.
- Variables/functions: camelCase; constants/ENV keys uppercase snake.
- Props/state flags read as booleans (e.g., `enableSessionReplay`) and passed explicitly.

## Content Authoring Guidelines
- Blog and project slugs must be URL-safe and unique; Sanity schema enforces this—mirror in sample content.
- `seo` blocks expect `title`/`description`; keep optional but provide when available.
- Portable Text blocks map to `<p>`, `<h2-4>`, `<blockquote>`; avoid introducing new styles without updating `portableTextToHtml`.

## Assets & SEO
- Default OG image: `/og/default.svg`; add new OG assets under `public/og/` and set width/height when known.
- Update `<meta>` fields through `BaseLayout` props rather than inline tags on pages.
- Keep favicons and sitemap/robots in `public/`; regenerate if routes change materially.

## Git, PRs, and Commits
- Commit messages: short, sentence case, verb-first (e.g., "Improve mobile spacing").
- PRs should include a summary, visuals for UI changes, and callouts for env var changes.
- Do not commit secrets; scrub `.env` and tokens.
- Keep diffs focused; avoid opportunistic refactors unless related and small.

## Adding Tests in the Future
- If introducing tests, prefer lightweight runners (Vitest/Jest) and colocate with source using `*.test.ts` naming.
- Expose `npm test` plus `npm test -- <pattern>` for single-test runs; document any required setup here.
- Mock Sanity and Mixpanel in tests; do not hit the network.

## Validation Checklist Before Publishing
- Run `npm run build` at repo root.
- If content changes, verify `/`, `/blog`, `/projects`, `/contact` in `npm run preview`.
- If Sanity-connected changes are made, run `npm run seed:sanity` in a safe dataset or confirm live data shape.
- For Studio schema edits, run `npm run dev` inside `sanity-studio/` and ensure documents create successfully.

## Directory Hygiene
- Avoid editing generated directories: `sanity-studio/.sanity/` and any `node_modules/`.
- Keep `src/styles/global.css` as the single source for tokens and shared classes.
- Prefer adding new helpers in `src/lib/` rather than scattering utilities across pages.

## Sanity Schema Tips
- Keep document/field definitions in `sanity-studio/schemas/`; reuse shared modules like `seo` and `blockContent`.
- Align schema field names with frontend types; update `src/lib/types.ts` and sample content when adding fields.
- Maintain slug uniqueness and required validations in schemas to match frontend routing expectations.
- After schema changes, run `npm run dev` in `sanity-studio/` and create a test document to confirm desk structure.

## Local Dev Tips
- `npm run dev` supports live reload; keep console open for Astro/Sanity warnings.
- Use `npm run preview` before shipping to catch SSR-only issues.
- Prefer `Astro.site` for URL construction instead of hardcoding origins.
- When touching analytics, verify consent/flag handling in `Mixpanel.astro` (and `ConsentBanner.astro` if added).

## Notes for Future Agents
- Default indentation: 2 spaces across Astro/TS/CSS/JSON.
- Favor clarity over cleverness; small, typed helpers beat inline logic.
- Preserve graceful degradation: the site must render with only sample content when Sanity is unavailable.
- When unsure, mirror existing patterns in `BaseLayout.astro`, `sanity.ts`, and `global.css`.
