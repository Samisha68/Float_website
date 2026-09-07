# Float — website

**On-chain short-term working capital for businesses whose money is delayed.**

Businesses rarely fail for lack of revenue. They fail because the revenue arrives late — a
customer invoice that settles in thirty days, a cross-border investor payment in flight, a
temporary banking block — while payroll, vendors and rent come due on schedule regardless.
That gap between money earned and money available is what Float lends against.

A verified business applies with evidence of its incoming funds. Float underwrites that
evidence and, on approval, disburses **USDC**. The loan, its repayment schedule and its
status are recorded on **Solana**, and each repayment builds a portable credit history that
qualifies the business for larger limits and better rates over time.

## What this repository is

**This repo is only the public website.** The lending product, underwriting and on-chain
programs live elsewhere and are not part of this codebase.

What's here today is the pre-launch page and the waitlist businesses use to register
interest:

- a single landing page (React + TypeScript + Vite, deployed on Vercel)
- a waitlist form behind Privy sign-in, backed by a private Neon Postgres table

## Local preview

```bash
npm install
cp .env.example .env.local   # then set VITE_PRIVY_APP_ID
npm run dev
```

The page and real Privy login work under Vite. The `/api/waitlist` endpoint needs the Vercel
runtime (`npx vercel dev`) plus the server variables below — **under plain `npm run dev`,
submissions are not saved.**

```bash
npm test        # waitlist handler tests
npm run build   # production build
```

## Deployment

1. Attach a private Neon Postgres database to the Vercel project and run
   `db/001_waitlist.sql` once in its SQL editor.
2. Set `DATABASE_URL`, `PRIVY_APP_ID` and `PRIVY_APP_SECRET` as **server-only** Vercel
   environment variables, and `VITE_PRIVY_APP_ID` to the same Privy app ID. Never commit
   secrets, and never prefix a server credential with `VITE_`.
3. Enable email and Google login in Privy, and allow the local, preview and production
   origins.
4. On the preview deployment, sign in with a test account, submit the form, and confirm one
   row in `waitlist_entries`. Submit again to confirm the retry neither duplicates nor
   overwrites it. Delete only that known test row afterwards.

Rolling back means rolling the frontend and API back together to the previous Vercel
deployment. The `waitlist_entries` table is additive — leave it and its captured entries in
place.

## How the waitlist handles data

The browser signs in with Privy before the form opens. The endpoint verifies the token's
signature, issuer, audience, expiry and `did:privy:` subject, then reads the contact email
**from Privy's API rather than from the submitted form**, so a forged email or ID in the
request body is ignored. It stores the Privy ID, verified email, name, business, timestamp
and consent version.

The table has no public read endpoint and the browser never receives database credentials.
Repeat submissions are idempotent by Privy ID. Any failure in configuration, identity lookup
or persistence returns an error — a completed login alone never counts as a saved entry.

Logs carry a request ID and an event code only, never contact data or tokens. Watch
`waitlist.save_failed` and `waitlist.auth_unavailable` in Vercel logs; if signup breaks,
check the environment variables and that the migration has run.
