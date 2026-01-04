# BeneLabs Tech Site

Astro + Tailwind SSG for benelabs.tech. Static pages are generated for the homepage, blog, projects, and core company pages.

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

- `post`: title, slug, excerpt (optional), content/body/contentBlocks (Portable Text), coverImage (image + alt), tags (array of refs or strings), publishedAt, seo (title/description)
- `project`: title, slug, summary (optional), content/body/longContent (Portable Text), coverImage, techStack (array), links (label/url), featured, publishedAt, seo
- `page`: title, slug, intro (optional), content/body/contentBlocks (Portable Text), seo

## Commands

| Command       | Action                               |
| :------------ | :----------------------------------- |
| `npm install` | Install dependencies                 |
| `npm run dev` | Start local dev server (localhost)   |
| `npm run build` | Build the production site          |
| `npm run preview` | Preview the production build     |
