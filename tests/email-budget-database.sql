-- Run after the migration inside a transaction that is ALWAYS rolled back.
DO $$
DECLARE role_name text; table_name text; operation text; accepted boolean; i integer;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    FOREACH table_name IN ARRAY ARRAY['email_signups', 'quiz_results', 'email_send_reservations'] LOOP
      FOREACH operation IN ARRAY ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'] LOOP
        IF has_table_privilege(role_name, 'public.' || table_name, operation) THEN
          RAISE EXCEPTION 'Unexpected % % access to %', role_name, operation, table_name;
        END IF;
      END LOOP;
    END LOOP;
    IF has_function_privilege(role_name, 'public.reserve_email_send(text,text)', 'EXECUTE')
       OR has_function_privilege(role_name, 'public.record_confirmed_subscription(text,uuid)', 'EXECUTE') THEN
      RAISE EXCEPTION 'Unexpected server RPC access';
    END IF;
  END LOOP;
  IF NOT public.record_confirmed_subscription('security-regression-20261026@example.invalid', NULL) THEN
    RAISE EXCEPTION 'Server confirmation failed';
  END IF;
  IF public.record_confirmed_subscription('security-regression-20261026@example.invalid', NULL) THEN
    RAISE EXCEPTION 'Confirmation did not deduplicate';
  END IF;
  DELETE FROM public.email_send_reservations;
  IF public.reserve_email_send('invalid', 'confirmation') THEN RAISE EXCEPTION 'Invalid hash accepted'; END IF;
  IF NOT public.reserve_email_send(repeat('a', 64), 'confirmation') THEN RAISE EXCEPTION 'First send denied'; END IF;
  IF public.reserve_email_send(repeat('a', 64), 'confirmation') THEN RAISE EXCEPTION 'Cooldown bypass'; END IF;
  IF NOT public.reserve_email_send(repeat('a', 64), 'result') THEN RAISE EXCEPTION 'Result blocked by confirmation'; END IF;
  UPDATE public.email_send_reservations SET reserved_at = clock_timestamp() - interval '2 minutes';
  IF NOT public.reserve_email_send(repeat('a', 64), 'confirmation') THEN RAISE EXCEPTION 'Second send denied'; END IF;
  UPDATE public.email_send_reservations SET reserved_at = clock_timestamp() - interval '2 minutes';
  IF NOT public.reserve_email_send(repeat('a', 64), 'confirmation') THEN RAISE EXCEPTION 'Third send denied'; END IF;
  UPDATE public.email_send_reservations SET reserved_at = clock_timestamp() - interval '2 minutes';
  IF public.reserve_email_send(repeat('a', 64), 'confirmation') THEN RAISE EXCEPTION 'Hourly limit bypass'; END IF;
  DELETE FROM public.email_send_reservations;
  FOR i IN 1..30 LOOP
    IF NOT public.reserve_email_send(lpad(to_hex(i), 64, '0'), 'confirmation') THEN RAISE EXCEPTION 'Minute capacity too small'; END IF;
  END LOOP;
  IF public.reserve_email_send(repeat('b', 64), 'confirmation') THEN RAISE EXCEPTION 'Minute ceiling bypass'; END IF;
  UPDATE public.email_send_reservations SET reserved_at = clock_timestamp() - interval '2 minutes';
  INSERT INTO public.email_send_reservations(recipient_hash,purpose,reserved_at)
    SELECT repeat('c',64), 'result', clock_timestamp() - interval '2 hours' FROM generate_series(1,60);
  IF public.reserve_email_send(repeat('d',64), 'confirmation') THEN RAISE EXCEPTION 'Daily ceiling bypass'; END IF;
  UPDATE public.email_send_reservations SET reserved_at = clock_timestamp() - interval '25 hours';
  IF NOT public.reserve_email_send(repeat('d',64), 'confirmation') THEN RAISE EXCEPTION 'Expired limit did not reset'; END IF;
  IF (SELECT count(*) FROM public.email_send_reservations) <> 1 THEN RAISE EXCEPTION 'Retention cleanup failed'; END IF;
END;
$$;
SELECT 'permissions, server confirmation, deduplication, cooldown, hourly/minute/day limits, retention passed' AS checks;
