-- Ensure one push subscription per device
DO $$
BEGIN
  ALTER TABLE public.push_subscriptions
  ADD CONSTRAINT push_subscriptions_user_id_endpoint_key UNIQUE (user_id, endpoint);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
