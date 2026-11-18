import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from "react";
const Waitlist = lazy(() => import("./Waitlist"));

export type Role = "user" | "provider";
export type Payload = { role: Role; business: string; community: boolean; socials: string };

const DOCS_URL = "https://float-finance.docs.buildwithfern.com";

const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Sample product cards. Illustration only: every name, address and number is made up. */

function ReputationCard() {
  return <div className="card rep-card">
    <div className="rep-head">
      <div>
        <p className="label">Credit line</p>
        <h3 className="rep-name">User XYZ</h3>
        <p className="rep-verified"><Verified /> Payment history verified</p>
      </div>
      <span className="badge badge-dot">Connected</span>
    </div>
    <div className="rep-score">
      <p className="rep-score-value num">82<span>/100</span></p>
      <div className="rep-score-meta"><p className="label">Float Score</p><p>Strong reputation</p></div>
    </div>
    <div className="meter" aria-hidden="true"><span style={{ width: "82%" }} /></div>
    <dl className="rep-rows">
      <div><dt>On-time repayments</dt><dd className="num">96%</dd></div>
      <div><dt>Credit limit</dt><dd className="num">$250</dd></div>
      <div className="rep-used">
        <dt>Used this cycle</dt><dd className="num">$62.40</dd>
        <span className="usage-bar" aria-hidden="true"><span style={{ width: `${62.4 / 250 * 100}%` }} /></span>
      </div>
      <div><dt>Next settlement</dt><dd className="num">Dec 1, 2026</dd></div>
    </dl>
    <p className="rep-foot"><span className="mono">7xKX…9F2A</span><img src="/logo.svg" alt="" /></p>
  </div>;
}

const EVENTS = [
  { label: "Usage on credit", value: "$31.80" },
  { label: "Provider paid upfront", value: "$31.80" },
  { label: "Repayment auto-collected on time", value: "$62.40" },
  { label: "Limit raised", value: "$250 → $400" },
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
    <div key={i} className="chip-body">
      <p>{e.label}</p>
      <p className="chip-value"><span className="num">{e.value}</span><span className="label">Solana</span></p>
    </div>
  </div>;
}

function ProviderCard() {
  const rows = [
    { name: "Northwind Labs", used: 1840, limit: 5000, status: "Active" },
    { name: "Helios Data", used: 850, limit: 2500, status: "Active" },
    { name: "Quill Agents", used: 600, limit: 2500, status: "Review" },
  ];
  return <div className="card mini">
    <div className="mini-bar"><span>Customer credit</span><span className="label">Paid upfront</span></div>
    {rows.map((r) => <div className="mini-row" key={r.name}>
      <span>{r.name}</span>
      <span className="usage-bar" aria-hidden="true"><span style={{ width: `${Math.round(r.used / r.limit * 100)}%` }} /></span>
      <span className="num muted">${r.used.toLocaleString("en-US")}</span>
    </div>)}
  </div>;
}

function Verified() {
  return <svg className="verified" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="currentColor"/><path d="M4.8 8.2l2.1 2.1 4.3-4.5" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const ROLES: { value: Role; title: string; text: string }[] = [
  { value: "user", title: "User", text: "Use services now, repay automatically." },
  { value: "provider", title: "Provider", text: "Offer credit, get paid upfront." },
];

const STEPS = [
  { title: "Provider plugs in", text: "One API, at the provider's checkout.", actor: "Provider" },
  { title: "Float sets a limit", text: "From repayment history, verified on-chain.", actor: "Float" },
  { title: "Use now", text: "Float pays the provider upfront.", actor: "User" },
  { title: "Settle on Solana", text: "Capped, revocable pulls from the wallet.", actor: "User and Float" },
];

export default function App() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [role, setRole] = useState<Role>("user");
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
    setPayload({ role, business: String(data.get("business") ?? ""), community: data.get("community") === "on", socials: String(data.get("socials") ?? "") });
  }

  return <div className="app">
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="/" aria-label="Float home"><img src="/logo.svg" alt="Float" /></a>
        <nav className="topbar-nav" aria-label="Primary">
          <a href="#users">Users</a>
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
            <h1 id="hero-title">Credit for the on&#8209;chain economy.</h1>
            <p className="lede">Providers plug in once. Users use now and repay automatically, and providers get paid upfront.</p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="#access" onClick={toJoin}>Get early access</a>
              <a className="link-arrow" href="#how">How it works <span aria-hidden="true">→</span></a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="photo hero-photo"><img src="/images/entry-architecture.jpg" alt="" /></div>
            <div className="hero-overlay"><ReputationCard /></div>
            <div className="hero-chip"><LiveChip /></div>
          </div>
        </div>
      </section>

      <div className="container backers">
        <p className="label">Supported by Superteam India and Superteam Malaysia</p>
      </div>

      <section className="section" aria-labelledby="sides-title">
        <div className="container">
          <header className="section-head"><div><h2 id="sides-title">Built for both sides of the bill.</h2></div></header>
          <div className="tiles">
            <article className="tile" id="users">
              <div className="photo tile-photo"><img src="/images/business-owner.jpg" alt="" /></div>
              <div className="tile-card"><ReputationMini /></div>
              <p className="tag">For users</p>
              <h3>Keep building on credit.</h3>
              <p className="muted">A limit based on your payment history. Use services now, repay automatically, and carry your record to the next provider.</p>
            </article>
            <article className="tile" id="providers">
              <div className="photo tile-photo"><img src="/images/provider-infra.jpg" alt="" /></div>
              <div className="tile-card"><ProviderCard /></div>
              <p className="tag">For providers</p>
              <h3>Get paid upfront.</h3>
              <p className="muted">Offer credit to your best customers through one integration. Float sets the limits and runs repayment, and you get paid upfront.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="how" aria-labelledby="how-title">
        <div className="container">
          <header className="section-head"><div><h2 id="how-title">How it works</h2></div>
            <a className="link-arrow" href={DOCS_URL} target="_blank" rel="noreferrer">Docs reference <span aria-hidden="true">↗</span></a>
          </header>
          <ol className="steps">
            {STEPS.map((s, i) => <li key={s.title} className="step">
              <div className="step-head">
                <span className="step-num mono" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="tag">{s.actor}</span>
              </div>
              <h3>{s.title}</h3><p>{s.text}</p>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="section" id="access" aria-labelledby="access-title">
        <div className="container access">
          <div><h2 id="access-title" className="section-title">Get early access.</h2><p className="section-sub">Join as a user to build on credit, or as a provider to offer it. We onboard both sides together.</p></div>
          <form className="card access-form" onSubmit={submit}><fieldset disabled={!!payload}>
            <fieldset className="field">
              <legend>I'm joining as</legend>
              <div className="roles">
                {ROLES.map((r) => <label key={r.value} className="role">
                  <input ref={r.value === "user" ? firstField : undefined} type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
                  <span className="role-title">{r.title}</span>
                  <span className="role-text">{r.text}</span>
                </label>)}
              </div>
            </fieldset>
            <div className="field"><label htmlFor="business">{role === "user" ? "What you're building" : "Your service"}</label><input id="business" name="business" required maxLength={160} autoComplete="organization" placeholder={role === "user" ? "An app, an agent, a project" : "An API, RPC, compute or other service"} pattern={".*\\S.*"} /></div>
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
    <div className="mini-bar"><span>User XYZ</span><span className="badge badge-dot">Connected</span></div>
    <div className="mini-score"><p className="num">82<span>/100</span></p><p className="label">Float score</p></div>
    <div className="meter" aria-hidden="true"><span style={{ width: "82%" }} /></div>
  </div>;
}
