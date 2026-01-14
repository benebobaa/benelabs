# Benelabs Tech Site

Astro + Tailwind SSG for Benelabs.tech. Static pages are generated for the homepage, blog, projects, and core company pages.

## Pages

- `/` home
- `/blog` list and `/blog/[slug]` detail
- `/projects` list and `/projects/[slug]` detail
- `/about`
- `/contact`

## Sanity Content

This site expects a Sanity Cloud backend for blog posts, projects, and pages. If `SANITY_PROJECT_ID` is not set, local
sample content from `src/lib/sample-content.ts` is used.

Environment variables:

```bash
SANITY_PROJECT_ID="your-project-id"
SANITY_DATASET="production"
SANITY_API_VERSION="2024-01-01"
SANITY_TOKEN="" # optional if public content
SANITY_USE_CDN="true"
```

## Sanity Content Types

The frontend queries these document types and fields:

- `post`: title, slug, excerpt (optional), content/body/contentBlocks (Portable Text), coverImage (image + alt), tags (array of refs or strings), publishedAt, seo (title/description), mediumUrl (optional)
- `project`: title, slug, summary (optional), content/body/longContent (Portable Text), coverImage, techStack (array), links (label/url), demoVideo (url/title/caption/poster), featured, publishedAt, seo
- `page`: title, slug, intro (optional), content/body/contentBlocks (Portable Text), seo

## PostHog Analytics

PostHog is wired for manual funnel events plus autocapture (heatmaps-ready), with UTM attribution and optional session replay.

Environment variables:

```bash
PUBLIC_POSTHOG_KEY=""
PUBLIC_POSTHOG_HOST="https://app.posthog.com"
PUBLIC_POSTHOG_CONSENT_REQUIRED="true"
PUBLIC_POSTHOG_SESSION_REPLAY="false"
PUBLIC_POSTHOG_AUTOCAPTURE="true"
```

Event taxonomy (manual + server, 12-18 events):

- `page_view`
- `content_list_view`
- `content_view`
- `content_engaged`
- `content_completed`
- `cta_click`
- `nav_click`
- `contact_form_start`
- `contact_form_submit`
- `contact_form_received` (server)
- `contact_email_sent` (server)
- `contact_email_failed` (server)
- `contact_email_click`
- `project_link_click`
- `project_video_play`
- `outbound_link_click`

Attribution:
- First-touch UTMs are stored as person props with `first_touch_*`.
- Last-touch UTMs are stored as person props with `utm_*`.

Consent + session replay:
- Consent is required when `PUBLIC_POSTHOG_CONSENT_REQUIRED="true"`.
- Session replay only starts on pages with `enableSessionReplay={true}` (currently `/contact`) and when `PUBLIC_POSTHOG_SESSION_REPLAY="true"`.

## Contact Form (Resend)

The `/contact` form posts to `/api/contact`, which sends email via Resend and emits server-side PostHog events when consent is granted. The repo uses the Node adapter with `output: 'hybrid'`; swap adapters if you deploy to Netlify/Vercel/Cloudflare.

Environment variables:

```bash
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Benelabs <hello@benelabs.tech>"
RESEND_TO_EMAIL="hello@benelabs.tech"
```

## Commands

| Command       | Action                               |
| :------------ | :----------------------------------- |
| `npm install` | Install dependencies                 |
| `npm run dev` | Start local dev server (localhost)   |
| `npm run build` | Build the production site          |
| `npm run preview` | Preview the production build     |
