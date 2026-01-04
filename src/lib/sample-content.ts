import type { BlogPost, Project } from './types';

export const sampleBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Signals in the Noise',
    slug: 'signals-in-the-noise',
    excerpt: 'A framework for designing calm, high-signal interfaces that help teams decide faster.',
    publishedAt: '2024-09-12',
    tags: ['Product', 'Design', 'Research'],
    content: `
      <p>Signal design is about removing friction without removing meaning. We start with the most essential
      decision a team needs to make, then work backwards to find the smallest number of inputs that still feel
      trustworthy.</p>
      <p>At BeneLabs we build interfaces that quiet the background, favoring a soft palette, grounded typography,
      and a few purposeful interactions over endless micro-animations.</p>
      <p>When a screen makes the next step obvious, people move with confidence. That clarity is measurable.</p>
    `,
  },
  {
    id: 2,
    title: 'Astro as a Research Platform',
    slug: 'astro-as-research-platform',
    excerpt: 'Why static-first workflows keep experiments fast and pages easily discoverable.',
    publishedAt: '2024-08-18',
    tags: ['Engineering', 'Astro', 'Performance'],
    content: `
      <p>Astro lets us treat every page as a snapshot of research. Static builds remove the anxiety of runtime
      complexity while keeping layouts composable.</p>
      <p>With a headless CMS like Sanity, content teams iterate without touching front-end code, and the final
      output ships as clean HTML for search and speed.</p>
      <p>This combination keeps the lab moving fast without sacrificing polish.</p>
    `,
  },
  {
    id: 3,
    title: 'Field Notes from BeneLabs',
    slug: 'field-notes-benelabs',
    excerpt: 'A look at how we translate discovery calls into clear, credible product narratives.',
    publishedAt: '2024-07-26',
    tags: ['Storytelling', 'Strategy'],
    content: `
      <p>We capture field notes from every collaboration to identify the patterns that matter most. The stories
      that ship are the ones that match what users already say in their own words.</p>
      <p>Those narratives become the foundation for landing pages, investor updates, and internal product docs.</p>
    `,
  },
];

export const sampleProjects: Project[] = [
  {
    id: 101,
    title: 'Atlas Briefing',
    slug: 'atlas-briefing',
    summary: 'A daily intelligence brief that blends human analysis with machine-scale summaries.',
    publishedAt: '2024-10-05',
    techStack: ['Astro', 'Sanity', 'TypeScript'],
    links: [
      { label: 'Project overview', url: 'https://benelabs.tech/projects/atlas-briefing' },
      { label: 'Launch memo', url: 'https://benelabs.tech/blog/signals-in-the-noise' },
    ],
    content: `
      <p>Atlas Briefing brings a newsroom rhythm to complex intelligence feeds. We designed the experience
      around a morning ritual: what matters, why it matters, and what to watch next.</p>
      <p>The product ships as a static site with daily regeneration from Sanity, keeping performance fast even
      on low-bandwidth networks.</p>
    `,
  },
  {
    id: 102,
    title: 'Calm Ops Console',
    slug: 'calm-ops-console',
    summary: 'A quiet control plane for teams that manage infrastructure at high scale.',
    publishedAt: '2024-09-02',
    techStack: ['Design System', 'Observability', 'Research'],
    links: [{ label: 'Case study', url: 'https://benelabs.tech/projects/calm-ops-console' }],
    content: `
      <p>The Calm Ops Console replaces noisy dashboards with a paced, narrative flow. We map alerts into
      short briefings so operators can scan, decide, and move forward without fatigue.</p>
      <p>Our team built a small component library inspired by shadcn-style patterns for consistent deployment.</p>
    `,
  },
  {
    id: 103,
    title: 'Pulse Archive',
    slug: 'pulse-archive',
    summary: 'A research library for product teams to align on insights and next steps.',
    publishedAt: '2024-07-11',
    techStack: ['Knowledge Ops', 'Content Design'],
    links: [{ label: 'Read the notes', url: 'https://benelabs.tech/blog/field-notes-benelabs' }],
    content: `
      <p>Pulse Archive stores decision-ready research artifacts. We organized the library around moments
      of truth, so teams can find answers without hunting through long reports.</p>
      <p>The outcome is a space that feels more like a studio journal than a database.</p>
    `,
  },
];
