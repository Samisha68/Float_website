import { defineConfig, loadEnv, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import { remarkToc, remarkUnwrapJsxParagraphs, shikiFenceInfo } from "./scripts/mdx-plugins";

// Serves /api/waitlist during `npm run dev` using the same handler Vercel runs in
// production, so the signup can be exercised locally without the Vercel runtime.
// Dev only — `vercel dev` and production are unaffected.
function waitlistDevApi() {
  return {
    name: "waitlist-dev-api",
    apply: "serve" as const,
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/waitlist", async (req, res) => {
        Object.assign(process.env, loadEnv("development", process.cwd(), ""));
        const chunks: Buffer[] = [];
        for await (const chunk of req as AsyncIterable<Buffer>) chunks.push(chunk);
        const shim = Object.assign(res, {
          status(code: number) { res.statusCode = code; return shim; },
          json(payload: unknown) { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(payload)); return shim; },
        });
        try {
          const { default: handler } = await server.ssrLoadModule("/api/waitlist.mjs") as { default: (q: unknown, s: unknown) => Promise<void> };
          await handler(Object.assign(req, { body: Buffer.concat(chunks).toString("utf8") }), shim);
        } catch (error) {
          console.error("[waitlist dev api]", error);
          if (!res.writableEnded) shim.status(500).json({ ok: false, code: "DEV_HANDLER_FAILED" });
        }
      });
    },
  };
}

// In production the docs are prerendered to dist/docs/**/index.html. In dev there is no such
// file, so hand every /docs URL to the docs entry page, which renders the route on the client.
function docsDevRoutes() {
  return {
    name: "docs-dev-routes",
    apply: "serve" as const,
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && /^\/docs(?:[/?#]|$)/.test(req.url)) req.url = "/docs.html";
        next();
      });
    },
  };
}

const docsMdx = {
  enforce: "pre" as const,
  ...mdx({
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm, remarkUnwrapJsxParagraphs, remarkToc],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: "append",
        properties: { className: ["heading-anchor"], ariaLabel: "Link to this section" },
        content: { type: "text", value: "#" },
      }],
      [rehypeShiki, {
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
        fallbackLanguage: "text",
        transformers: [shikiFenceInfo],
      }],
    ],
  }),
};

export default defineConfig({
  plugins: [docsMdx, react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }), tailwindcss(), waitlistDevApi(), docsDevRoutes()],
  build: {
    rollupOptions: { input: { main: "index.html", docs: "docs.html" } },
  },
});
