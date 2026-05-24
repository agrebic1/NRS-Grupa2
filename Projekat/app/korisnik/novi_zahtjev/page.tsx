import { redirect } from 'next/navigation';

/** Stara ruta - kanonski tok je petokoračni wizard na `/korisnik/zahtjevi/novi`. */
export default function NoviZahtjevPage() {
  redirect('/korisnik/zahtjevi/novi');
}
