-- The waitlist no longer collects a name or business: signing in is the signup.
-- Relax the two columns rather than dropping them, so any details already
-- captured under the previous form survive. Drop them only once you have
-- confirmed you no longer need that data.
ALTER TABLE waitlist_entries ALTER COLUMN name DROP NOT NULL;
ALTER TABLE waitlist_entries ALTER COLUMN business DROP NOT NULL;
ALTER TABLE waitlist_entries DROP CONSTRAINT IF EXISTS waitlist_entries_name_check;
ALTER TABLE waitlist_entries DROP CONSTRAINT IF EXISTS waitlist_entries_business_check;
