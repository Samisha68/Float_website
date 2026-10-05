import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import DocsApp from "./DocsApp";
import { pages, SITE_ORIGIN } from "./pages";

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <DocsApp />
    </StaticRouter>,
  );
}

/** What the prerender script needs to emit one static HTML file per page, plus the sitemap. */
export const routes = pages.map((p) => ({ url: p.url, title: `${p.title} | Float Docs`, description: p.description }));
export { SITE_ORIGIN };
