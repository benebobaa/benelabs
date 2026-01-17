# PostHog to Mixpanel Analytics Migration Plan (Full Funnel)

Status: Implemented (pending validation)
Owner: TBD

## Decisions (locked)
- Data residency: US default (no EU residency requirement identified).
- Event naming: keep snake_case for parity; plan a future v2 rename if needed.
- Autocapture + session replay: OFF by default; if enabled later, start at 1–5% sampling with aggressive masking.
- Identity: do not use email (or hashed email) as distinct_id; rely on client distinct_id, fallback to random UUID.
- Historical backfill: not planned; keep PostHog read-only for legacy reference.
- Parallel run: not planned for this cutover; optional 2-week run or until 300–1000 conversions if needed.

## Pre-migration analytics inventory (PostHog)
Client tracking: `src/components/PostHog.astro`
- Initialization gated by `PUBLIC_POSTHOG_KEY`.
- Manual `page_view` capture plus UTMs and landing properties.
- Custom events from data attributes and scroll depth.
- Session replay gated by `data-session-replay` + env.

Server tracking: `src/pages/api/contact.ts`
- `contact_form_received`, `contact_email_sent`, `contact_email_failed` via PostHog capture API.

Identity bridging:
- `window.__posthogDistinctId` propagated to contact form hidden input in `src/pages/contact/index.astro`.

Data attributes driving events:
- `data-analytics`, `data-analytics-list`, `data-analytics-content`, `data-analytics-video` across pages/components.

Privacy markers:
- `data-ph-mask` and `data-ph-no-capture` on contact form inputs.

Env keys in use:
- `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_HOST`, `PUBLIC_POSTHOG_SESSION_REPLAY`, `PUBLIC_POSTHOG_AUTOCAPTURE`.

## Mixpanel research notes (docs)
- JS SDK: `mixpanel-browser` (npm).
- Server SDK: `mixpanel` (npm).
- `mixpanel.init` supports `autocapture`, `track_pageview`, `record_sessions_percent`, `record_heatmap_data`.
- Node SDK uses `host` + `protocol` config for data residency.

References:
- https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript
- https://docs.mixpanel.com/docs/tracking-methods/sdks/nodejs
- https://developer.mixpanel.com/reference/track-event

## Target event taxonomy (keep existing names to reduce churn)
Event naming: keep current snake_case for parity during migration.

| Event | Source | Key properties |
| --- | --- | --- |
| page_view | client | path, title, referrer, landing_path, landing_referrer, utm_* |
| content_list_view | client | list |
| content_view | client | type, slug, title |
| content_engaged | client | type, slug, title, scroll |
| content_completed | client | type, slug, title, scroll |
| cta_click | client | label, href |
| nav_click | client | label, href |
| contact_email_click | client | href |
| project_link_click | client | label, href |
| project_video_play | client | label, href, type, slug, title |
| outbound_link_click | client | href, label |
| contact_form_start | client | form |
| contact_form_submit | client | form |
| contact_form_received | server | email_hash, name_provided, message_length, source |
| contact_email_sent | server | email_hash, provider |
| contact_email_failed | server | email_hash, provider, error |

Super properties (client):
- `landing_path`, `landing_referrer`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid`
- `first_touch_utm_*` equivalents (first-touch attribution)
- `session_replay_enabled` (if enabled)

## Identity and user profiles
- Client uses `mixpanel.get_distinct_id()`; store as `window.__mixpanelDistinctId` and emit `mixpanel:ready` event.
- Contact form sends `distinctId` hidden field (same flow as PostHog).
- Server uses `distinctId` when provided; fallback to random UUID (no email-derived IDs).
- Keep `email_hash` as an optional property if policy permits.
- Optional: add `insert_id` for server-side events to avoid duplicates on retries.

## Consent, privacy, and PII
- Keep analytics disabled when Mixpanel token is absent.
- If consent is required, gate initialization and use Mixpanel opt-in/out APIs.
- Avoid raw PII in event properties; keep `email_hash` only.
- Autocapture and replay start OFF; no input capture by default.

## Proposed env vars
Client:
- `PUBLIC_MIXPANEL_TOKEN`
- `PUBLIC_MIXPANEL_API_HOST` (default `https://api.mixpanel.com`)
- `PUBLIC_MIXPANEL_AUTOCAPTURE` (true/false)
- `PUBLIC_MIXPANEL_TRACK_PAGEVIEW` (true/false)
- `PUBLIC_MIXPANEL_SESSION_REPLAY` (true/false)
- `PUBLIC_MIXPANEL_SESSION_REPLAY_PERCENT` (0-100)

Server:
- `MIXPANEL_PROJECT_TOKEN` (fallback to `PUBLIC_MIXPANEL_TOKEN` if unset)
- `MIXPANEL_API_HOST` (default `api.mixpanel.com`)

## Implementation phases

Phase 1: Mixpanel client instrumentation
- Add `mixpanel-browser` dependency.
- Create `src/components/Mixpanel.astro` with:
  - `mixpanel.init` using env options.
  - Manual event capture mirroring PostHog logic.
  - Super property registration (UTM, landing).
  - Distinct ID propagation via `window.__mixpanelDistinctId` and `mixpanel:ready` event.
  - Session replay config based on env and `data-session-replay`.
- Replace `<PostHog />` with `<Mixpanel />` in `src/layouts/BaseLayout.astro`.
- Update contact page script to read the new distinct ID.
- Remove PostHog-specific `data-ph-*` attributes.

Phase 2: Server-side tracking for contact API
- Add `mixpanel` SDK and replace PostHog capture helper.
- Use `distinct_id` + event properties; keep analytics optional if env vars are missing.

Phase 3: Validation and cutover
- Use Mixpanel Live View to validate event stream and properties.
- Verify key funnel counts and UTM attribution.
- Remove remaining PostHog dependencies and envs.
- Update docs (`README.md`, `AGENTS.md`, `.env.example`).

## Optional: Historical backfill (not planned)
- Export PostHog events if required later.
- Map event schema and properties to Mixpanel.
- Use Mixpanel import pipeline and verify timestamps.

## Risks and mitigations
- Identity mismatch between client and server.
  - Mitigation: enforce `distinctId` propagation and test contact flow.
- Autocapture or session replay collecting unintended data.
  - Mitigation: keep both disabled by default; enable only with explicit sampling + masking.
- Funnel drift due to property naming differences.
  - Mitigation: keep event names unchanged during migration.

## Definition of done
- Mixpanel shows all existing funnel events with expected properties.
- Contact flow events link correctly to the same distinct ID.
- Consent behavior verified (if applicable).
- PostHog removed without regression.
