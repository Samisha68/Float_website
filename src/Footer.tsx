import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const GITHUB_URL = "https://github.com/Samisha68/Float-Finance";
const X_URL = "https://x.com/float_fi";
// TODO: confirm destinations. Product and onboarding links point at the closest existing page for now.
const columns: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Product", links: [
    { label: "Infrastructure", href: "/docs/architecture" },
    { label: "FLOAT Score", href: "/docs/overview" },
    { label: "API", href: "/docs/api-reference" },
  ] },
  { title: "Developers", links: [{ label: "Documentation", href: "/docs" }] },
  { title: "Onboarding", links: [
    { label: "Service Provider", href: "/docs/get-started" },
    { label: "Business", href: "/" },
  ] },
  { title: "Company", links: [
    { label: "About", href: "/docs/overview" },
    { label: "Contact", href: X_URL },
  ] },
];
const socials = [
  { label: "X / Twitter", href: X_URL },
  { label: "GitHub", href: GITHUB_URL },
];

// Geometry of the arc in viewBox units: the top of an ellipse rising out of the bottom edge.
const VB_W = 1400, VB_H = 420, CX = 700, CY = 570, RX = 820, RY = 330;
const arcY = (x: number) => CY - RY * Math.sqrt(Math.max(0, 1 - ((x - CX) / RX) ** 2));
const ARC_HALF = RX * Math.sqrt(1 - ((VB_H - CY) / RY) ** 2);
const ARC_PATH = `M ${CX - ARC_HALF} ${VB_H} A ${RX} ${RY} 0 0 1 ${CX + ARC_HALF} ${VB_H}`;

const primary = [
  { label: "Credit", x: 440 },
  { label: "Float", x: 700 },
  { label: "Your Business", x: 960 },
];
const minorNodes = [90, 260, 1140, 1310].map((x) => ({ x, y: arcY(x) }));

// Deterministic scatter, so the field never reshuffles between renders.
function makeParticles(count: number) {
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: count }, () => {
    const x = rand() * VB_W;
    const y = Math.min(VB_H - 8, Math.max(24, arcY(x) + (rand() - 0.62) * 170));
    return { x, y, r: 0.6 + rand() * 1.1, o: 0.1 + rand() * 0.4, d: 3 + rand() * 4, delay: rand() * 4 };
  });
}

const linkClass = "text-sm text-[#888888] hover:text-white focus-visible:text-white transition-colors";

export default function Footer() {
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1400);
  const [active, setActive] = useState(1);
  const particles = useMemo(() => makeParticles(30), []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setActive((i) => (i + 1) % primary.length), 2500);
    return () => clearInterval(id);
  }, [reduced]);

  // The SVG uses "slice", so its scale and crop follow the container width; mirror that to place
  // the HTML nodes and badges, keeping them on the arc and inside the viewport on narrow screens.
  const scale = Math.max(width / VB_W, 1);
  const place = (x: number) => {
    const px = Math.min(Math.max(width / 2 + (x - CX) * scale, 64), width - 64);
    const vx = CX + (px - width / 2) / scale;
    return { left: px, top: VB_H - (VB_H - arcY(vx)) * scale };
  };

  return (
    <footer className="relative bg-[#0B0B0B] font-[family-name:var(--font-ui)] text-white overflow-hidden" aria-label="Footer">
      <div ref={stage} className="relative h-[420px] w-full overflow-hidden bg-black" aria-hidden="true">
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMax slice">
          <defs>
            <radialGradient id="float-surface" cx="50%" cy="0%" r="75%">
              <stop offset="0%" stopColor="#333333" />
              <stop offset="45%" stopColor="#111111" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            <filter id="float-glow" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <filter id="float-signal" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="url(#float-surface)" />
          <path d={ARC_PATH} fill="none" stroke="#FFFFFF" strokeWidth="9" opacity="0.08" filter="url(#float-glow)" />
          <path d={ARC_PATH} fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.35" />

          {particles.map((p, i) => (
            <motion.circle
              key={i} cx={p.x} cy={p.y} r={p.r} fill={i % 3 ? "#FFFFFF" : "#999999"} opacity={p.o}
              animate={reduced ? undefined : { opacity: [p.o, p.o * 0.3, p.o] }}
              transition={{ duration: p.d, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {minorNodes.map((n) => (
            <g key={n.x}>
              <circle cx={n.x} cy={n.y} r="6" fill="none" stroke="#444444" strokeWidth="1" />
              <circle cx={n.x} cy={n.y} r="2" fill="#FFFFFF" opacity="0.6" />
            </g>
          ))}

          <motion.path
            d={ARC_PATH} fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="120 1800"
            filter="url(#float-signal)" opacity="0.5"
            animate={reduced ? undefined : { strokeDashoffset: [0, -1920] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d={ARC_PATH} fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="120 1800"
            initial={{ strokeDashoffset: reduced ? -700 : 0 }}
            animate={reduced ? undefined : { strokeDashoffset: [0, -1920] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Dissolves the arch into the navigation panel below. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 backdrop-blur-[6px]"
          style={{ maskImage: "linear-gradient(to bottom, transparent, #000)", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000)" }}
        />

        {primary.map((node, i) => {
          const { left, top } = place(node.x);
          const on = active === i;
          return (
            <div key={node.label} className="absolute" style={{ left, top }}>
              {/* Badge, with a hairline dropping to the node. */}
              <div className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center">
                <span
                  className="whitespace-nowrap rounded-sm border px-2 py-1 text-[0.6875rem] font-medium tracking-wide bg-[#111111] transition-[color,border-color,box-shadow] duration-500 max-[480px]:px-1.5 max-[480px]:text-[0.625rem]"
                  style={{ borderColor: on ? "#666666" : "#262626", color: on ? "#FFFFFF" : "#888888", boxShadow: on ? "0 0 24px rgba(255,255,255,0.08)" : "none" }}
                >{node.label}</span>
                <span className="block h-10 w-px" style={{ background: `linear-gradient(to bottom, ${on ? "#FFFFFF" : "#888888"}, transparent)`, opacity: on ? 0.7 : 0.35 }} />
              </div>
              {/* Node: grey ring, white dot, soft white pulse while active. */}
              <span className="absolute -left-2.5 -top-2.5 block h-5 w-5 rounded-full border border-[#444444] bg-black" />
              <span className="absolute -left-[3px] -top-[3px] block h-1.5 w-1.5 rounded-full bg-white" />
              <motion.span
                className="absolute -left-2.5 -top-2.5 block h-5 w-5 rounded-full bg-white"
                initial={{ opacity: 0 }}
                animate={on && !reduced ? { opacity: [0.3, 0.8, 0], scale: [1, 1.4, 1.4] } : { opacity: 0, scale: 1 }}
                transition={on ? { duration: 2.5, ease: "easeOut" } : { duration: 0.4 }}
                style={{ filter: "blur(6px)" }}
              />
            </div>
          );
        })}
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-6 pt-14 pb-10 md:px-12 md:pt-20 lg:px-16">
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold text-white md:text-[0.9375rem]">{col.title}</h3>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {col.links.map((link) => (
                  <li key={link.label}><a href={link.href} className={linkClass} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-14 flex flex-wrap gap-3 md:mt-20">
          {socials.map((s) => (
            <a
              key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className="border border-[#333333] bg-transparent px-4 py-2 text-[0.8125rem] font-medium text-white transition-colors hover:border-[#666666] hover:bg-white/5 focus-visible:border-[#666666] focus-visible:bg-white/5"
            >{s.label}</a>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#262626] pt-6 text-xs text-[#666666] md:flex-row md:items-center md:justify-between">
          <p className="m-0">© 2026 FLOAT. All rights reserved.</p>
          <p className="m-0">Credit infrastructure for the internet economy.</p>
        </div>
      </div>
    </footer>
  );
}
