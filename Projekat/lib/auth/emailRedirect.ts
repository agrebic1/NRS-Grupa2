/** Putanja na koju Supabase šalje korisnika nakon klika na link u emailu. */
export const AUTH_CALLBACK_PATH = '/auth/callback';

/**
 * Redirect URL za signup / resend — mora biti na Supabase allow-listi (Site URL + Redirect URLs).
 * Preferira NEXT_PUBLIC_SITE_URL da localhost/127.0.0.1 i produkcija budu konzistentni.
 */
export function getAuthEmailRedirectUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  const origin =
    configured ||
    (typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '');

  if (!origin) return '';

  return `${origin}${AUTH_CALLBACK_PATH}`;
}
