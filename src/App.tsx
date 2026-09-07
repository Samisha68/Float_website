import { lazy, Suspense, useEffect, useRef, useState } from "react";
const Waitlist = lazy(() => import("./Waitlist"));
const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4";

export default function App() {
  const video = useRef<HTMLVideoElement>(null);
  const [joining, setJoining] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (preference.matches) video.current?.pause();
      else void video.current?.play().catch(() => { /* The poster remains visible if autoplay is unavailable. */ });
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  return <div className="stage">
    <div className="plate" aria-hidden="true">
      <video ref={video} className="plate-video" muted loop playsInline preload="metadata" poster="/portal-poster.jpg"><source src={VIDEO_URL} type="video/mp4" /></video>
    </div>
    <header className="topbar">
        <a className="brand" href="/" aria-label="Float home">
          <svg viewBox="120 104 169 135" fill="none" aria-hidden="true"><path d="M261.503 110.405C272.627 110.405 281.646 119.423 281.646 130.547V156.183H193.752V178.156H281.646V210.543C281.645 219.55 275.694 227.624 266.897 229.557C247.048 233.919 236.024 232.311 211.147 225.765C193.723 220.282 168.29 221.086 149.759 222.771C137.3 223.904 126 214.31 126 201.799V130.547C126 119.423 135.018 110.405 146.143 110.405H261.503Z" fill="currentColor"/><path d="M195.583 158.014H204.738C209.795 158.014 213.894 162.113 213.894 167.17C213.894 172.226 209.795 176.325 204.738 176.325H195.583V158.014Z" fill="currentColor"/></svg>
        </a>
    </header>
    <main className="hero">
      <h1 className="headline">
        <span className="headline-half headline-left"><span className="headline-line">The future</span><span className="headline-line">of credit</span></span>{" "}
        <span className="headline-half headline-right"><span className="headline-line">starts with</span><em className="headline-line">reputation.</em></span>
      </h1>
    </main>
    <div className="waitlist-anchor">
      <button className="cta" onClick={() => setJoining(true)} disabled={joining}>Join the waitlist</button>
      {joining && <Suspense fallback={<p className="auth-status" role="status">Opening secure sign-in…</p>}><Waitlist onClose={() => setJoining(false)} /></Suspense>}
    </div>
    <footer className="footer">© {new Date().getFullYear()} Float</footer>
  </div>;
}
