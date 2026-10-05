import {
  Children, createContext, Fragment, isValidElement, useContext, useEffect, useId, useRef, useState,
  type AnchorHTMLAttributes, type ComponentType, type ReactElement, type ReactNode,
} from "react";
import { Link } from "react-router";
import GithubSlugger from "github-slugger";
import { FaArrowRight, FaCircleInfo, FaLightbulb, FaRegCopy, FaCheck, FaTriangleExclamation } from "react-icons/fa6";
import { docHref } from "./pages";
import { Icon } from "./icons";

/** The element children of a component, looking through the Fragments MDX wraps block content in. */
function elementChildren<P>(children: ReactNode): ReactElement<P>[] {
  return Children.toArray(children).flatMap((child) =>
    !isValidElement(child) ? []
    : child.type === Fragment ? elementChildren<P>((child.props as { children?: ReactNode }).children)
    : [child as ReactElement<P>]);
}

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

// ── Links ──────────────────────────────────────────────────────────────────

/** Internal links in the MDX are written site-relative (/overview); they live under /docs here. */
export function DocLink({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/")) return <Link to={docHref(href)} {...rest}>{children}</Link>;
  if (href.startsWith("#") || href.startsWith("mailto:")) return <a href={href} {...rest}>{children}</a>;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
}

// ── Callouts ───────────────────────────────────────────────────────────────

function callout(kind: string, label: string, IconComponent: ComponentType) {
  return function Callout({ children }: { children?: ReactNode }) {
    return (
      <div className={`callout callout--${kind}`} role="note">
        <span className="callout-icon" aria-hidden><IconComponent /></span>
        <div className="callout-body"><span className="callout-label">{label}</span>{children}</div>
      </div>
    );
  };
}
const Note = callout("note", "Note", FaCircleInfo);
const Info = callout("info", "Info", FaCircleInfo);
const Tip = callout("tip", "Tip", FaLightbulb);
const Warning = callout("warning", "Warning", FaTriangleExclamation);

// ── Cards ──────────────────────────────────────────────────────────────────

type CardProps = { title: string; icon?: string; href?: string; children?: ReactNode };

function Card({ title, icon, href, children }: CardProps) {
  const inner = (
    <>
      <div className="card-head">
        <Icon name={icon} />
        <span className="card-title">{title}</span>
        {href ? <FaArrowRight className="card-arrow" aria-hidden /> : null}
      </div>
      {children ? <div className="card-body">{children}</div> : null}
    </>
  );
  return href
    ? <DocLink href={href} className="card card--link">{inner}</DocLink>
    : <div className="card">{inner}</div>;
}

function CardGroup({ cols = 2, children }: { cols?: number; children?: ReactNode }) {
  return <div className="card-group" style={{ "--cols": cols } as React.CSSProperties}>{children}</div>;
}

// ── Tabs ───────────────────────────────────────────────────────────────────

type TabProps = { title: string; children?: ReactNode };

function Tab({ children }: TabProps) {
  return <>{children}</>;
}

/** Shared tab strip. Every panel is rendered (hidden when inactive) so all content is in the static HTML. */
function TabSet({ labels, panels, className }: { labels: string[]; panels: ReactNode[]; className: string }) {
  const [active, setActive] = useState(0);
  const uid = useId();
  return (
    <div className={className}>
      <div className="tabs-list" role="tablist">
        {labels.map((label, i) => (
          <button
            key={label + i}
            type="button"
            role="tab"
            id={`${uid}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${uid}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next = (i + (e.key === "ArrowRight" ? 1 : labels.length - 1)) % labels.length;
              setActive(next);
              document.getElementById(`${uid}-tab-${next}`)?.focus();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div key={i} role="tabpanel" id={`${uid}-panel-${i}`} aria-labelledby={`${uid}-tab-${i}`} hidden={i !== active} className="tabs-panel">
          {panel}
        </div>
      ))}
    </div>
  );
}

function Tabs({ children }: { children?: ReactNode }) {
  const tabs = elementChildren<TabProps>(children);
  return <TabSet className="tabs" labels={tabs.map((t) => t.props.title)} panels={tabs.map((t) => t.props.children)} />;
}

// ── Steps ──────────────────────────────────────────────────────────────────

function Steps({ children }: { children?: ReactNode }) {
  return <ol className="steps">{children}</ol>;
}

function Step({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <li className="step">
      <div className="step-title">{title}</div>
      <div className="step-body">{children}</div>
    </li>
  );
}

// ── Accordions ─────────────────────────────────────────────────────────────

function Accordion({ title, children }: { title: string; children?: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const id = new GithubSlugger().slug(title);
  // Open when linked to directly (e.g. /docs/overview#events).
  useEffect(() => {
    const open = () => { if (window.location.hash === `#${id}` && ref.current) ref.current.open = true; };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [id]);
  return (
    <details className="accordion" id={id} ref={ref}>
      <summary>{title}</summary>
      <div className="accordion-body">{children}</div>
    </details>
  );
}

function AccordionGroup({ children }: { children?: ReactNode }) {
  return <div className="accordion-group">{children}</div>;
}

// ── Code ───────────────────────────────────────────────────────────────────

const InCodeBlocks = createContext(false);

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      className="copy-button"
      aria-label={copied ? "Copied" : "Copy code"}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1600);
        }, () => { /* Clipboard blocked: leave the button as it was. */ });
      }}
    >
      {copied ? <FaCheck aria-hidden /> : <FaRegCopy aria-hidden />}
      <span className="copy-label" aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

let mermaidRuns = 0;

function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, theme: "base", securityLevel: "strict", fontFamily: "Inter, sans-serif" });
      try {
        const { svg } = await mermaid.render(`mermaid-${++mermaidRuns}`, chart);
        if (!cancelled) setSvg(svg);
      } catch (error) {
        console.error("[docs] mermaid failed to render", error);
      }
    });
    return () => { cancelled = true; };
  }, [chart]);
  // Until it renders (and when it can't, or JS is off) the diagram source stays readable.
  return svg
    ? <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />
    : <div className="mermaid mermaid--pending"><pre>{chart}</pre></div>;
}

type PreProps = { children?: ReactNode; "data-language"?: string; "data-meta"?: string } & Record<string, unknown>;

function Pre({ children, ...props }: PreProps) {
  const inGroup = useContext(InCodeBlocks);
  if (props["data-language"] === "mermaid") return <Mermaid chart={textOf(children).trim()} />;
  const title = props["data-meta"];
  return (
    <div className="code-frame">
      {title && !inGroup ? <div className="code-title">{title}</div> : null}
      <CopyButton text={textOf(children).replace(/\n$/, "")} />
      <pre {...props}>{children}</pre>
    </div>
  );
}

/** Groups consecutive fences into tabs, labelled by each fence's title (```bash cURL → "cURL"). */
function CodeBlocks({ children }: { children?: ReactNode }) {
  const blocks = elementChildren<PreProps>(children);
  const labels = blocks.map((b) => b.props["data-meta"] || b.props["data-language"] || "Code");
  return (
    <InCodeBlocks.Provider value>
      <TabSet className="tabs codeblocks" labels={labels} panels={blocks} />
    </InCodeBlocks.Provider>
  );
}

// ── Registry ───────────────────────────────────────────────────────────────

export const components = {
  a: DocLink,
  pre: Pre,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => <div className="table-wrap"><table {...props} /></div>,
  Note, Info, Tip, Warning, Card, CardGroup, Tabs, Tab, Steps, Step, Accordion, AccordionGroup, CodeBlocks,
};
