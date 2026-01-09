export type SeoMeta = {
  title?: string;
  description?: string;
};

export type Media = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  mediumUrl?: string;
  coverImage?: Media;
  tags?: string[];
  publishedAt?: string;
  seo?: SeoMeta;
};

export type ProjectLink = {
  label: string;
  url: string;
};

export type ProjectVideo = {
  url: string;
  title?: string;
  caption?: string;
  poster?: Media;
};

export type Project = {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  coverImage?: Media;
  techStack?: string[];
  links?: ProjectLink[];
  featured?: boolean;
  publishedAt?: string;
  seo?: SeoMeta;
  demoVideo?: ProjectVideo;
};

export type PageContent = {
  id: number;
  title: string;
  slug: string;
  intro?: string;
  content?: string;
  seo?: SeoMeta;
};
