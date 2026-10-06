import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

const GITHUB_URL = "https://github.com/Samisha68/Float-Finance";
const X_URL = "https://x.com/float_fi";
// TODO: confirm where "Get Started" should point. /docs is the interim target.
const GET_STARTED_URL = "/docs";

type NavLink = { label: string; href: string; external?: boolean };

const links: NavLink[] = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Providers", href: "#providers" },
  { label: "Docs", href: "/docs" },
];

const resources: NavLink[] = [
  { label: "Documentation", href: "/docs" },
  { label: "GitHub", href: GITHUB_URL, external: true },
  { label: "X / Twitter", href: X_URL, external: true },
];

const linkClass = "text-[0.8125rem] font-medium text-white/60 hover:text-white transition-colors";
const itemClass = "block px-3 py-1.5 text-[0.8125rem] text-white/60 hover:text-white hover:bg-white/5 transition-all";
const ctaClass = "px-4 py-1.5 text-[0.8125rem] font-semibold bg-white text-black hover:bg-white/90 transition-all";
const externalProps = (link: NavLink) => (link.external ? { target: "_blank", rel: "noopener noreferrer" } : {});

export default function Navbar() {
  const root = useRef<HTMLDivElement>(null);
  const resourcesButton = useRef<HTMLButtonElement>(null);
  const resourcesPanel = useRef<HTMLDivElement>(null);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Outside click and Escape close whichever menu is open.
  useEffect(() => {
    if (!resourcesOpen && !mobileOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) { setResourcesOpen(false); setMobileOpen(false); }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (resourcesOpen) resourcesButton.current?.focus();
      setResourcesOpen(false);
      setMobileOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [resourcesOpen, mobileOpen]);

  // Every link closes the menus. In-page links scroll smoothly when their section exists;
  // otherwise the browser's default hash behaviour applies.
  function follow(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setResourcesOpen(false);
    setMobileOpen(false);
    if (!href.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", href);
  }

  const menuItems = () => Array.from(resourcesPanel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = menuItems();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "ArrowDown" ? (index + 1) % items.length
      : event.key === "ArrowUp" ? (index - 1 + items.length) % items.length
      : event.key === "Home" ? 0
      : event.key === "End" ? items.length - 1
      : -1;
    if (next < 0) return;
    event.preventDefault();
    items[next]?.focus();
  }

  function onResourcesKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setResourcesOpen(true);
    requestAnimationFrame(() => menuItems()[0]?.focus());
  }

  return (
    <div ref={root} className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 font-[family-name:var(--font-ui)]">
      <div className="relative w-full max-w-6xl">
        <nav aria-label="Primary" className="flex items-center justify-between w-full max-w-6xl px-5 py-2 bg-white/5 backdrop-blur-xl">
          <a href="/" aria-label="Float home" className="flex items-center">
            <img src="/docs-assets/logo-dark.svg" alt="" className="h-5 w-auto" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a key={link.label} href={link.href} className={linkClass} onClick={(event) => follow(event, link.href)}>{link.label}</a>
            ))}
            <div className="relative">
              <button
                ref={resourcesButton}
                type="button"
                className="text-[0.8125rem] font-medium text-white/60 hover:text-white transition-colors flex items-center gap-1"
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
                aria-controls="resources-menu"
                onClick={() => setResourcesOpen((open) => !open)}
                onKeyDown={onResourcesKeyDown}
              >
                Resources
                <ChevronDown className={`h-3 w-3 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {resourcesOpen && (
                <div
                  id="resources-menu"
                  ref={resourcesPanel}
                  role="menu"
                  aria-label="Resources"
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-44 bg-black/90 backdrop-blur-xl border border-neutral-600 p-1.5 shadow-2xl z-50"
                  onKeyDown={onMenuKeyDown}
                >
                  {resources.map((link) => (
                    <a key={link.label} role="menuitem" href={link.href} className={itemClass} {...externalProps(link)} onClick={(event) => follow(event, link.href)}>{link.label}</a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <a href={GET_STARTED_URL} className={`hidden md:inline-block ${ctaClass}`} onClick={(event) => follow(event, GET_STARTED_URL)}>Get Started</a>

          <button
            type="button"
            className="md:hidden flex items-center justify-center h-8 w-8 -mr-2 text-white/60 hover:text-white transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </nav>

        {mobileOpen && (
          <div id="mobile-menu" className="md:hidden absolute top-full left-0 right-0 mt-3 bg-black/90 backdrop-blur-xl border border-neutral-600 p-2 shadow-2xl">
            {links.map((link) => (
              <a key={link.label} href={link.href} className={itemClass} onClick={(event) => follow(event, link.href)}>{link.label}</a>
            ))}
            <p className="px-3 pt-3 pb-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white/40">Resources</p>
            {resources.map((link) => (
              <a key={link.label} href={link.href} className={itemClass} {...externalProps(link)} onClick={(event) => follow(event, link.href)}>{link.label}</a>
            ))}
            <a href={GET_STARTED_URL} className={`block text-center mt-2 ${ctaClass}`} onClick={(event) => follow(event, GET_STARTED_URL)}>Get Started</a>
          </div>
        )}
      </div>
    </div>
  );
}
