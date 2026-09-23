-- Preserve historical rows (including duplicates) while serializing new
-- confirmations for each normalized address. Server admin access only.
CREATE OR REPLACE FUNCTION public.record_confirmed_subscription(p_email text, p_saint_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  normalized_email text := lower(trim(p_email));
BEGIN
  IF normalized_email IS NULL OR length(normalized_email) = 0 THEN
    RAISE EXCEPTION 'Email required';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('email-signup:' || normalized_email, 0));
  IF EXISTS (SELECT 1 FROM public.email_signups WHERE lower(trim(email)) = normalized_email) THEN
    RETURN false;
  END IF;
  INSERT INTO public.email_signups (email, saint_id) VALUES (normalized_email, p_saint_id);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.record_confirmed_subscription(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_confirmed_subscription(text, uuid) TO project_admin;
