-- RLS za tim_intervencije (pomoćni serviseri na intervenciji).
-- Tabela je kreirana u 20260518000000_sprint9_workflow.sql ali RLS nikad nije bio omogućen,
-- pa je svaki authenticated korisnik mogao čitati/mijenjati članove timova preko Supabase klijenta.
--
-- Pristupni obrasci u aplikaciji:
--   - Dispečer (regularni/session klijent): GET/POST/DELETE u app/api/dispecer/zahtjevi/[id]/tim
--   - Serviser i dispečerski detalj/konflikti: čitaju preko admin (service role) klijenta → zaobilaze RLS
-- Stoga: dispečeru eksplicitno dozvoljavamo SELECT/INSERT/DELETE, serviseru SELECT (defense-in-depth),
-- a service role nastavlja raditi neometano.

ALTER TABLE public.tim_intervencije ENABLE ROW LEVEL SECURITY;

-- Čitanje: interno osoblje (dispečer ili serviser)
DROP POLICY IF EXISTS "tim_select_interno_osoblje" ON public.tim_intervencije;
CREATE POLICY "tim_select_interno_osoblje"
  ON public.tim_intervencije FOR SELECT
  TO authenticated
  USING (
    public.is_dispecer(auth.uid())
    OR public.is_serviser(auth.uid())
  );

-- Dodavanje člana tima: samo dispečer
DROP POLICY IF EXISTS "tim_insert_dispecer" ON public.tim_intervencije;
CREATE POLICY "tim_insert_dispecer"
  ON public.tim_intervencije FOR INSERT
  TO authenticated
  WITH CHECK (public.is_dispecer(auth.uid()));

-- Uklanjanje člana tima: samo dispečer
DROP POLICY IF EXISTS "tim_delete_dispecer" ON public.tim_intervencije;
CREATE POLICY "tim_delete_dispecer"
  ON public.tim_intervencije FOR DELETE
  TO authenticated
  USING (public.is_dispecer(auth.uid()));
