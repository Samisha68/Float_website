import { defineConfig, loadEnv, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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

export default defineConfig({
  plugins: [react(), tailwindcss(), waitlistDevApi()],
});
