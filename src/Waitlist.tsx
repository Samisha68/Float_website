import { useEffect, useRef, useState, type FormEvent } from "react";
import { PrivyProvider, useLogin, usePrivy } from "@privy-io/react-auth";
const appId = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_PRIVY_APP_ID;

export default function Waitlist({ onClose }: { onClose: () => void }) {
  if (!appId) return <div className="auth-error" role="alert">Sign-in is being set up. Please check back shortly.<br /><button className="text-link" onClick={onClose}>Dismiss</button></div>;
  return <PrivyProvider appId={appId} config={{ loginMethods: ["email", "google"], appearance: { theme: "dark", accentColor: "#d8d2c9", logo: "/float-favicon.svg", landingHeader: "Your next chapter starts here", loginMessage: "Sign in to join the Float waitlist." }, embeddedWallets: { ethereum: { createOnLogin: "off" }, solana: { createOnLogin: "off" } } }}>
    <Signup onClose={onClose} />
  </PrivyProvider>;
}

function Signup({ onClose }: { onClose: () => void }) {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const started = useRef(false);
  const busy = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const abort = useRef<AbortController | null>(null);
  const { login } = useLogin({ onError: (code) => {
    if (code === "exited_auth_flow") onClose();
    else setError("Sign-in didn’t finish. Please try again.");
  } });
  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    if (!authenticated) login();
  }, [ready, authenticated, login]);
  useEffect(() => {
    if (!ready || !authenticated) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [ready, authenticated]);
  useEffect(() => () => abort.current?.abort(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !authenticated) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    busy.current = true;
    setStatus("sending"); setError("");
    const data = Object.fromEntries(new FormData(form));
    const request = new AbortController(); abort.current = request;
    const timeout = window.setTimeout(() => request.abort(), 15000);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Your session expired. Close this window and sign in again.");
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(data), signal: request.signal });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw new Error(response.status === 401 ? "Your session expired. Close this window and sign in again." : "We couldn’t save your place. Please try again in a moment.");
      setStatus("success");
    } catch (cause) {
      setStatus("idle");
      setError(cause instanceof Error && cause.name === "AbortError" ? "That took longer than expected. Please try again." : cause instanceof TypeError ? "Check your connection and try again." : cause instanceof Error ? cause.message : "Please try again.");
    } finally { clearTimeout(timeout); busy.current = false; }
  }
  if (!authenticated) return <div className="auth-status" role="status">{error || (!ready ? "Opening secure sign-in…" : "Complete sign-in to continue.")}<br /><button className="text-link" onClick={onClose}>Cancel</button>{error && <button className="text-link" onClick={() => { setError(""); login(); }}>Try again</button>}</div>;
  return <dialog ref={dialog} className="waitlist-dialog" aria-labelledby="signup-title" onClose={onClose}>
    <div className="dialog-content">
      <button className="close-button" onClick={() => dialog.current?.close()} aria-label="Close">×</button>
      {status === "success" ? <div role="status"><div className="success-mark" aria-hidden="true">✓</div><h2 id="signup-title">You’re on the list.</h2><p className="dialog-sub">We’ll be in touch when it’s your turn to get started.</p><button className="text-link" onClick={() => dialog.current?.close()}>Back to Float</button></div> : <>
        <p className="eyebrow">Signed in · One last step</p><h2 id="signup-title">Your business.<br />Its next chapter.</h2>
        <p className="dialog-sub">{user?.email?.address || user?.google?.email || "You’re securely signed in."}</p>
        <form onSubmit={submit} aria-busy={status === "sending"}><fieldset disabled={status === "sending"}>
          <label htmlFor="name">Your name</label><input id="name" name="name" required maxLength={100} autoComplete="name" placeholder="Alex Tan" pattern={".*\\S.*"} />
          <label htmlFor="business">Business name</label><input id="business" name="business" required maxLength={160} autoComplete="organization" placeholder="Your business" pattern={".*\\S.*"} />
          <p className="consent">By joining, you agree to be contacted by Float about early access.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="text-link form-submit" type="submit">{status === "sending" ? "Saving your place…" : "Save my place"}</button>
        </fieldset></form>
      </>}
    </div>
  </dialog>;
}
