import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { FaBars, FaGithub, FaMoon, FaSun, FaXmark } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa6";
import { components, DocLink } from "./components";
import { INDEX_SLUG, pageForPath, pages, sections, type DocPage } from "./pages";
import { applyStoredTheme, toggleTheme } from "./theme";
import "./float.css";
import "./docs.css";

const GITHUB_URL = "https://github.com/Samisha68/Float-Finance";

function Logo({ height }: { height: number }) {
  const width = Math.round((height * 1895) / 437);
  return (
    <>
      <img className="logo logo--light" src="/docs-assets/logo-light.svg" alt="Float" width={width} height={height} />
      <img className="logo logo--dark" src="/docs-assets/logo-dark.svg" alt="" aria-hidden width={width} height={height} />
    </>
  );
}

function Header({ menuOpen, onMenu }: { menuOpen: boolean; onMenu: () => void }) {
  return (
    <header className="docs-header">
      <div className="docs-header__inner">
        <button type="button" className="docs-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="docs-sidebar" onClick={onMenu}>
          {menuOpen ? <FaXmark aria-hidden /> : <FaBars aria-hidden />}
        </button>
        <DocLink href="/docs" className="docs-logo" aria-label="Float docs home"><Logo height={28} /></DocLink>
        <nav className="docs-nav" aria-label="Site">
          <DocLink href="/docs/roadmap" className="docs-nav__link">Roadmap</DocLink>
          <a className="docs-nav__icon" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="Float on GitHub"><FaGithub aria-hidden /></a>
          <button type="button" className="docs-nav__icon" onClick={toggleTheme} aria-label="Toggle light and dark theme">
            <FaMoon className="icon-moon" aria-hidden /><FaSun className="icon-sun" aria-hidden />
          </button>
          <DocLink href="/docs" className="docs-nav__cta">Get started <FaArrowRight aria-hidden /></DocLink>
        </nav>
      </div>
    </header>
  );
}

function Sidebar({ current, open }: { current?: DocPage; open: boolean }) {
  return (
    <aside id="docs-sidebar" className={`docs-sidebar${open ? " is-open" : ""}`} aria-label="Documentation">
      <nav>
        {sections.map((section) => (
          <div className="side-section" key={section.title}>
            {section.title ? <div className="side-title">{section.title}</div> : null}
            <ul>
              {section.pages.map((page) => (
                <li key={page.slug}>
                  <DocLink href={page.url} className={page === current ? "side-link is-active" : "side-link"} aria-current={page === current ? "page" : undefined}>
                    {page.title}
                  </DocLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function Toc({ page }: { page: DocPage }) {
  const [active, setActive] = useState<string>();
  useEffect(() => {
    const headings = page.toc.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;
    // The active heading is the last one that has scrolled past the top band of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [page]);

  if (!page.toc.length) return <aside className="docs-toc" aria-hidden />;
  return (
    <aside className="docs-toc" aria-label="On this page">
      <div className="toc-title">On this page</div>
      <ul>
        {page.toc.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "toc-sub" : undefined}>
            <a href={`#${item.id}`} className={item.id === active ? "is-active" : undefined}>{item.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PrevNext({ page }: { page: DocPage }) {
  const i = pages.indexOf(page);
  const prev = pages[i - 1];
  const next = pages[i + 1];
  if (!prev && !next) return null;
  return (
    <nav className="prev-next" aria-label="Previous and next page">
      {prev ? <DocLink href={prev.url} className="prev-next__link"><span>Previous</span><strong>{prev.title}</strong></DocLink> : <span />}
      {next ? <DocLink href={next.url} className="prev-next__link prev-next__link--next"><span>Next</span><strong>{next.title}</strong></DocLink> : <span />}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="float-footer">
      <div className="float-footer__glow" aria-hidden="true" />
      <div className="float-footer__inner">
        <div className="float-footer__brand">
          <DocLink href="/docs" className="float-footer__logo" aria-label="Float home"><Logo height={24} /></DocLink>
          <p className="float-footer__tagline">
            Cross-platform credit infrastructure for Solana. Underwriting, obligations and portable reputation built on evidence Float verifies itself.
          </p>
          <span className="float-footer__pill"><span className="float-footer__dot" /> Sandbox live · Built on Solana</span>
        </div>
        <nav className="float-footer__cols" aria-label="Footer">
          <div className="float-footer__col">
            <h4>Start</h4>
            <ul>
              <li><DocLink href="/get-started">Get started</DocLink></li>
              <li><DocLink href="/overview">Overview</DocLink></li>
              <li><DocLink href="/get-started#sandbox">Sandbox outcomes</DocLink></li>
            </ul>
          </div>
          <div className="float-footer__col">
            <h4>Concepts</h4>
            <ul>
              <li><DocLink href="/architecture">Architecture</DocLink></li>
              <li><DocLink href="/decision-log">Decision log</DocLink></li>
              <li><DocLink href="/roadmap">Roadmap</DocLink></li>
            </ul>
          </div>
          <div className="float-footer__col">
            <h4>Build</h4>
            <ul>
              <li><DocLink href="/api-reference">API Reference</DocLink></li>
              <li><DocLink href="/overview#events">Events</DocLink></li>
              <li><DocLink href={GITHUB_URL}>GitHub</DocLink></li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="float-footer__bar">
        <span>© 2026 Float Finance</span>
        <span>Float never holds, routes or moves funds.</span>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <>
      <h1 className="page-title">Page not found</h1>
      <p className="page-subtitle">There is no docs page at this address.</p>
      <p><DocLink href="/docs">Back to Get started</DocLink></p>
    </>
  );
}

export default function DocsApp() {
  const { pathname, hash } = useLocation();
  const page = pageForPath(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    applyStoredTheme();
    return () => document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    document.title = page ? `${page.title} | Float Docs` : "Page not found | Float Docs";
    document.querySelector('meta[name="description"]')?.setAttribute("content", page?.description ?? "");
    setMenuOpen(false);
  }, [page]);

  // Client-side navigation doesn't scroll on its own: honour #anchors, otherwise start at the top.
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  if (pathname.replace(/\/+$/, "") === `/docs/${INDEX_SLUG}`) return <Navigate to={`/docs${hash}`} replace />;

  const Content = page?.Content;
  return (
    <div className="docs-root">
      <Header menuOpen={menuOpen} onMenu={() => setMenuOpen((open) => !open)} />
      <div className="docs-shell">
        <Sidebar current={page} open={menuOpen} />
        {menuOpen ? <button type="button" className="docs-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} /> : null}
        <main className="docs-main">
          <article className="docs-article">
            {page && Content ? (
              <>
                <h1 className="page-title">{page.title}</h1>
                {page.subtitle ? <p className="page-subtitle">{page.subtitle}</p> : null}
                <div className="prose"><Content components={components} /></div>
                <PrevNext page={page} />
              </>
            ) : <NotFound />}
          </article>
        </main>
        {page ? <Toc page={page} /> : <aside className="docs-toc" aria-hidden />}
      </div>
      <Footer />
    </div>
  );
}
