import { redirect } from 'next/navigation';

// Stara lokacija - preusmjerava na novu rutu
export default function StaraOdabirUlogePage() {
  redirect('/odabir-uloge');
}
