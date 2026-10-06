import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import type { IconType } from "react-icons";

const GITHUB_URL = "https://github.com/Samisha68/Float-Finance";
const X_URL = "https://x.com/float_fi";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Product", links: [
    { label: "Infrastructure", href: "/docs/architecture" },
    { label: "FLOAT Score", href: "/docs/overview" },
    { label: "API", href: "/docs/api-reference" },
  ] },
  { title: "Developers", links: [{ label: "Documentation", href: "/docs" }] },
  { title: "Onboarding", links: [
    { label: "Service Provider", href: "/docs/get-started" },
    { label: "Business", href: "/onboard" },
  ] },
  { title: "Company", links: [
    { label: "About", href: "/docs/overview" },
    { label: "Contact", href: X_URL },
  ] },
];
const socials = [
  { label: "X / Twitter", href: X_URL, Icon: FaXTwitter },
  { label: "GitHub", href: GITHUB_URL, Icon: FaGithub },
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

              <div className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center">
                <span
                  className="whitespace-nowrap rounded-sm border px-2 py-1 text-[0.6875rem] font-medium tracking-wide bg-[#111111] transition-[color,border-color,box-shadow] duration-500 max-[480px]:px-1.5 max-[480px]:text-[0.625rem]"
                  style={{ borderColor: on ? "#666666" : "#262626", color: on ? "#FFFFFF" : "#888888", boxShadow: on ? "0 0 24px rgba(255,255,255,0.08)" : "none" }}
                >{node.label}</span>
                <span className="block h-10 w-px" style={{ background: `linear-gradient(to bottom, ${on ? "#FFFFFF" : "#888888"}, transparent)`, opacity: on ? 0.7 : 0.35 }} />
              </div>

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

      <div className="mx-auto w-full max-w-[1440px] px-8 pt-14 pb-10 sm:px-12 md:px-20 md:pt-20 lg:px-28 xl:px-36">
        <div className="grid gap-12 lg:grid-cols-[minmax(11rem,1fr)_3fr] lg:gap-16">
          <div className="flex flex-col justify-between gap-10 lg:min-h-[17rem]">
            <a href="/" aria-label="Float home" className="inline-flex w-fit">
              <img src="/docs-assets/logo-dark.svg" alt="" className="h-6 w-auto" />
            </a>
            <div className="hidden items-center gap-5 lg:flex">
              {socials.map((s) => <SocialIcon key={s.label} {...s} />)}
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-10">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-5 text-sm font-semibold text-white md:text-[0.9375rem]">{col.title}</h3>
                <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
                  {col.links.map((link) => (
                    <li key={link.label}><a href={link.href} className={linkClass} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-5 lg:hidden">
            {socials.map((s) => <SocialIcon key={s.label} {...s} />)}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-[#262626] pt-6 text-xs text-[#666666] md:mt-16 md:flex-row md:items-center md:justify-between">
          <p className="m-0">© 2026 FLOAT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ label, href, Icon }: { label: string; href: string; Icon: IconType }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-[#888888] transition-colors hover:text-white focus-visible:text-white">
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </a>
  );
}
