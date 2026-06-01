import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') ?? '/auth/login';
  const origin = requestUrl.origin;

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const successUrl = new URL(next, origin);
      successUrl.searchParams.set('verified', '1');
      return NextResponse.redirect(successUrl);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const successUrl = new URL(next, origin);
      successUrl.searchParams.set('verified', '1');
      return NextResponse.redirect(successUrl);
    }
  }

  const errorUrl = new URL('/auth/login', origin);
  errorUrl.searchParams.set('error', 'potvrda_emaila');
  return NextResponse.redirect(errorUrl);
}
