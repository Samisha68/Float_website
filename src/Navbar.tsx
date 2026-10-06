import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type RefObject } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

const GITHUB_URL = "https://github.com/Samisha68/Float-Finance";
const X_URL = "https://x.com/float_fi";
// TODO: /providers has no page yet; build it (and add it to vite.config.ts + vercel.json) before launch.
const getStarted: NavLink[] = [
  { label: "For businesses", href: "/onboard" },
  { label: "For providers", href: "/providers" },
];

type NavLink = { label: string; href: string; external?: boolean };

const links: NavLink[] = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Providers", href: "#providers" },
  { label: "Onboard", href: "/onboard" },
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
  const getStartedButton = useRef<HTMLButtonElement>(null);
  const getStartedPanel = useRef<HTMLDivElement>(null);
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Outside click and Escape close whichever menu is open.
  useEffect(() => {
    if (!resourcesOpen && !getStartedOpen && !mobileOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) { setResourcesOpen(false); setGetStartedOpen(false); setMobileOpen(false); }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (resourcesOpen) resourcesButton.current?.focus();
      else if (getStartedOpen) getStartedButton.current?.focus();
      setResourcesOpen(false);
      setGetStartedOpen(false);
      setMobileOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [resourcesOpen, getStartedOpen, mobileOpen]);

  // On pages other than home, section anchors point back to the home page's sections.
  const resolve = (href: string) => (href.startsWith("#") && typeof location !== "undefined" && location.pathname !== "/" ? `/${href}` : href);

  // Every link closes the menus. In-page links scroll smoothly when their section exists;
  // otherwise the browser's default hash behaviour applies.
  function follow(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setResourcesOpen(false);
    setGetStartedOpen(false);
    setMobileOpen(false);
    if (!href.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", href);
  }

  const menuItems = (panel: RefObject<HTMLDivElement | null> = resourcesPanel) => Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>, panel: RefObject<HTMLDivElement | null> = resourcesPanel) {
    const items = menuItems(panel);
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

  function onGetStartedKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setGetStartedOpen(true);
    requestAnimationFrame(() => menuItems(getStartedPanel)[0]?.focus());
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
              <a key={link.label} href={resolve(link.href)} className={linkClass} onClick={(event) => follow(event, resolve(link.href))}>{link.label}</a>
            ))}
            <div className="relative">
              <button
                ref={resourcesButton}
                type="button"
                className="text-[0.8125rem] font-medium text-white/60 hover:text-white transition-colors flex items-center gap-1"
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
                aria-controls="resources-menu"
                onClick={() => { setResourcesOpen((open) => !open); setGetStartedOpen(false); }}
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

          <div className="relative hidden md:block">
            <button
              ref={getStartedButton}
              type="button"
              className={`flex items-center gap-1 ${ctaClass}`}
              aria-expanded={getStartedOpen}
              aria-haspopup="true"
              aria-controls="get-started-menu"
              onClick={() => { setGetStartedOpen((open) => !open); setResourcesOpen(false); }}
              onKeyDown={onGetStartedKeyDown}
            >
              Get Started
              <ChevronDown className={`h-3 w-3 transition-transform ${getStartedOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {getStartedOpen && (
              <div
                id="get-started-menu"
                ref={getStartedPanel}
                role="menu"
                aria-label="Get started"
                className="absolute top-full right-0 mt-3 w-44 bg-black/90 backdrop-blur-xl border border-neutral-600 p-1.5 shadow-2xl z-50"
                onKeyDown={(event) => onMenuKeyDown(event, getStartedPanel)}
              >
                {getStarted.map((link) => (
                  <a key={link.label} role="menuitem" href={link.href} className={itemClass} onClick={(event) => follow(event, link.href)}>{link.label}</a>
                ))}
              </div>
            )}
          </div>

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
              <a key={link.label} href={resolve(link.href)} className={itemClass} onClick={(event) => follow(event, resolve(link.href))}>{link.label}</a>
            ))}
            <p className="px-3 pt-3 pb-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white/40">Resources</p>
            {resources.map((link) => (
              <a key={link.label} href={link.href} className={itemClass} {...externalProps(link)} onClick={(event) => follow(event, link.href)}>{link.label}</a>
            ))}
            <p className="px-3 pt-3 pb-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white/40">Get started</p>
            {getStarted.map((link) => (
              <a key={link.label} href={link.href} className={itemClass} onClick={(event) => follow(event, link.href)}>{link.label}</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
