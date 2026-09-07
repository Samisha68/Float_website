import { useCallback, useEffect, useRef, useState } from "react";
import { PrivyProvider, useLogin, usePrivy } from "@privy-io/react-auth";
import type { Payload } from "./App";
const appId = import.meta.env.VITE_PRIVY_APP_ID;

export default function Waitlist({ payload, onClose }: { payload: Payload; onClose: () => void }) {
  if (!appId) return <div className="auth-error" role="alert">Sign-in is being set up. Please check back shortly.<br /><button className="text-link" onClick={onClose}>Dismiss</button></div>;
  return <PrivyProvider appId={appId} config={{ loginMethods: ["email", "google"], appearance: { theme: "dark", accentColor: "#d8d2c9", logo: "/float-favicon.svg", landingHeader: "Your next chapter starts here", loginMessage: "Sign in to save your place on the Float waitlist. You agree to be contacted by Float about early access." }, embeddedWallets: { ethereum: { createOnLogin: "off" }, solana: { createOnLogin: "off" } } }}>
    <Saver payload={payload} onClose={onClose} />
  </PrivyProvider>;
}

// The answers are already collected; this only proves who is submitting them and saves.
function Saver({ payload, onClose }: { payload: Payload; onClose: () => void }) {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const [status, setStatus] = useState<"signing" | "saving" | "success" | "error">("signing");
  const [error, setError] = useState("");
  const started = useRef(false);
  const saved = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const abort = useRef<AbortController | null>(null);
  const { login } = useLogin({ onError: (code) => {
    if (code === "exited_auth_flow") onClose();
    else { setStatus("error"); setError("Sign-in didn’t finish. Please try again."); }
  } });
  const email = user?.email?.address || user?.google?.email || "";

  const save = useCallback(async () => {
    setStatus("saving"); setError("");
    const request = new AbortController(); abort.current = request;
    const timeout = window.setTimeout(() => request.abort(), 15000);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Your session expired. Close this and try again.");
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload), signal: request.signal });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        const detail = import.meta.env.DEV && result?.code ? ` (${result.code})` : "";
        throw new Error(response.status === 401 ? "Your session expired. Close this and try again." : `Please try again in a moment.${detail}`);
      }
      setStatus("success");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error && cause.name === "AbortError" ? "That took longer than expected. Please try again." : cause instanceof TypeError ? "Check your connection and try again." : cause instanceof Error ? cause.message : "Please try again.");
    } finally { clearTimeout(timeout); }
  }, [getAccessToken, payload]);

  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    if (!authenticated) login();
  }, [ready, authenticated, login]);
  useEffect(() => {
    if (!ready || !authenticated || saved.current) return;
    saved.current = true;
    dialog.current?.showModal();
    void save();
  }, [ready, authenticated, save]);
  useEffect(() => {
    if (status !== "error" || authenticated) return;
    dialog.current?.showModal();
  }, [status, authenticated]);
  useEffect(() => () => abort.current?.abort(), []);

  if (!authenticated && status !== "error") return <div className="auth-status" role="status">{!ready ? "Opening secure sign-in…" : "Complete sign-in to save your place."}<br /><button className="text-link" onClick={onClose}>Cancel</button></div>;

  return <dialog ref={dialog} className="waitlist-dialog" aria-labelledby="saver-title" onClose={onClose}>
    <div className="dialog-content">
      <button className="close-button" onClick={() => dialog.current?.close()} aria-label="Close">×</button>
      {status === "success" ? <div role="status">
        <div className="success-mark" aria-hidden="true">✓</div>
        <h2 id="saver-title">You’re on the list.</h2>
        <p className="dialog-sub">We’ll be in touch{email && <> at {email}</>} when it’s your turn to get started.</p>
        <button className="text-link cta-link" onClick={() => dialog.current?.close()}>Back to Float</button>
      </div> : status === "error" ? <div role="alert">
        <h2 id="saver-title">We couldn’t save your place.</h2>
        <p className="dialog-sub">{error}</p>
        <button className="text-link cta-link" onClick={() => { if (!authenticated) { setStatus("signing"); login(); } else void save(); }}>Try again</button>
      </div> : <div role="status">
        <h2 id="saver-title">Saving your place…</h2>
        <p className="dialog-sub">{email}</p>
      </div>}
    </div>
  </dialog>;
}
