BEGIN;

CREATE TABLE IF NOT EXISTS public.premium_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(60) NOT NULL,
  payload_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_premium_events_user_created
  ON public.premium_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_premium_events_event_type
  ON public.premium_events(event_type);

ALTER TABLE public.premium_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS premium_events_select_own ON public.premium_events;
CREATE POLICY premium_events_select_own
ON public.premium_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS premium_events_insert_own ON public.premium_events;
CREATE POLICY premium_events_insert_own
ON public.premium_events
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (actor_user_id IS NULL OR actor_user_id = auth.uid())
);

DROP POLICY IF EXISTS premium_events_admin_all ON public.premium_events;
CREATE POLICY premium_events_admin_all
ON public.premium_events
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.uposlenici u
    JOIN public.uloga ul ON ul.id_uloge = u.id_uloge
    WHERE u.id_uposlenika = auth.uid()
      AND lower(ul.naziv) IN ('administrator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.uposlenici u
    JOIN public.uloga ul ON ul.id_uloge = u.id_uloge
    WHERE u.id_uposlenika = auth.uid()
      AND lower(ul.naziv) IN ('administrator', 'admin')
  )
);

COMMIT;
