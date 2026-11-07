-- Defense in depth for the two tables that predate the RLS convention. Both
-- already have every privilege revoked from anon and authenticated, so this
-- changes nothing today; it ensures a future GRANT cannot expose stored email
-- addresses or raw quiz rows.
--
-- No policies are added on purpose: the intent is deny-all for every non-owner
-- role, while project_admin (the table owner) keeps its server-side access.
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
