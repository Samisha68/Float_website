import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { PrivyProvider, useLogin, usePrivy } from "@privy-io/react-auth";
const appId = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_PRIVY_APP_ID;

export default function Waitlist({ onClose }: { onClose: () => void }) {
  if (!appId) return <div className="auth-error" role="alert">Sign-in is being set up. Please check back shortly.<br /><button className="text-link" onClick={onClose}>Dismiss</button></div>;
  return <PrivyProvider appId={appId} config={{ loginMethods: ["email", "google"], appearance: { theme: "dark", accentColor: "#d8d2c9", logo: "/float-favicon.svg", landingHeader: "Your next chapter starts here", loginMessage: "Sign in to join the Float waitlist. You agree to be contacted by Float about early access." }, embeddedWallets: { ethereum: { createOnLogin: "off" }, solana: { createOnLogin: "off" } } }}>
    <Signup onClose={onClose} />
  </PrivyProvider>;
}

function Signup({ onClose }: { onClose: () => void }) {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const [status, setStatus] = useState<"form" | "sending" | "success">("form");
  const [error, setError] = useState("");
  const started = useRef(false);
  const joined = useRef(false);
  const busy = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const abort = useRef<AbortController | null>(null);
  const { login } = useLogin({ onError: (code) => {
    if (code === "exited_auth_flow") onClose();
    else setError("Sign-in didn’t finish. Please try again.");
  } });
  const email = user?.email?.address || user?.google?.email || "";

  // Signing in is the signup: the verified identity is the whole record.
  const join = useCallback(async (payload: Record<string, unknown>) => {
    if (busy.current) return;
    busy.current = true;
    setStatus("sending"); setError("");
    const request = new AbortController(); abort.current = request;
    const timeout = window.setTimeout(() => request.abort(), 15000);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Your session expired. Close this window and sign in again.");
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload), signal: request.signal });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) throw new Error(response.status === 401 ? "Your session expired. Close this window and sign in again." : "Please try again in a moment.");
      setStatus("success");
    } catch (cause) {
      setStatus("form");
      setError(cause instanceof Error && cause.name === "AbortError" ? "That took longer than expected. Please try again." : cause instanceof TypeError ? "Check your connection and try again." : cause instanceof Error ? cause.message : "Please try again.");
    } finally { clearTimeout(timeout); busy.current = false; }
  }, [getAccessToken]);

  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    if (!authenticated) login();
  }, [ready, authenticated, login]);
  useEffect(() => {
    if (!ready || !authenticated || joined.current) return;
    joined.current = true;
    dialog.current?.showModal();
  }, [ready, authenticated]);
  useEffect(() => {
    if (!ready || !authenticated) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [ready, authenticated]);
  useEffect(() => () => abort.current?.abort(), []);

  if (!authenticated) return <div className="auth-status" role="status">{error || (!ready ? "Opening secure sign-in…" : "Complete sign-in to continue.")}<br /><button className="text-link" onClick={onClose}>Cancel</button>{error && <button className="text-link" onClick={() => { setError(""); login(); }}>Try again</button>}</div>;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    void join({ business: String(data.get("business") ?? ""), community: data.get("community") === "on", socials: String(data.get("socials") ?? "") });
  }

  let body: ReactNode;
  if (status === "success") body = <div role="status">
    <div className="success-mark" aria-hidden="true">✓</div>
    <h2 id="signup-title">You’re on the list.</h2>
    <p className="dialog-sub">We’ll be in touch{email && <> at {email}</>} when it’s your turn to get started.</p>
    <button className="text-link" onClick={() => dialog.current?.close()}>Back to Float</button>
  </div>;
  else body = <>
    <h2 id="signup-title">Tell us a little.</h2>
    <p className="dialog-sub">{email}</p>
    <form onSubmit={submit} aria-busy={status === "sending"}><fieldset disabled={status === "sending"}>
      <label htmlFor="business">What’s your business?</label>
      <input id="business" name="business" required maxLength={160} autoComplete="organization" placeholder="What you do, or plan to do" pattern={".*\\S.*"} />
      <label className="check"><input type="checkbox" name="community" /><span>I’d like to be part of a community built on credit reputation.</span></label>
      <label htmlFor="socials">Socials <span className="optional">optional</span></label>
      <input id="socials" name="socials" maxLength={200} placeholder="@handle or a link" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="text-link cta-link form-submit" type="submit">{status === "sending" ? "Saving your place…" : "Save my place"}</button>
    </fieldset></form>
  </>;

  return <dialog ref={dialog} className="waitlist-dialog" aria-labelledby="signup-title" onClose={onClose}>
    <div className="dialog-content">
      <button className="close-button" onClick={() => dialog.current?.close()} aria-label="Close">×</button>
      {body}
    </div>
  </dialog>;
}
