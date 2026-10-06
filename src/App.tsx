import { lazy, Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
const Waitlist = lazy(() => import("./Waitlist"));
const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4";

export type Payload = { business: string; community: boolean; socials: string };

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const step = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a || 1e-6), 0, 1); return t * t * (3 - 2 * t); };

export default function App() {
  const track = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const dark = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const join = useRef<HTMLDivElement>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(preference.matches);
      if (preference.matches) video.current?.pause();
      else void video.current?.play().catch(() => { /* The poster stays visible if autoplay is unavailable. */ });
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  // Scrolling walks you through the gate: the plate scales about the doorway until its
  // light floods the screen, then settles to black and hands over to the form.
  useEffect(() => {
    if (reduced) {
      for (const el of [video, hero, anchor, light, dark, join]) el.current?.removeAttribute("style");
      plate.current?.style.removeProperty("--plate-scrim");
      return;
    }
    let raf = 0, current = 0, target = 0, running = false;
    const apply = (p: number) => {
      const opened = step(0, 1, p);
      if (video.current) video.current.style.transform = `scale(${1 + 5.2 * opened})`;
      if (plate.current) plate.current.style.setProperty("--plate-scrim", `${1 - step(0, .5, p)}`);
      const leaving = step(0, .34, p);
      if (hero.current) { hero.current.style.opacity = `${1 - leaving}`; hero.current.style.transform = `translate3d(0, ${-34 * leaving}px, 0)`; }
      // visibility, not just opacity: an invisible control must leave the tab order too.
      if (anchor.current) { anchor.current.style.opacity = `${1 - leaving}`; anchor.current.style.visibility = leaving > .98 ? "hidden" : "visible"; }
      if (light.current) light.current.style.opacity = `${step(.44, .8, p)}`;
      if (dark.current) dark.current.style.opacity = `${step(.76, .94, p)}`;
      const arriving = step(.86, 1, p);
      if (join.current) { join.current.style.opacity = `${arriving}`; join.current.style.transform = `translate3d(0, ${22 * (1 - arriving)}px, 0)`; join.current.style.pointerEvents = arriving > .9 ? "auto" : "none"; join.current.style.visibility = arriving < .02 ? "hidden" : "visible"; }
    };
    const read = () => {
      const el = track.current;
      if (!el) return 0;
      const span = el.offsetHeight - window.innerHeight;
      return span <= 0 ? 0 : clamp(-el.getBoundingClientRect().top / span, 0, 1);
    };
    const tick = () => {
      current += (target - current) * .16;
      if (Math.abs(target - current) < 4e-4) { current = target; running = false; }
      apply(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      target = read();
      // rAF is paused while the tab is hidden, so snap rather than leave the frame stale.
      if (document.hidden) { current = target; apply(current); return; }
      if (!running) { running = true; if (!raf) raf = requestAnimationFrame(tick); }
    };
    const onResize = () => { target = current = read(); apply(current); };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onResize);
    return () => { if (raf) cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); document.removeEventListener("visibilitychange", onResize); };
  }, [reduced]);

  const openGate = useCallback(() => {
    const el = track.current;
    if (!el) return;
    window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight, behavior: "smooth" });
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setPayload({ business: String(data.get("business") ?? ""), community: data.get("community") === "on", socials: String(data.get("socials") ?? "") });
  }

  return <><div className="gate" ref={track} data-reduced={reduced || undefined}>
    <Navbar />
    <div className="stage">
      <div className="plate" ref={plate} aria-hidden="true">
        <video ref={video} className="plate-video" muted loop playsInline preload="metadata" poster="/portal-poster.jpg"><source src={VIDEO_URL} type="video/mp4" /></video>
      </div>
      <div className="veil veil-light" ref={light} aria-hidden="true" />
      <div className="veil veil-dark" ref={dark} aria-hidden="true" />
      {/* Keeps the grid's first row, which clears the fixed navbar. */}
      <div className="topbar" aria-hidden="true" />
      <main className="hero" ref={hero}>
        <p className="hero-eyebrow">Early access for Businesses</p>
        <h1 className="headline">
          <span className="headline-half headline-left"><span className="headline-line">The Credit</span><span className="headline-line">Layer for</span></span>{" "}
          <span className="headline-half headline-right">
            <span className="headline-line">Every App</span>
            <em
              className="headline-line"
              style={{
                fontStyle: "italic",
                fontSynthesis: "style"
              }}
            >
              on Solana
            </em>
          </span>       
        </h1>
      </main>
      <div className="waitlist-anchor" ref={anchor}>
        <button className="text-link cta-link" onClick={openGate}>Join the waitlist</button>
      </div>
      <footer className="footer">© {new Date().getFullYear()} Float</footer>

      <section className="bg-black join" ref={join} aria-labelledby="join-title">
        <div className="join-card">
          <h2 id="join-title">Tell us a little.</h2>
          <p className="join-sub">Three questions, then you’re on the list.</p>
          <form onSubmit={submit}><fieldset disabled={!!payload}>
            <label htmlFor="business">What’s your business?</label>
            <input id="business" name="business" required maxLength={160} autoComplete="organization" placeholder="What you do, or plan to do" pattern={".*\\S.*"} />
            <label className="check"><input type="checkbox" name="community" /><span>I’d like to be part of a community built on credit reputation.</span></label>
            <label htmlFor="socials">Socials <span className="optional">optional</span></label>
            <input id="socials" name="socials" maxLength={200} placeholder="@handle or a link" />
            <button className="text-link cta-link form-submit" type="submit">Save my place</button>
          </fieldset></form>
        </div>
      </section>
    </div>

    {payload && <Suspense fallback={<p className="auth-status" role="status">Opening secure sign-in…</p>}>
      <Waitlist payload={payload} onClose={() => setPayload(null)} />
    </Suspense>}
  </div>
  <Footer /></>;
}
