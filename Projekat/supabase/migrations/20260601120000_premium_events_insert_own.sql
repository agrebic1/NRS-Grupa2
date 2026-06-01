BEGIN;

-- Korisnik usluge mora moći zapisati vlastite premium događaje (checkout, aktivacija, otkaz).
DROP POLICY IF EXISTS premium_events_insert_own ON public.premium_events;
CREATE POLICY premium_events_insert_own
ON public.premium_events
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (actor_user_id IS NULL OR actor_user_id = auth.uid())
);

-- Admin FOR ALL: eksplicitni WITH CHECK za INSERT/UPDATE (PG koristi USING samo za SELECT ako nije zadano).
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
