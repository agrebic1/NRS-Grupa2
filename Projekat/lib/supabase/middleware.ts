import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(zahtjev: NextRequest) {
  let supabaseOdgovor = NextResponse.next({
    request: zahtjev,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Nedostaju Supabase environment varijable.');
    return {
      supabaseResponse: supabaseOdgovor,
      user: null,
    };
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return zahtjev.cookies.getAll();
      },

      setAll(
        kolaciciZaPostavljanje: {
          name: string;
          value: string;
          options: CookieOptions;
        }[],
      ) {
        kolaciciZaPostavljanje.forEach(({ name, value }) => {
          zahtjev.cookies.set(name, value);
        });

        supabaseOdgovor = NextResponse.next({
          request: zahtjev,
        });

        kolaciciZaPostavljanje.forEach(({ name, value, options }) => {
          supabaseOdgovor.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      supabaseResponse: supabaseOdgovor,
      user: null,
    };
  }

  return {
    supabaseResponse: supabaseOdgovor,
    user,
  };
}
