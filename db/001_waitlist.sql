-- Run once in the private Neon database before deploying the API.
CREATE TABLE IF NOT EXISTS waitlist_entries (
  privy_id text PRIMARY KEY CHECK (privy_id LIKE 'did:privy:%'),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 100),
  business text NOT NULL CHECK (length(trim(business)) BETWEEN 1 AND 160),
  consent_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- No public browser database client or public data API is enabled.
-- Only the server-side DATABASE_URL can reach these records.
REVOKE ALL ON waitlist_entries FROM PUBLIC;
