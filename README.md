# Float business waitlist

Cinematic React/Vite landing page with Privy sign-in and a private, authenticated waitlist API. All source and deployment changes belong to `Samisha68/Float_website`.

## Local preview

Run `npm install`, copy `.env.example` to `.env.local`, set `VITE_PRIVY_APP_ID`, then run `npm run dev`. The page and real Privy login work under Vite. The `/api/waitlist` endpoint requires the Vercel runtime (`npx vercel dev`) and configured server variables. Vite alone does not save submissions.

## Private storage and deployment

1. Connect a private Neon Postgres database to this Vercel project; run `db/001_waitlist.sql` once in its SQL editor.
2. Configure `DATABASE_URL`, `PRIVY_APP_ID`, and `PRIVY_APP_SECRET` as server-only Vercel environment variables. Set the public `VITE_PRIVY_APP_ID` to the same Privy app ID. Never commit secrets or prefix server credentials with `VITE_`.
3. Enable email and Google login in Privy and allow the local, preview, and production origins. Configure Google OAuth callbacks for any custom OAuth client.
4. Run `npm test` and `npm run build`. Push the branch explicitly to the `github` remote. Production must deploy from this GitHub repository.
5. On the preview deployment, complete sign-in with a test account, submit business details, and verify one record in `waitlist_entries`. Retry to verify duplicates do not overwrite or duplicate the original entry. Remove only the known test record after verification.

## Data and security

The browser signs in with Privy before opening the business form. The endpoint verifies token signature, expiry, issuer, audience, and subject. It retrieves the contact email from Privy, never from untrusted form claims. It stores the Privy ID, verified email, name, business, timestamp, and early-access consent version. The table has no public read endpoint and the browser never receives database credentials. Repeated submissions are idempotent by Privy ID.

The API returns an error when configuration, identity lookup, or persistence fails; a login alone never counts as a saved waitlist entry. Logs use request IDs and event codes, without contact data or tokens. Watch `waitlist.save_failed` and `waitlist.auth_unavailable` in Vercel logs. If signup fails, check the configured variables and database migration before retrying. Roll back the frontend/API together to the previous Vercel deployment; retain the additive waitlist table and captured entries.

Privy is lazy-loaded after the waitlist link is clicked so the landing page does not wait for the authentication SDK. Background motion respects the visitor’s reduced-motion preference and uses a still-frame fallback. Phone layouts stack the two headline halves while preserving the video and a single bottom signup link.
