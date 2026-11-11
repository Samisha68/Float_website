import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from "react";
const Waitlist = lazy(() => import("./Waitlist"));

export type Payload = { business: string; community: boolean; socials: string };

const DOCS_URL = "https://float-finance.docs.buildwithfern.com";
const X_URL = "https://x.com/float_fi";

const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Sample product cards. Illustration only: every name, address and number is made up. */

function ReputationCard() {
  return <div className="card rep-card">
    <div className="rep-head">
      <div><p className="eyebrow">Credit reputation</p><h3 className="rep-name">Business XYZ <Verified /></h3></div>
      <span className="badge badge-dot">Connected</span>
    </div>
    <div className="rep-score">
      <p className="rep-score-value num">82<span>/100</span></p>
      <div className="rep-score-meta"><p className="eyebrow">Float score</p><p>Strong reputation</p></div>
    </div>
    <div className="meter" aria-hidden="true"><span style={{ width: "82%" }} /></div>
    <dl className="rep-rows">
      <div><dt>On-time repayments</dt><dd className="num">96%</dd></div>
      <div><dt>Credit limit</dt><dd className="num">$2,500</dd></div>
      <div><dt>Next settlement</dt><dd className="num">Dec 1, 2026</dd></div>
    </dl>
    <p className="rep-foot"><span className="mono">7xKX…9F2A</span><img src="/logo.svg" alt="" /></p>
  </div>;
}

const EVENTS = [
  { label: "Provider paid upfront", value: "$12.40" },
  { label: "Repayment settled on time", value: "$102.50" },
  { label: "Limit raised", value: "$1,000 → $2,500" },
  { label: "Usage on credit", value: "$31.80" },
];

function LiveChip() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduceMotion()) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % EVENTS.length), 2600);
    return () => clearInterval(id);
  }, []);
  const e = EVENTS[i];
  return <div className="card chip" aria-hidden="true">
    <span className="chip-dot" />
    <div key={i} className="chip-body"><p>{e.label}</p><p className="num">{e.value}</p></div>
    <span className="eyebrow">Solana</span>
  </div>;
}

function ProviderCard() {
  const rows = [
    { name: "Northwind Labs", used: 1840, limit: 5000, status: "Active" },
    { name: "Helios Data", used: 850, limit: 2500, status: "Active" },
    { name: "Quill Agents", used: 600, limit: 2500, status: "Review" },
  ];
  return <div className="card mini">
    <div className="mini-bar"><span>Customer credit</span><span className="eyebrow">Paid upfront</span></div>
    {rows.map((r) => <div className="mini-row" key={r.name}>
      <span>{r.name}</span>
      <span className="usage-bar" aria-hidden="true"><span style={{ width: `${Math.round(r.used / r.limit * 100)}%` }} /></span>
      <span className="num muted">${r.used.toLocaleString("en-US")}</span>
    </div>)}
  </div>;
}

function Verified() {
  return <svg className="verified" viewBox="0 0 16 16" role="img" aria-label="Verified"><circle cx="8" cy="8" r="8" fill="currentColor"/><path d="M4.8 8.2l2.1 2.1 4.3-4.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const STEPS = [
  { title: "Provider plugs in", text: "One API, at the provider's checkout.", actor: "Provider" },
  { title: "Float sets a limit", text: "From repayment history, verified on-chain.", actor: "Float" },
  { title: "Use now", text: "Float pays the provider upfront.", actor: "Business" },
  { title: "Settle on Solana", text: "Capped, revocable pulls from the wallet.", actor: "Business and Float" },
];

export default function App() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  const toJoin = (e?: { preventDefault(): void }) => {
    e?.preventDefault();
    document.getElementById("access")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
    window.setTimeout(() => firstField.current?.focus({ preventScroll: true }), 600);
  };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setPayload({ business: String(data.get("business") ?? ""), community: data.get("community") === "on", socials: String(data.get("socials") ?? "") });
  }

  return <div className="app">
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="/" aria-label="Float home"><img src="/logo.svg" alt="Float" /></a>
        <nav className="topbar-nav" aria-label="Primary">
          <a href="#businesses">Businesses</a>
          <a href="#providers">Providers</a>
          <a href="#how">How it works</a>
          <a href={DOCS_URL} target="_blank" rel="noreferrer">Docs</a>
        </nav>
        <a className="btn btn-primary btn-sm topbar-action" href="#access" onClick={toJoin}>Get early access</a>
      </div>
    </header>

    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Credit infrastructure on Solana</p>
            <h1 id="hero-title">Credit for the on&#8209;chain economy.</h1>
            <p className="lede">Businesses use now and pay later. Providers get paid upfront.</p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="#access" onClick={toJoin}>Get early access</a>
              <a className="link-arrow" href="#how">How it works <span aria-hidden="true">→</span></a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="photo hero-photo"><img src="/images/entry-architecture.jpg" alt="" /></div>
            <div className="hero-overlay"><ReputationCard /></div>
            <div className="hero-chip"><LiveChip /></div>
            <p className="rep-caption">Illustration with sample data.</p>
          </div>
        </div>
      </section>

      <div className="container backers">
        <p className="eyebrow">Backed by a Solana Foundation grant</p>
        <p className="eyebrow">Colosseum Radar</p>
        <p className="eyebrow">Superteam India</p>
        <p className="eyebrow">Superteam Malaysia</p>
      </div>

      <section className="section" aria-labelledby="sides-title">
        <div className="container">
          <header className="section-head"><div><p className="eyebrow">One credit layer</p><h2 id="sides-title">Built for both sides of the bill.</h2></div></header>
          <div className="tiles">
            <article className="tile" id="businesses">
              <div className="photo tile-photo"><img src="/images/business-owner.jpg" alt="" /></div>
              <div className="tile-card"><ReputationMini /></div>
              <p className="eyebrow">Businesses and AI agents</p>
              <h3>Keep building on credit.</h3>
              <p className="muted">A limit from your payment history. A record that follows your wallet.</p>
            </article>
            <article className="tile" id="providers">
              <div className="photo tile-photo"><img src="/images/provider-infra.jpg" alt="" /></div>
              <div className="tile-card"><ProviderCard /></div>
              <p className="eyebrow">API, RPC and compute providers</p>
              <h3>Get paid upfront.</h3>
              <p className="muted">Offer pay-later at checkout. Float carries the credit.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="how" aria-labelledby="how-title">
        <div className="container">
          <header className="section-head"><div><p className="eyebrow">Process</p><h2 id="how-title">How it works</h2></div>
            <a className="link-arrow" href={DOCS_URL} target="_blank" rel="noreferrer">API reference <span aria-hidden="true">↗</span></a>
          </header>
          <ol className="steps">
            {STEPS.map((s, i) => <li key={s.title} className="step">
              <span className="step-num mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3><p>{s.text}</p><p className="step-actor">{s.actor}</p>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="image-band" aria-label="Private beta">
        <div className="photo"><img src="/images/provider-code.jpg" alt="" /></div>
        <div className="container image-band-text">
          <p className="eyebrow">Private beta</p>
          <p className="image-band-quote">Live with Solami. Settled on Solana.</p>
        </div>
      </section>

      <section className="section" id="team" aria-labelledby="team-title">
        <div className="container">
          <header className="section-head"><div><p className="eyebrow">Leadership</p><h2 id="team-title">Led by Solana operators.</h2></div></header>
          <ul className="people">
            <li><p className="person-name">Samisha</p><p className="eyebrow">Co-founder &amp; CEO</p><p className="muted">GreenKWh, 1st in DePIN at Colosseum Radar. Superteam India.</p><a className="link-arrow" href="https://x.com/samisha_x" target="_blank" rel="noreferrer">@samisha_x <span aria-hidden="true">↗</span></a></li>
            <li><p className="person-name">Alia</p><p className="eyebrow">Co-founder &amp; CTO</p><p className="muted">Top 5 in Infrastructure at Colosseum Radar. Pudgy Asia. Superteam Malaysia.</p><a className="link-arrow" href="https://x.com/_alialee" target="_blank" rel="noreferrer">@_alialee <span aria-hidden="true">↗</span></a></li>
          </ul>
        </div>
      </section>

      <section className="section section-alt" id="access" aria-labelledby="access-title">
        <div className="container access">
          <div><p className="eyebrow">Early access</p><h2 id="access-title" className="section-title">Get on credit early.</h2><p className="section-sub">We onboard businesses alongside new providers.</p></div>
          <form className="card access-form" onSubmit={submit}><fieldset disabled={!!payload}>
            <div className="field"><label htmlFor="business">Your business</label><input ref={firstField} id="business" name="business" required maxLength={160} autoComplete="organization" placeholder="What you do, or plan to do" pattern={".*\\S.*"} /></div>
            <div className="field"><label htmlFor="socials">X or website <span className="optional">optional</span></label><input id="socials" name="socials" maxLength={200} placeholder="@handle or a link" /></div>
            <label className="check"><input type="checkbox" name="community" /><span>Join the Float community</span></label>
            <button className="btn btn-primary btn-lg btn-block" type="submit">Save my place</button>
          </fieldset></form>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="container site-footer-inner">
        <img src="/logo.svg" alt="Float" />
        <nav className="footer-links" aria-label="Footer">
          <a href={DOCS_URL} target="_blank" rel="noreferrer">Docs</a>
          <a href={X_URL} target="_blank" rel="noreferrer">X</a>
        </nav>
        <p>© {new Date().getFullYear()} Float. Credit infrastructure on Solana.</p>
      </div>
    </footer>

    {payload && <Suspense fallback={<p className="auth-status" role="status">Opening secure sign-in…</p>}>
      <Waitlist payload={payload} onClose={() => setPayload(null)} />
    </Suspense>}
  </div>;
}

function ReputationMini() {
  return <div className="card mini">
    <div className="mini-bar"><span>Business XYZ</span><span className="badge badge-dot">Connected</span></div>
    <div className="mini-score"><p className="num">82<span>/100</span></p><p className="eyebrow">Float score</p></div>
    <div className="meter" aria-hidden="true"><span style={{ width: "82%" }} /></div>
  </div>;
}
