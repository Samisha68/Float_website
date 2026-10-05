// Runs after `vite build` and `vite build --ssr`. Renders every docs page to static HTML so each
// URL is served as a real page (own <title>, description and content), then writes the sitemap.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const dist = path.resolve("dist");
const ssr = path.resolve("dist-ssr", "entry-server.js");
const { render, routes, SITE_ORIGIN } = await import(pathToFileURL(ssr).href);

const template = await readFile(path.join(dist, "docs.html"), "utf8");
const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function replaceOnce(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`docs.html template is missing ${pattern}`);
  return html.replace(pattern, () => replacement);
}

for (const route of routes) {
  const canonical = `${SITE_ORIGIN}${route.url}`;
  let html = template;
  html = replaceOnce(html, /<title>.*?<\/title>/, `<title>${escape(route.title)}</title>`);
  html = replaceOnce(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(route.description)}" />`);
  html = replaceOnce(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escape(route.title)}" />`);
  html = replaceOnce(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escape(route.description)}" />`);
  html = replaceOnce(html, /<\/head>/, `<link rel="canonical" href="${canonical}" />\n    <meta property="og:url" content="${canonical}" />\n  </head>`);
  html = replaceOnce(html, /<div id="root"><\/div>/, `<div id="root">${render(route.url)}</div>`);

  const file = path.join(dist, route.url.replace(/^\//, ""), "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}

const urls = ["/", ...routes.map((r) => r.url)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_ORIGIN}${u}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);

// docs.html was only the template; every real docs URL now has its own index.html.
await rm(path.join(dist, "docs.html"));
await rm(path.resolve("dist-ssr"), { recursive: true, force: true });
console.log(`Prerendered ${routes.length} docs pages, sitemap.xml and robots.txt`);
