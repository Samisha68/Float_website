import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import DocsApp from "./DocsApp";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <DocsApp />
    </BrowserRouter>
  </StrictMode>
);

// Production pages arrive prerendered (see scripts/prerender.mjs), so hydrate them; in dev the root is empty.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
