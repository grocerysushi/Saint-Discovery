-- The site records subscriptions only after its signed confirmation POST.
-- Raw quiz rows have no application reader; GA4 already records quiz_complete.
-- Preserve all historical data, and retain project_admin server access.
REVOKE ALL ON public.email_signups, public.quiz_results FROM PUBLIC, anon, authenticated;

CREATE TABLE public.email_send_reservations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipient_hash text NOT NULL CHECK (recipient_hash ~ '^[a-f0-9]{64}$'),
  purpose text NOT NULL CHECK (purpose IN ('confirmation', 'result')),
  reserved_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.email_send_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_send_reservations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.email_send_reservations_id_seq FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.reserve_email_send(p_recipient text, p_purpose text)
RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
SET lock_timeout = '2s'
AS $$
DECLARE
  checked_at timestamptz;
  total_count bigint;
  minute_count bigint;
  recipient_count bigint;
  latest_send timestamptz;
BEGIN
  IF p_recipient IS NULL OR p_recipient !~ '^[a-f0-9]{64}$'
     OR p_purpose IS NULL OR p_purpose NOT IN ('confirmation', 'result') THEN
    RETURN false;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('saint-discovery-email-send-budget', 0));
  checked_at := clock_timestamp();
  DELETE FROM public.email_send_reservations WHERE reserved_at <= checked_at - interval '24 hours';
  SELECT count(*), count(*) FILTER (WHERE reserved_at > checked_at - interval '1 minute'),
    count(*) FILTER (WHERE recipient_hash = p_recipient AND purpose = p_purpose AND reserved_at > checked_at - interval '1 hour'),
    max(reserved_at) FILTER (WHERE recipient_hash = p_recipient AND purpose = p_purpose)
  INTO total_count, minute_count, recipient_count, latest_send
  FROM public.email_send_reservations;
  -- Conservative application ceiling, separate from the provider's plan limits.
  IF total_count >= 90 OR minute_count >= 30 OR recipient_count >= 3
     OR latest_send > checked_at - interval '1 minute' THEN
    RETURN false;
  END IF;
  INSERT INTO public.email_send_reservations(recipient_hash, purpose, reserved_at)
    VALUES (p_recipient, p_purpose, checked_at);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_email_send(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_email_send(text, text) TO project_admin;
