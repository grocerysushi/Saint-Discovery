-- Transactional delivery only: seven days for confirmation/retry support.
-- No subscriber geography or matched saint needs to remain in this table;
-- the private signed delivery link already carries the saint identifier.
CREATE OR REPLACE FUNCTION public.record_confirmed_subscription(p_email text, p_saint_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE normalized_email text := lower(trim(p_email));
BEGIN
  IF normalized_email IS NULL OR length(normalized_email) = 0 THEN
    RAISE EXCEPTION 'Email required';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('email-signup:' || normalized_email, 0));
  DELETE FROM public.email_signups WHERE lower(trim(email)) = normalized_email
    AND created_at <= now() - interval '7 days';
  IF EXISTS (SELECT 1 FROM public.email_signups WHERE lower(trim(email)) = normalized_email) THEN
    RETURN false;
  END IF;
  INSERT INTO public.email_signups(email, created_at) VALUES (normalized_email, now());
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.record_confirmed_subscription(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_confirmed_subscription(text, uuid) TO project_admin;

ALTER TABLE public.email_signups DROP COLUMN country, DROP COLUMN city, DROP COLUMN region, DROP COLUMN saint_id;
CREATE INDEX IF NOT EXISTS email_signups_retention_idx ON public.email_signups(created_at);

-- No parameters: callers cannot select a table or widen the expiry boundary.
CREATE FUNCTION public.prune_expired_email_data()
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
SET lock_timeout = '2s'
AS $$
DECLARE addresses_removed bigint; reservations_removed bigint;
BEGIN
  DELETE FROM public.email_signups WHERE created_at <= now() - interval '7 days';
  GET DIAGNOSTICS addresses_removed = ROW_COUNT;
  DELETE FROM public.email_send_reservations WHERE reserved_at <= now() - interval '24 hours';
  GET DIAGNOSTICS reservations_removed = ROW_COUNT;
  RETURN jsonb_build_object('expired_delivery_records_removed', addresses_removed,
    'expired_send_reservations_removed', reservations_removed);
END;
$$;
REVOKE ALL ON FUNCTION public.prune_expired_email_data() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prune_expired_email_data() TO project_admin;
SELECT public.prune_expired_email_data();
