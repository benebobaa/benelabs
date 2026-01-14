# PostHog Full-Funnel Analytics Plan for Benelabs Astro

## Project-based snapshot (from repo)
- Astro SSG with static routes: `/`, `/blog`, `/blog/[slug]`, `/projects`, `/projects/[slug]`, `/about`, `/contact`.
- `astro.config.mjs` uses `output: 'static'` (no server endpoints by default).
- Sanity-backed content (`post`, `project`, `page`) with sample fallback.
- PostHog is already initialized in `src/components/PostHog.astro` with manual events and UTMs.
- Consent is handled by `src/components/ConsentBanner.astro` via localStorage and `posthog:consent` events.
- Session replay is opt-in per page using `BaseLayout` prop `enableSessionReplay`; currently enabled for `/contact`.
- Autocapture is disabled; `$pageview` is sent manually as `page_view`.
- Existing event taxonomy (manual): `page_view`, `content_list_view`, `content_view`, `content_engaged`, `cta_click`, `nav_click`, `contact_form_submit`, `contact_email_click`, `project_link_click`, `outbound_link_click`.
- Contact form is present but not wired; plan to use Resend for email delivery.

## Goal
Deliver enterprise-grade, privacy-first AARRR analytics tailored to this marketing and lead-gen site, while enabling autocapture + heatmaps and preserving manual events for key funnel steps.

## Step 1: Research and setup planning
1. Review PostHog docs for the current SDK options and defaults (autocapture, heatmaps, pageview, session replay, feature flags).
2. Confirm project setup (cloud vs self-hosted), environments (dev/staging/prod), and keys:
   - `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_HOST`, `PUBLIC_POSTHOG_CONSENT_REQUIRED`, `PUBLIC_POSTHOG_SESSION_REPLAY`.
3. Decide on a CMP integration:
   - Keep the localStorage consent flow, or wire a CMP to dispatch `posthog:consent`.
4. Resend contact form integration plan:
   - Choose hosting strategy for serverless (Netlify/Vercel/Cloudflare) or switch Astro to `output: 'hybrid'` with an adapter.
   - Add server env vars: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`.
   - Update `.env.example` once final values are decided.
5. Define an analytics schema file (single source of truth) and update `README.md` once approved.

## Step 2: AARRR funnel mapping for this site
### Acquisition
- `page_view` with `utm_*`, `referrer`, `landing_path`, `campaign_id`.
- `content_list_view` on `/blog` and `/projects`.
- `nav_click`, `cta_click` (marketing CTAs to projects/contact).

### Activation
- `contact_form_start` on first field focus.
- `contact_form_submit` on form submit (not just click).
- `contact_form_received` / `contact_email_sent` from the Resend backend (server-side).
- `contact_email_click` when user chooses email instead of form.
- Optional: `consultation_scheduled` if Calendly or scheduling tool is added.

### Retention
- `return_visit` (derived or explicit) using `distinct_id` and time windows.
- `content_engaged` (already at 50 percent scroll), plus optional `content_completed` at 90 percent.
- `content_progress` (reading progress events for blog detail).

### Revenue
- This site is lead-gen, not ecommerce. Track revenue signals via CRM or backend:
  - `lead_qualified`, `proposal_sent`, `deal_won`.
  - Capture server-side only with hashed identifiers.

### Referral
- `outbound_link_click` (already).
- Add `share_click` (if share buttons are added).
- `invite_sent` only if a referral mechanism is introduced later.

## Step 3: Event taxonomy and schema (adapted to current code)
### Core event list (start with 12-18 events)
- `page_view`
- `content_list_view`
- `content_view`
- `content_engaged`
- `content_completed` (new)
- `cta_click`
- `nav_click`
- `contact_form_start` (new)
- `contact_form_submit`
- `contact_form_received` (server-side)
- `contact_email_sent` (server-side)
- `contact_email_click`
- `project_link_click`
- `outbound_link_click`
- `project_video_play` (new, only on demo video)
- `share_click` (future)
- `consultation_scheduled` (server-side)
- `lead_qualified` / `deal_won` (server-side)

### Suggested common properties
- `path`, `title`, `referrer`, `landing_path`
- `content_type`, `content_slug`, `content_title`, `content_tags`
- `cta_label`, `cta_location`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid`
- `session_replay_enabled` (bool)
- `event_version`

## Step 4: Implementation outline (Astro-specific)
### Client-side initialization (enable autocapture + heatmaps with guardrails)
- Enable autocapture for clicks/forms/scrolls to unlock heatmaps and retroactive analysis.
- Keep manual events for funnel steps and revenue signals.
- Use PostHog allow/deny lists (per docs) to restrict autocapture to safe elements.
- Add PostHog ignore/mask classes to form inputs and PII-heavy sections.

### Improve list capture (current limitation)
The current script uses `querySelector` so it only tracks the first list on `/blog`.
```js
const listNodes = document.querySelectorAll('[data-analytics-list]');
listNodes.forEach((node) => {
  posthog.capture('content_list_view', {
    list: node.getAttribute('data-analytics-list'),
  });
});
```

### Track contact form start and submit
```js
const form = document.querySelector('form');
let started = false;
form?.addEventListener('focusin', () => {
  if (started) return;
  started = true;
  posthog.capture('contact_form_start');
});
form?.addEventListener('submit', () => {
  posthog.capture('contact_form_submit');
});
```

### Capture content completion (blog/project detail)
```js
const content = document.querySelector('[data-analytics-content]');
const onScroll = () => {
  const rect = content.getBoundingClientRect();
  const progress = Math.min(Math.max((window.innerHeight - rect.top) / rect.height, 0), 1);
  if (progress >= 0.9) {
    posthog.capture('content_completed', {
      type: content.getAttribute('data-analytics-content'),
      slug: content.getAttribute('data-analytics-slug'),
    });
    window.removeEventListener('scroll', onScroll);
  }
};
```

### Track demo video play (projects)
- Add `data-analytics="project-video"` to the video/iframe wrapper and capture on play.

### Add consistent CTA tagging
- Use `data-analytics="cta"` and `data-label` for key buttons across `/`, `/blog`, `/projects`, `/about`.

### Consider standard pageview event
- Evaluate switching from custom `page_view` to PostHog `$pageview` so heatmaps and built-ins align.
- If switching, update dashboards and documentation to avoid double-counting.

## Step 5: Server-side tracking (Resend + revenue events)
### When to use server-side
- Contact form submission with Resend (email delivery + confirmation).
- CRM pipeline events: qualified lead, proposal sent, deal won.

### Recommended flow
- Add a hidden `distinct_id` field to the form so server events can link to the anonymous session.
- Hash email server-side (SHA-256 with salt) and send as a person property.
- Emit server events after Resend success/failure.

```js
await posthog.capture({
  distinctId,
  event: 'lead_qualified',
  properties: { pipeline: 'enterprise', value: 15000, currency: 'USD' },
});
```

## Step 6: Consent, privacy, and security
- Keep the existing consent gate and only initialize PostHog after consent.
- Mask any form fields in session replay; do not send raw email or message content.
- Apply PostHog ignore/mask selectors to inputs and textareas (per SDK docs).
- Store UTM fields as first-touch and last-touch (already implemented).
- Consider enabling IP anonymization or disabling geolocation in PostHog settings.

## Step 7: Dashboards and analysis plan
### Funnels
- Acquisition: `page_view` -> `cta_click` -> `contact_form_start` -> `contact_form_submit`.
- Content: `content_view` -> `content_engaged` -> `content_completed`.

### Retention
- Weekly returning visitors who trigger `content_view` or `cta_click`.

### KPIs
- Contact form conversion rate.
- CTA click-through rate by page.
- Content engagement rate by blog/project.

## Step 8: Timeline (example)
- Day 1: Verify PostHog options, finalize taxonomy, align consent requirements.
- Day 2: Enable autocapture + heatmaps with guardrails; update `PostHog.astro`.
- Day 3: Add contact form instrumentation and Resend server-side events.
- Day 4: Configure dashboards, funnels, and alerts.
- Day 5: QA in staging and finalize production rollout.

## Step 9: Risks and mitigations
- Ad blockers: use server-side events for critical conversion steps.
- Duplicate events: ensure `page_view` is fired once per page load.
- Autocapture noise: use allow/deny lists and ignore selectors to keep signal clean.
- Data quality drift: maintain schema versioning and a changelog.
- Replay privacy: verify masking on the contact form before enabling session replay there.

## Step 10: Deployment and testing checklist
- Validate consent flow and ensure no events fire before consent.
- Use PostHog debug mode and network inspection for payload sanity.
- Run `npm run build` and validate `/`, `/blog`, `/projects`, `/contact`.
- Update `README.md` with the finalized event taxonomy.

## Assumptions to confirm
- This site is primarily lead-gen (no user auth, no purchases).
- Resend will be used via a serverless handler or Astro adapter (confirm hosting choice).
- Session replay should remain limited to consented users and selected pages.
