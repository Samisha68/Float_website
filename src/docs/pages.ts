import type { ComponentType } from "react";

export type TocItem = { depth: 2 | 3; text: string; id: string };

type Frontmatter = {
  title: string;
  subtitle?: string;
  description?: string;
  section?: string;
  order?: number;
};

type DocModule = {
  default: ComponentType<{ components?: Record<string, unknown> }>;
  frontmatter: Frontmatter;
  toc: TocItem[];
};

export type DocPage = {
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  description: string;
  section: string;
  order: number;
  toc: TocItem[];
  Content: DocModule["default"];
};

/** The page served at /docs itself. Its own URL is /docs, not /docs/get-started. */
export const INDEX_SLUG = "get-started";

export const SITE_ORIGIN = "https://justfloat.xyz";

/** Maps an MDX-relative link such as /overview#x (or /get-started) to its site URL under /docs. */
export function docHref(href: string): string {
  if (href === "/docs" || href.startsWith("/docs/") || href.startsWith("/docs#")) return href;
  const [path, hash] = href.split("#");
  const slug = path.replace(/^\/+|\/+$/g, "");
  const url = !slug || slug === INDEX_SLUG ? "/docs" : `/docs/${slug}`;
  return hash ? `${url}#${hash}` : url;
}

const modules = import.meta.glob<DocModule>("./content/**/*.mdx", { eager: true });

// Every file under ./content becomes a page; its folder structure becomes the URL path.
export const pages: DocPage[] = Object.entries(modules)
  .map(([file, mod]) => {
    const slug = file.replace(/^\.\/content\//, "").replace(/\.mdx$/, "").replace(/\/index$/, "");
    const fm = mod.frontmatter;
    return {
      slug,
      url: docHref(`/${slug}`),
      title: fm.title,
      subtitle: fm.subtitle,
      description: fm.description ?? fm.subtitle ?? "",
      section: fm.section ?? "",
      order: fm.order ?? Number.MAX_SAFE_INTEGER,
      toc: mod.toc,
      Content: mod.default,
    };
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

/** Sidebar groups, in the order their first page appears. */
export const sections = pages.reduce<{ title: string; pages: DocPage[] }[]>((groups, page) => {
  const group = groups.find((g) => g.title === page.section);
  if (group) group.pages.push(page);
  else groups.push({ title: page.section, pages: [page] });
  return groups;
}, []);

export function pageForPath(pathname: string): DocPage | undefined {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return pages.find((p) => p.url === clean);
}
