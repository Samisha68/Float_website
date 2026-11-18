-- The waitlist now asks whether someone is joining as a user or as a provider.
-- Nullable so rows saved before this question existed stay valid.
ALTER TABLE waitlist_entries ADD COLUMN IF NOT EXISTS role text
  CHECK (role IS NULL OR role IN ('user', 'provider'));
