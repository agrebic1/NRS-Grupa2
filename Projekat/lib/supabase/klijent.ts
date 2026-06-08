import { createBrowserClient } from '@supabase/ssr';

// Generički tip <Database> je uklonjen jer uzrokuje TypeScript grešku
// s trenutnom verzijom generisanih Supabase tipova (problem s __InternalSupabase).
// Queries rade ispravno u runtimeu; regenerisati tipove uz `supabase gen types`
// kada baza bude u produkciji.
export function kreirajKlijenta() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
