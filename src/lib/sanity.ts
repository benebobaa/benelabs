import { createClient } from '@sanity/client';
import type { BlogPost, Project, Media, ProjectLink, SeoMeta, PageContent } from './types';
import { sampleBlogPosts, sampleProjects } from './sample-content';

const projectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;
const dataset = import.meta.env.SANITY_DATASET as string | undefined;
const apiVersion = (import.meta.env.SANITY_API_VERSION as string | undefined) ?? '2024-01-01';
const token = import.meta.env.SANITY_TOKEN as string | undefined;
const useCdn = (import.meta.env.SANITY_USE_CDN as string | undefined) !== 'false';

const client =
  projectId && dataset
    ? createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn,
        token,
      })
    : null;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[char] ?? char;
  });

const portableTextToHtml = (blocks: unknown) => {
  if (!Array.isArray(blocks)) return undefined;
  const html = blocks
    .map((block) => {
      if (!block || typeof block !== 'object') return '';
      const record = block as {
        _type?: string;
        style?: string;
        children?: Array<{ text?: string }>;
      };
      if (record._type !== 'block') return '';
      const text = record.children?.map((child) => child.text ?? '').join('').trim();
      if (!text) return '';
      const style = record.style ?? 'normal';
      if (style === 'h2' || style === 'h3' || style === 'h4') {
        return `<${style}>${escapeHtml(text)}</${style}>`;
      }
      if (style === 'blockquote') {
        return `<blockquote><p>${escapeHtml(text)}</p></blockquote>`;
      }
      return `<p>${escapeHtml(text)}</p>`;
    })
    .filter(Boolean);
  return html.length ? html.join('') : undefined;
};

const coerceContent = (input: unknown) => {
  if (typeof input === 'string') return input;
  return portableTextToHtml(input);
};

const mapSeo = (seo?: { title?: string; description?: string; metaTitle?: string; metaDescription?: string }): SeoMeta | undefined => {
  if (!seo) return undefined;
  return {
    title: seo.title ?? seo.metaTitle,
    description: seo.description ?? seo.metaDescription,
  };
};

const normalizeStringArray = (input: unknown) => {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item) {
        const record = item as { name?: string; label?: string; title?: string };
        return record.name ?? record.label ?? record.title;
      }
      return '';
    })
    .filter(Boolean);
};

const mapMedia = (input: unknown): Media | undefined => {
  if (!input || typeof input !== 'object') return undefined;
  const record = input as { url?: string; alt?: string; width?: number; height?: number };
  if (!record.url) return undefined;
  return {
    url: record.url,
    alt: record.alt ?? '',
    width: typeof record.width === 'number' ? record.width : undefined,
    height: typeof record.height === 'number' ? record.height : undefined,
  };
};

const mapLinks = (input: unknown): ProjectLink[] | undefined => {
  if (!Array.isArray(input)) return undefined;
  const links = input
    .map((item) => {
      if (!item || typeof item !== 'object') return undefined;
      const record = item as { label?: string; title?: string; url?: string; href?: string };
      const url = record.url ?? record.href;
      if (!url) return undefined;
      return { label: record.label ?? record.title ?? 'Link', url };
    })
    .filter(Boolean) as ProjectLink[];
  return links.length ? links : undefined;
};

const fetchSanity = async <T,>(query: string, params?: Record<string, unknown>): Promise<T | null> => {
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params ?? {});
  } catch (error) {
    console.warn('Sanity request failed:', error);
    return null;
  }
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const query = `
    *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      summary,
      content,
      body,
      contentBlocks,
      "coverImage": {
        "url": coverImage.asset->url,
        "alt": coverImage.alt,
        "width": coverImage.asset->metadata.dimensions.width,
        "height": coverImage.asset->metadata.dimensions.height
      },
      "tagNames": tags[]->name,
      tags,
      publishedAt,
      _createdAt,
      seo
    }
  `;
  const response = await fetchSanity<Array<Record<string, unknown>>>(query);
  if (!response) return sampleBlogPosts;
  const posts = response
    .map((post, index) => ({
      id: typeof post._id === 'number' ? post._id : index + 1,
      title: (post.title as string) ?? 'Untitled',
      slug: (post.slug as string) ?? '',
      excerpt: (post.excerpt as string) ?? (post.summary as string),
      content: coerceContent(post.content ?? post.body ?? post.contentBlocks),
      coverImage: mapMedia(post.coverImage),
      tags: (() => {
        const resolved = normalizeStringArray(post.tagNames);
        return resolved.length ? resolved : normalizeStringArray(post.tags);
      })(),
      publishedAt: (post.publishedAt as string) ?? (post._createdAt as string) ?? '',
      seo: mapSeo(post.seo as SeoMeta | undefined),
    }))
    .filter((post) => post.slug);
  return posts.length ? posts : sampleBlogPosts;
};

export const getProjects = async (): Promise<Project[]> => {
  const query = `
    *[_type == "project" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      shortSummary,
      content,
      body,
      longContent,
      "coverImage": {
        "url": coverImage.asset->url,
        "alt": coverImage.alt,
        "width": coverImage.asset->metadata.dimensions.width,
        "height": coverImage.asset->metadata.dimensions.height
      },
      "techStackNames": techStack[]->name,
      techStack,
      stack,
      links,
      featured,
      publishedAt,
      _createdAt,
      seo
    }
  `;
  const response = await fetchSanity<Array<Record<string, unknown>>>(query);
  if (!response) return sampleProjects;
  const projects = response
    .map((project, index) => ({
      id: typeof project._id === 'number' ? project._id : index + 1,
      title: (project.title as string) ?? 'Untitled',
      slug: (project.slug as string) ?? '',
      summary: (project.summary as string) ?? (project.shortSummary as string),
      content: coerceContent(project.content ?? project.body ?? project.longContent),
      coverImage: mapMedia(project.coverImage),
      techStack: (() => {
        const resolved = normalizeStringArray(project.techStackNames);
        if (resolved.length) return resolved;
        return normalizeStringArray(project.techStack ?? project.stack);
      })(),
      links: mapLinks(project.links),
      featured: Boolean(project.featured),
      publishedAt: (project.publishedAt as string) ?? (project._createdAt as string) ?? '',
      seo: mapSeo(project.seo as SeoMeta | undefined),
    }))
    .filter((project) => project.slug);
  return projects.length ? projects : sampleProjects;
};

export const getPageBySlug = async (slug: string): Promise<PageContent | null> => {
  const query = `
    *[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      intro,
      summary,
      content,
      body,
      contentBlocks,
      seo
    }
  `;
  const page = await fetchSanity<Record<string, unknown> | null>(query, { slug });
  if (!page) return null;
  return {
    id: typeof page._id === 'number' ? page._id : 0,
    title: (page.title as string) ?? 'Untitled',
    slug: (page.slug as string) ?? slug,
    intro: (page.intro as string) ?? (page.summary as string),
    content: coerceContent(page.content ?? page.body ?? page.contentBlocks),
    seo: mapSeo(page.seo as SeoMeta | undefined),
  };
};
