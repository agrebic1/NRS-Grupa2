/** Putanja na koju Supabase šalje korisnika nakon klika na link u emailu. */
export const AUTH_CALLBACK_PATH = '/auth/callback';

/**
 * Redirect URL za signup / resend — mora biti na Supabase allow-listi (Site URL + Redirect URLs).
 * Preferira NEXT_PUBLIC_SITE_URL da localhost/127.0.0.1 i produkcija budu konzistentni.
 */
export function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
    /\/$/,
    '',
  );
  if (configured) return configured;

  const legacy = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (legacy) return legacy;

  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '');
  }

  return '';
}

export function getAuthEmailRedirectUrl(): string {
  const origin = getAppBaseUrl();
  if (!origin) return '';
  return `${origin}${AUTH_CALLBACK_PATH}`;
}
