import { createRemoteJWKSet, jwtVerify } from "jose";
import postgres from "postgres";
import { createWaitlistHandler } from "../server/waitlist.mjs";

const appId = process.env.PRIVY_APP_ID;
let client;
const db = () => (client ??= postgres(process.env.DATABASE_URL, { prepare: false, max: 1, idle_timeout: 20, connect_timeout: 10 }));
const keys = appId ? createRemoteJWKSet(new URL(`https://auth.privy.io/api/v1/apps/${encodeURIComponent(appId)}/jwks.json`), { timeoutDuration: 5000 }) : null;
export default createWaitlistHandler({
  configured: () => Boolean(appId && process.env.PRIVY_APP_SECRET && process.env.DATABASE_URL),
  verify: async token => (await jwtVerify(token, keys, { issuer: "privy.io", audience: appId, algorithms: ["ES256"], requiredClaims: ["exp", "iat", "sub"] })).payload,
  getEmail: async id => {
    const response = await fetch(`https://api.privy.io/v1/users/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${appId}:${process.env.PRIVY_APP_SECRET}`).toString("base64")}`, "privy-app-id": appId },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw Object.assign(new Error("Privy lookup failed"), { code: `PRIVY_${response.status}` });
    const profile = await response.json();
    if (profile.id !== id || !Array.isArray(profile.linked_accounts)) throw new Error("Invalid profile response");
    return profile.linked_accounts.find(account => account.type === "email")?.address
      ?? profile.linked_accounts.find(account => account.type === "google_oauth")?.email;
  },
  save: async ({ privyId, email, business, community, socials }) => {
    await db()`INSERT INTO waitlist_entries (privy_id, email, business, community_interest, socials, consent_version)
      VALUES (${privyId}, ${email}, ${business}, ${community}, ${socials}, 'early-access-v1')
      ON CONFLICT (privy_id) DO NOTHING`;
  },
});
