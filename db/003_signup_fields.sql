-- What the waitlist asks for now: the business, whether they want to be part of a
-- credit-reputation community, and optionally their socials.
ALTER TABLE waitlist_entries ADD COLUMN IF NOT EXISTS community_interest boolean;
ALTER TABLE waitlist_entries ADD COLUMN IF NOT EXISTS socials text
  CHECK (socials IS NULL OR length(socials) <= 200);

-- Supabase exposes the public schema through PostgREST with a browser-safe anon key,
-- so the table must be closed off explicitly. With RLS on and no policies, only the
-- owning role this API connects as can reach these rows.
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON waitlist_entries FROM anon, authenticated;
