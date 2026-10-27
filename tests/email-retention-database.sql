-- Append to the migration in a rollback-only rehearsal. Never commit fixtures.
DO $$
DECLARE initial_time timestamptz; result jsonb;
BEGIN
  IF has_function_privilege('anon','public.prune_expired_email_data()','EXECUTE')
     OR has_function_privilege('authenticated','public.prune_expired_email_data()','EXECUTE') THEN
    RAISE EXCEPTION 'Retention RPC exposed to browsers';
  END IF;
  INSERT INTO public.email_signups(email,created_at) VALUES
    ('retention-expired@example.invalid', now()-interval '8 days'),
    ('retention-retry@example.invalid', now()-interval '6 days');
  INSERT INTO public.email_send_reservations(recipient_hash,purpose,reserved_at) VALUES
    (repeat('e',64),'confirmation',now()-interval '25 hours'),
    (repeat('f',64),'result',now()-interval '23 hours');
  SELECT created_at INTO initial_time FROM public.email_signups WHERE email='retention-retry@example.invalid';
  IF public.record_confirmed_subscription('retention-retry@example.invalid',NULL) THEN RAISE EXCEPTION 'Retry counted as new'; END IF;
  IF initial_time IS DISTINCT FROM (SELECT created_at FROM public.email_signups WHERE email='retention-retry@example.invalid') THEN RAISE EXCEPTION 'Retry extended retention'; END IF;
  result := public.prune_expired_email_data();
  IF EXISTS(SELECT FROM public.email_signups WHERE email='retention-expired@example.invalid') THEN RAISE EXCEPTION 'Expired email remains'; END IF;
  IF NOT EXISTS(SELECT FROM public.email_signups WHERE email='retention-retry@example.invalid') THEN RAISE EXCEPTION 'Valid retry removed'; END IF;
  IF EXISTS(SELECT FROM public.email_send_reservations WHERE recipient_hash=repeat('e',64)) THEN RAISE EXCEPTION 'Expired hash remains'; END IF;
  IF NOT EXISTS(SELECT FROM public.email_send_reservations WHERE recipient_hash=repeat('f',64)) THEN RAISE EXCEPTION 'Active budget removed'; END IF;
  IF NOT public.record_confirmed_subscription('retention-new@example.invalid',NULL) THEN RAISE EXCEPTION 'New confirmation failed'; END IF;
  IF EXISTS(SELECT FROM information_schema.columns WHERE table_schema='public' AND table_name='email_signups' AND column_name IN ('saint_id','country','city','region')) THEN RAISE EXCEPTION 'Unnecessary fields retained'; END IF;
  RAISE EXCEPTION 'retention rehearsal passed; all schema and row changes rolled back';
END;
$$;
