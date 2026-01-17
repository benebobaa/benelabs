# Benelabs Tech Site Page

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

## Mixpanel Analytics

Mixpanel is wired for manual funnel events with UTM attribution and optional session replay (off by default).

Environment variables:

```bash
PUBLIC_MIXPANEL_TOKEN=""
PUBLIC_MIXPANEL_API_HOST="https://api.mixpanel.com"
PUBLIC_MIXPANEL_AUTOCAPTURE="false"
PUBLIC_MIXPANEL_TRACK_PAGEVIEW="false"
PUBLIC_MIXPANEL_SESSION_REPLAY="false"
PUBLIC_MIXPANEL_SESSION_REPLAY_PERCENT="0"
MIXPANEL_PROJECT_TOKEN="" # optional; defaults to PUBLIC_MIXPANEL_TOKEN when unset
MIXPANEL_API_HOST="api.mixpanel.com"
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

Session replay:
- Session replay only starts on pages with `enableSessionReplay={true}` (currently `/contact`) and when `PUBLIC_MIXPANEL_SESSION_REPLAY="true"` with a non-zero sampling percent.

## Contact Form (Resend)

The `/contact` form posts to `/api/contact`, which sends email via Resend and emits server-side Mixpanel events when the token is configured. The repo uses the Vercel serverless adapter with `output: 'static'`; swap adapters if you deploy elsewhere.

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
