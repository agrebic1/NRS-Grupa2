'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthServis } from '@/lib/services/authServis';
import { SupabaseAuthRepozitorij } from '@/lib/repositories/authRepozitorij';

const authServis = new AuthServis(new SupabaseAuthRepozitorij());

export async function signIn(formData: FormData) {
  const { greska } = await authServis.prijava({
    email: formData.get('email') as string,
    lozinka: formData.get('password') as string,
  });

  if (greska) return { error: greska };

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUp(formData: FormData) {
  const { greska } = await authServis.registracija({
    email: formData.get('email') as string,
    lozinka: formData.get('password') as string,
    ime: formData.get('ime') as string,
    prezime: formData.get('prezime') as string,
    uloga: formData.get('uloga') as string,
  });

  if (greska) return { error: greska };

  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function signOut() {
  await authServis.odjava();
  revalidatePath('/', 'layout');
  redirect('/login');
}
